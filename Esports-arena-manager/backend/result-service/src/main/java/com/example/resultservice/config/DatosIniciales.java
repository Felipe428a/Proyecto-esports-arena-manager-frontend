package com.example.resultservice.config;

import com.example.resultservice.model.Resultado;
import com.example.resultservice.repository.ResultadoRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Datos de prueba de result-service. Solo se cargan si la tabla está vacía y app.datos-iniciales=true
 * (APP_DATOS_INICIALES). Los ids coinciden con los de los otros microservicios, que se cargan
 * en el mismo orden sobre una base nueva. Las fechas son relativas a hoy para que la demo siempre funcione.
 */
@Configuration
@ConditionalOnProperty(name = "app.datos-iniciales", havingValue = "true", matchIfMissing = true)
public class DatosIniciales {
    @Bean
    CommandLineRunner cargarDatos(ResultadoRepository repo) {
        return args -> {
            if (repo.count() > 0) return;
            guardar(repo, 1L, 2L, 2, 1);   // Runas del Alba 2 - 1 Vanguardia Escarlata
            guardar(repo, 3L, 8L, 3, 1);   // Tomás 3 - 1 Rocío
            guardar(repo, 4L, 12L, 2, 3);  // Tomás 2 - 3 Elías
        };
    }

    private static void guardar(ResultadoRepository repo, Long partidaId, Long ganadorId, int a, int b) {
        Resultado r = new Resultado();
        r.setPartidaId(partidaId);
        r.setGanadorId(ganadorId);
        r.setPuntajeA(a);
        r.setPuntajeB(b);
        r.setEstadoValidacion("VALIDADO");
        r.setEvidencia("Registro oficial del organizador");
        repo.save(r);
    }
}
