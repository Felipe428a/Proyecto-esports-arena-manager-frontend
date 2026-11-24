package com.example.sanctionservice.config;

import com.example.sanctionservice.model.Sancion;
import com.example.sanctionservice.repository.SancionRepository;
import java.time.LocalDate;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Datos de prueba de sanction-service. Solo se cargan si la tabla está vacía y app.datos-iniciales=true
 * (APP_DATOS_INICIALES). Los ids coinciden con los de los otros microservicios, que se cargan
 * en el mismo orden sobre una base nueva. Las fechas son relativas a hoy para que la demo siempre funcione.
 */
@Configuration
@ConditionalOnProperty(name = "app.datos-iniciales", havingValue = "true", matchIfMissing = true)
public class DatosIniciales {
    @Bean
    CommandLineRunner cargarDatos(SancionRepository repo) {
        return args -> {
            if (repo.count() > 0) return;
            LocalDate hoy = LocalDate.now();
            guardar(repo, 3L, "Ausencia sin aviso", hoy.minusDays(130), hoy.minusDays(120), "CERRADA", "LEVE");        // Camila, cumplida
            guardar(repo, 6L, "Lenguaje ofensivo en chat", hoy.minusDays(5), hoy.plusDays(30), "ACTIVA", "BLOQUEANTE"); // Benjamín, vigente
        };
    }

    private static void guardar(SancionRepository repo, Long usuarioId, String motivo, LocalDate inicio, LocalDate fin, String estado, String severidad) {
        Sancion s = new Sancion();
        s.setUsuarioId(usuarioId);
        s.setMotivo(motivo);
        s.setFechaInicio(inicio);
        s.setFechaFin(fin);
        s.setEstado(estado);
        s.setSeveridad(severidad);
        repo.save(s);
    }
}
