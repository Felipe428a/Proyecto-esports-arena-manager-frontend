package com.example.teamservice.config;

import com.example.teamservice.model.Equipo;
import com.example.teamservice.model.MiembroEquipo;
import com.example.teamservice.repository.EquipoRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Datos de prueba de team-service. Solo se cargan si la tabla está vacía y app.datos-iniciales=true
 * (APP_DATOS_INICIALES). Los ids coinciden con los de los otros microservicios, que se cargan
 * en el mismo orden sobre una base nueva. Las fechas son relativas a hoy para que la demo siempre funcione.
 */
@Configuration
@ConditionalOnProperty(name = "app.datos-iniciales", havingValue = "true", matchIfMissing = true)
public class DatosIniciales {
    @Bean
    CommandLineRunner cargarDatos(EquipoRepository repo) {
        return args -> {
            if (repo.count() > 0) return;
            // ids de usuario: ver user-service (3 Camila, 4 Ignacio, 5 Fernanda, 6 Benjamín, 7 Valentina, ...)
            guardar(repo, "Escuadrón Nocturno", 1L, 5L, "ACTIVO", new Object[][]{{3L, "Asaltante"}, {4L, "Francotirador"}, {5L, "CAPITAN"}});      // id 1
            guardar(repo, "Runas del Alba", 2L, 7L, "ACTIVO", new Object[][]{{6L, "Línea superior"}, {7L, "CAPITAN"}, {14L, "Soporte"}});        // id 2
            guardar(repo, "Pista Roja Racing", 3L, 9L, "INACTIVO", new Object[][]{{9L, "CAPITAN"}, {10L, "Piloto suplente"}});                    // id 3
            guardar(repo, "Vanguardia Escarlata", 2L, 13L, "ACTIVO", new Object[][]{{13L, "CAPITAN"}, {15L, "Jungla"}, {11L, "Línea central"}});  // id 4
        };
    }

    private static void guardar(EquipoRepository repo, String nombre, Long juegoId, Long capitanId, String estado, Object[][] miembros) {
        Equipo e = new Equipo();
        e.setNombre(nombre);
        e.setJuegoPrincipalId(juegoId);
        e.setCapitanId(capitanId);
        e.setEstado(estado);
        for (Object[] m : miembros) {
            MiembroEquipo miembro = new MiembroEquipo();
            miembro.setEquipo(e);
            miembro.setUsuarioId((Long) m[0]);
            miembro.setRolDentroEquipo((String) m[1]);
            miembro.setEstado(estado);
            e.getIntegrantes().add(miembro);
        }
        repo.save(e);
    }
}
