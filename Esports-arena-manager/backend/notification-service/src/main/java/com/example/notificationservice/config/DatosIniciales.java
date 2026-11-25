package com.example.notificationservice.config;

import com.example.notificationservice.model.Notificacion;
import com.example.notificationservice.repository.NotificacionRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Datos de prueba de notification-service. Solo se cargan si la tabla está vacía y app.datos-iniciales=true
 * (APP_DATOS_INICIALES). Los ids coinciden con los de los otros microservicios, que se cargan
 * en el mismo orden sobre una base nueva. Las fechas son relativas a hoy para que la demo siempre funcione.
 */
@Configuration
@ConditionalOnProperty(name = "app.datos-iniciales", havingValue = "true", matchIfMissing = true)
public class DatosIniciales {
    @Bean
    CommandLineRunner cargarDatos(NotificacionRepository repo) {
        return args -> {
            if (repo.count() > 0) return;
            guardar(repo, 3L, "INSCRIPCION", "Tu equipo Escuadrón Nocturno quedó inscrito en la Copa Arena Apertura.");
            guardar(repo, 6L, "SANCION", "Tienes una sanción vigente por lenguaje ofensivo en chat.");
            guardar(repo, 7L, "PARTIDA", "Runas del Alba juega la ronda 2 de la Liga de Runas Otoño.");
        };
    }

    private static void guardar(NotificacionRepository repo, Long usuarioId, String tipo, String mensaje) {
        Notificacion n = new Notificacion();
        n.setUsuarioId(usuarioId);
        n.setTipo(tipo);
        n.setMensaje(mensaje);
        repo.save(n);
    }
}
