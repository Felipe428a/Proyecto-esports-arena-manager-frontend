package com.example.rankingservice.config;

import com.example.rankingservice.model.Ranking;
import com.example.rankingservice.repository.RankingRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Datos de prueba de ranking-service. Solo se cargan si la tabla está vacía y app.datos-iniciales=true
 * (APP_DATOS_INICIALES). Los ids coinciden con los de los otros microservicios, que se cargan
 * en el mismo orden sobre una base nueva. Las fechas son relativas a hoy para que la demo siempre funcione.
 */
@Configuration
@ConditionalOnProperty(name = "app.datos-iniciales", havingValue = "true", matchIfMissing = true)
public class DatosIniciales {
    @Bean
    CommandLineRunner cargarDatos(RankingRepository repo) {
        return args -> {
            if (repo.count() > 0) return;
            guardar(repo, 2L, 2L, 3, 1, 0, 1, 1, false);   // Liga de Runas: Runas del Alba
            guardar(repo, 2L, 4L, 0, 0, 1, -1, 2, false);  // Liga de Runas: Vanguardia Escarlata
            guardar(repo, 4L, 12L, 3, 1, 0, 1, 1, true);   // Puños de Invierno: Elías
            guardar(repo, 4L, 8L, 3, 1, 1, 1, 2, true);    // Puños de Invierno: Tomás
            guardar(repo, 4L, 11L, 0, 0, 1, -2, 3, true);  // Puños de Invierno: Rocío
        };
    }

    private static void guardar(RankingRepository repo, Long torneoId, Long participanteId, int puntos, int victorias,
                                int derrotas, int diferencia, int posicion, boolean cerrado) {
        Ranking r = new Ranking();
        r.setTorneoId(torneoId);
        r.setParticipanteId(participanteId);
        r.setPuntos(puntos);
        r.setVictorias(victorias);
        r.setDerrotas(derrotas);
        r.setDiferencia(diferencia);
        r.setPosicion(posicion);
        r.setCerrado(cerrado);
        repo.save(r);
    }
}
