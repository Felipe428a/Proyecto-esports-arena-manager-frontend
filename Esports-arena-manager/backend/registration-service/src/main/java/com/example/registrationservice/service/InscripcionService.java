package com.example.registrationservice.service;

import com.example.registrationservice.dto.InscripcionDtos.EstadoRequest;
import com.example.registrationservice.dto.InscripcionDtos.InscripcionRequest;
import com.example.registrationservice.client.SanctionClient;
import com.example.registrationservice.client.TeamClient;
import com.example.registrationservice.client.TournamentClient;
import com.example.registrationservice.client.UserClient;
import com.example.registrationservice.model.Inscripcion;
import com.example.registrationservice.repository.InscripcionRepository;
import com.example.registrationservice.security.UsuarioActual;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service
public class InscripcionService {
    private final InscripcionRepository repository;
    private final TournamentClient tournamentClient;
    private final TeamClient teamClient;
    private final UserClient userClient;
    private final SanctionClient sanctionClient;
    public InscripcionService(InscripcionRepository repository, TournamentClient tournamentClient, TeamClient teamClient, UserClient userClient, SanctionClient sanctionClient) {
        this.repository = repository;
        this.tournamentClient = tournamentClient;
        this.teamClient = teamClient;
        this.userClient = userClient;
        this.sanctionClient = sanctionClient;
    }

