package com.example.tournamentservice.config;

import com.example.tournamentservice.model.Torneo;
import com.example.tournamentservice.repository.TorneoRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Datos de prueba de tournament-service. Solo se cargan si la tabla está vacía y app.datos-iniciales=true
 * (APP_DATOS_INICIALES). Los ids coinciden con los de los otros microservicios, que se cargan
 * en el mismo orden sobre una base nueva. Las fechas son relativas a hoy para que la demo siempre funcione.
 */
@Configuration
@ConditionalOnProperty(name = "app.datos-iniciales", havingValue = "true", matchIfMissing = true)
public class DatosIniciales {
    @Bean
    CommandLineRunner cargarDatos(TorneoRepository repo) {
        return args -> {
            if (repo.count() > 0) return;
            LocalDate hoy = LocalDate.now();
            guardar(repo, "Copa Arena Apertura", 1L, "ABIERTO", 8, "EQUIPOS", hoy.plusDays(14), hoy.plusDays(21), hoy.plusDays(23),
                    "Torneo de apertura de temporada para equipos de Cripta Cero, formato de eliminación directa.");            // id 1
            guardar(repo, "Liga de Runas Otoño", 2L, "EN_CURSO", 6, "EQUIPOS", hoy.minusDays(20), hoy.minusDays(10), hoy.plusDays(20),
                    "Fase de grupos seguida de semifinales y final para equipos de Trono de Runas.");                             // id 2
            guardar(repo, "Gran Premio Velocidad Máxima", 3L, "ABIERTO", 12, "INDIVIDUAL", hoy.plusDays(10), hoy.plusDays(17), hoy.plusDays(18),
                    "Clasificatoria individual con parrilla de 12 pilotos rumbo al campeonato regional.");                        // id 3
            guardar(repo, "Torneo Puños de Invierno", 4L, "FINALIZADO", 16, "INDIVIDUAL", hoy.minusDays(60), hoy.minusDays(50), hoy.minusDays(49),
                    "Bracket individual a doble eliminación para jugadores de Puños de Acero.");                                   // id 4
            guardar(repo, "Clásico Nocturno Cripta Cero", 1L, "FINALIZADO", 4, "EQUIPOS", hoy.minusDays(90), hoy.minusDays(85), hoy.minusDays(84),
                    "Torneo relámpago de fin de semana entre equipos invitados.");                                                 // id 5
            guardar(repo, "Copa Runas Rápidas", 2L, "ABIERTO", 8, "EQUIPOS", hoy.plusDays(25), hoy.plusDays(32), hoy.plusDays(33),
                    "Formato exprés a un solo mapa por enfrentamiento, ideal para equipos nuevos.");                               // id 6
        };
    }

    private static void guardar(TorneoRepository repo, String nombre, Long juegoId, String estado, int cupo, String modalidad,
                                LocalDate cierre, LocalDate inicio, LocalDate fin, String descripcion) {
        Torneo t = new Torneo();
        t.setNombre(nombre);
        t.setJuegoId(juegoId);
        t.setEstado(estado);
        t.setCupoMaximo(cupo);
        t.setModalidad(modalidad);
        t.setFechaCierreInscripcion(cierre.atTime(23, 59));
        t.setFechaInicio(inicio.atTime(18, 0));
        t.setFechaFin(fin.atTime(22, 0));
        t.setDescripcion(descripcion);
        repo.save(t);
    }
}
