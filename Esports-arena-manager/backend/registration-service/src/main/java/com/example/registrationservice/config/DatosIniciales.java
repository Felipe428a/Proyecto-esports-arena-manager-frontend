package com.example.registrationservice.config;

import com.example.registrationservice.model.Inscripcion;
import com.example.registrationservice.repository.InscripcionRepository;
import java.time.LocalDateTime;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Datos de prueba de registration-service. Solo se cargan si la tabla está vacía y app.datos-iniciales=true
 * (APP_DATOS_INICIALES). Los ids coinciden con los de los otros microservicios, que se cargan
 * en el mismo orden sobre una base nueva. Las fechas son relativas a hoy para que la demo siempre funcione.
 */
@Configuration
@ConditionalOnProperty(name = "app.datos-iniciales", havingValue = "true", matchIfMissing = true)
public class DatosIniciales {
    @Bean
    CommandLineRunner cargarDatos(InscripcionRepository repo) {
        return args -> {
            if (repo.count() > 0) return;
            LocalDateTime ahora = LocalDateTime.now();
            equipo(repo, 1L, 1L, ahora.minusDays(3));     // Escuadrón Nocturno -> Copa Arena Apertura
            equipo(repo, 2L, 2L, ahora.minusDays(30));    // Runas del Alba -> Liga de Runas Otoño
            equipo(repo, 2L, 4L, ahora.minusDays(28));    // Vanguardia Escarlata -> Liga de Runas Otoño
            jugador(repo, 3L, 9L, ahora.minusDays(2));    // Antonia -> Gran Premio
            jugador(repo, 3L, 10L, ahora.minusDays(1));   // Matías -> Gran Premio
            jugador(repo, 4L, 8L, ahora.minusDays(70));   // Tomás -> Puños de Invierno
            jugador(repo, 4L, 11L, ahora.minusDays(69));  // Rocío -> Puños de Invierno
            jugador(repo, 4L, 12L, ahora.minusDays(68));  // Elías -> Puños de Invierno
        };
    }

    private static void equipo(InscripcionRepository repo, Long torneoId, Long equipoId, LocalDateTime fecha) {
        Inscripcion i = new Inscripcion();
        i.setTorneoId(torneoId);
        i.setEquipoId(equipoId);
        i.setTipoParticipante("EQUIPO");
        i.setFechaInscripcion(fecha);
        repo.save(i);
    }

    private static void jugador(InscripcionRepository repo, Long torneoId, Long jugadorId, LocalDateTime fecha) {
        Inscripcion i = new Inscripcion();
        i.setTorneoId(torneoId);
        i.setJugadorId(jugadorId);
        i.setTipoParticipante("INDIVIDUAL");
        i.setFechaInscripcion(fecha);
        repo.save(i);
    }
}
