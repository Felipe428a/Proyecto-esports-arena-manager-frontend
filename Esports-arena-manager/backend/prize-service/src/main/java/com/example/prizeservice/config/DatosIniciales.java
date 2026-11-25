package com.example.prizeservice.config;

import com.example.prizeservice.model.Premio;
import com.example.prizeservice.repository.PremioRepository;
import java.math.BigDecimal;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Datos de prueba de prize-service. Solo se cargan si la tabla está vacía y app.datos-iniciales=true
 * (APP_DATOS_INICIALES). Los ids coinciden con los de los otros microservicios, que se cargan
 * en el mismo orden sobre una base nueva. Las fechas son relativas a hoy para que la demo siempre funcione.
 */
@Configuration
@ConditionalOnProperty(name = "app.datos-iniciales", havingValue = "true", matchIfMissing = true)
public class DatosIniciales {
    @Bean
    CommandLineRunner cargarDatos(PremioRepository repo) {
        return args -> {
            if (repo.count() > 0) return;
            guardar(repo, 4L, 1, "Trofeo Arena", 300000);
            guardar(repo, 4L, 2, "Medalla de plata", 150000);
            guardar(repo, 4L, 3, "Medalla de bronce", 80000);
            guardar(repo, 5L, 1, "Trofeo Nocturno", 200000);
            guardar(repo, 5L, 2, "Premio en efectivo", 90000);
            guardar(repo, 1L, 1, "Trofeo de Apertura", 250000);
        };
    }

    private static void guardar(PremioRepository repo, Long torneoId, int posicion, String descripcion, long valor) {
        Premio p = new Premio();
        p.setTorneoId(torneoId);
        p.setPosicion(posicion);
        p.setDescripcion(descripcion);
        p.setValor(BigDecimal.valueOf(valor));
        repo.save(p);
    }
}