    public Inscripcion crear(InscripcionRequest request) {
        var torneo = tournamentClient.buscar(request.torneoId());
        // Los datos reales vienen de tournament-service. Los campos opcionales del request solo pueden
        // endurecer la regla (nunca saltársela): así nadie se inscribe en un torneo cerrado enviando "torneoAbierto": true.
        boolean abierto = "ABIERTO".equalsIgnoreCase(torneo.estado()) && !Boolean.FALSE.equals(request.torneoAbierto());
        LocalDateTime cierre = torneo.fechaCierreInscripcion();
        if (request.fechaCierreInscripcion() != null && request.fechaCierreInscripcion().isBefore(cierre)) cierre = request.fechaCierreInscripcion();
        int cupo = request.cupoMaximo() == null ? torneo.cupoMaximo() : Math.min(torneo.cupoMaximo(), request.cupoMaximo());
        if (!abierto || LocalDateTime.now().isAfter(cierre)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No inscribir fuera de plazo");
        if (Boolean.TRUE.equals(request.participanteSancionado())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No inscribir participante sancionado");
        long ocupados = repository.findAll().stream().filter(i -> Objects.equals(i.getTorneoId(), request.torneoId())).filter(i -> !"CANCELADA".equals(i.getEstado())).count();
        if (ocupados >= cupo) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No superar cupos");

        Inscripcion i = new Inscripcion();
        i.setTorneoId(request.torneoId());
        i.setTipoParticipante(request.tipoParticipante().toUpperCase());
        validarModalidad(torneo.modalidad(), i.getTipoParticipante());
        if ("INDIVIDUAL".equals(i.getTipoParticipante())) {
            if (request.jugadorId() == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "jugadorId obligatorio");
            if (!Boolean.TRUE.equals(userClient.puedeCompetir(request.jugadorId()).get("puedeCompetir"))) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Usuario sancionado o inactivo no puede competir");
            if (Boolean.TRUE.equals(sanctionClient.bloqueo(request.jugadorId(), null).get("bloqueaInscripcion"))) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Participante con sancion activa bloqueante");
            if (UsuarioActual.obtener().isPresent() && !UsuarioActual.esStaff() && !UsuarioActual.esUsuario(request.jugadorId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Solo puedes inscribirte a ti mismo");
            }
            validarDuplicado(request.torneoId(), request.jugadorId(), null);
            i.setJugadorId(request.jugadorId());
        } else {
            if (request.equipoId() == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "equipoId obligatorio");
            if (!Boolean.TRUE.equals(teamClient.puedeInscribirse(request.equipoId()).get("puedeInscribirse"))) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Equipo inactivo o sin integrantes suficientes");
            if (Boolean.TRUE.equals(sanctionClient.bloqueo(null, request.equipoId()).get("bloqueaInscripcion"))) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Equipo con sancion activa bloqueante");
            validarCapitanOStaff(request.equipoId());
            validarJuegoDelEquipo(torneo.juegoId(), request.equipoId());
            validarDuplicado(request.torneoId(), null, request.equipoId());
            i.setEquipoId(request.equipoId());
        }
        return repository.save(i);
    }

    public List<Inscripcion> listar(Long torneoId, Long equipoId, Long jugadorId) {
        return repository.findAll().stream()
                .filter(i -> torneoId == null || Objects.equals(i.getTorneoId(), torneoId))
                .filter(i -> equipoId == null || Objects.equals(i.getEquipoId(), equipoId))
                .filter(i -> jugadorId == null || Objects.equals(i.getJugadorId(), jugadorId))
                .toList();
    }

    public Inscripcion buscar(Long id) { return repository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Inscripcion no encontrada")); }
    public Inscripcion actualizarEstado(Long id, EstadoRequest request) { Inscripcion i = buscar(id); i.setEstado(request.estado().toUpperCase()); return repository.save(i); }
    public Inscripcion cancelar(Long id) { Inscripcion i = buscar(id); validarDuenoOStaff(i); i.setEstado("CANCELADA"); return repository.save(i); }

    /** Un torneo por equipos solo recibe equipos, y uno individual solo jugadores. */
    private void validarModalidad(String modalidadTorneo, String tipo) {
        if (modalidadTorneo == null) return;
        boolean porEquipos = "EQUIPOS".equalsIgnoreCase(modalidadTorneo);
        if (porEquipos && "INDIVIDUAL".equals(tipo)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Este torneo es por equipos: inscribe a tu equipo");
        if (!porEquipos && !"INDIVIDUAL".equals(tipo)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Este torneo es individual: inscríbete como jugador");
    }

    /** El equipo debe competir en el mismo juego del torneo. */
    private void validarJuegoDelEquipo(Long juegoTorneo, Long equipoId) {
        if (juegoTorneo == null) return;
        var equipo = teamClient.buscar(equipoId);
        if (equipo != null && equipo.juegoPrincipalId() != null && !juegoTorneo.equals(equipo.juegoPrincipalId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El equipo no compite en el juego de este torneo");
        }
    }

    /** Solo el capitán inscribe a su equipo (o un organizador/administrador). */
    private void validarCapitanOStaff(Long equipoId) {
        if (UsuarioActual.obtener().isEmpty() || UsuarioActual.esStaff()) return;
        var equipo = teamClient.buscar(equipoId);
        if (!UsuarioActual.esUsuario(equipo.capitanId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Solo el capitán puede inscribir al equipo");
        }
    }

    private void validarDuenoOStaff(Inscripcion i) {
        if (UsuarioActual.obtener().isEmpty() || UsuarioActual.esStaff()) return;
        if (i.getJugadorId() != null && UsuarioActual.esUsuario(i.getJugadorId())) return;
        if (i.getEquipoId() != null) { validarCapitanOStaff(i.getEquipoId()); return; }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Solo puedes cancelar tus propias inscripciones");
    }

    private void validarDuplicado(Long torneoId, Long jugadorId, Long equipoId) {
        boolean existe = repository.findAll().stream().filter(i -> !"CANCELADA".equals(i.getEstado()))
                .anyMatch(i -> Objects.equals(i.getTorneoId(), torneoId) && (jugadorId != null && Objects.equals(i.getJugadorId(), jugadorId) || equipoId != null && Objects.equals(i.getEquipoId(), equipoId)));
        if (existe) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No duplicar inscripcion en el mismo torneo");
    }

    public void eliminar(Long id) { repository.delete(buscar(id)); }
}
