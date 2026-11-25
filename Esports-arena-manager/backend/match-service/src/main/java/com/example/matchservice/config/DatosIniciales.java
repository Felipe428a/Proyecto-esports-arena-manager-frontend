package com.example.matchservice.config;

import com.example.matchservice.model.Partida;
import com.example.matchservice.repository.PartidaRepository;
import java.time.LocalDate;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Datos de prueba de match-service. Solo se cargan si la tabla está vacía y app.datos-iniciales=true
 * (APP_DATOS_INICIALES). Los ids coinciden con los de los otros microservicios, que se cargan
 * en el mismo orden sobre una base nueva. Las fechas son relativas a hoy para que la demo siempre funcione.
 */
@Configuration
@ConditionalOnProperty(name = "app.datos-iniciales", havingValue = "true", matchIfMissing = true)
public class DatosIniciales {
    @Bean
    CommandLineRunner cargarDatos(PartidaRepository repo) {
        return args -> {
            if (repo.count() > 0) return;
            LocalDate hoy = LocalDate.now();
            guardar(repo, 2L, 2L, 4L, 1, hoy.minusDays(10), 18, "FINALIZADA");   // id 1 · Runas del Alba vs Vanguardia Escarlata
            guardar(repo, 2L, 2L, 4L, 2, hoy.plusDays(5), 18, "PROGRAMADA");     // id 2 · revancha
            guardar(repo, 4L, 8L, 11L, 1, hoy.minusDays(50), 15, "FINALIZADA");  // id 3 · Tomás vs Rocío
            guardar(repo, 4L, 8L, 12L, 2, hoy.minusDays(50), 17, "FINALIZADA");  // id 4 · Tomás vs Elías
        };
    }

    private static void guardar(PartidaRepository repo, Long torneoId, Long a, Long b, int ronda, LocalDate dia, int hora, String estado) {
        Partida p = new Partida();
        p.setTorneoId(torneoId);
        p.setParticipanteAId(a);
        p.setParticipanteBId(b);
        p.setRonda(ronda);
        p.setFechaHora(dia.atTime(hora, 0));
        p.setEstado(estado);
        repo.save(p);
    }
}
