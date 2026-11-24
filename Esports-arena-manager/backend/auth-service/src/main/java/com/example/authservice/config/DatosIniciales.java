package com.example.authservice.config;

import com.example.authservice.service.CuentaAccesoService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Cuentas de prueba (la contraseña se guarda como hash BCrypt). El perfil de cada una
 * vive en user-service y se enlaza por email en el primer login.
 * Se desactiva con APP_DATOS_INICIALES=false.
 */
@Configuration
@ConditionalOnProperty(name = "app.datos-iniciales", havingValue = "true", matchIfMissing = true)
public class DatosIniciales {
    @Bean
    CommandLineRunner cuentasDePrueba(CuentaAccesoService service) {
        return args -> {
            service.crearSiNoExiste("admin@arena.cl", "Admin Arena", "admin123", "ADMINISTRADOR");
            service.crearSiNoExiste("organizador@arena.cl", "Olivia Fuentes", "organiza123", "ORGANIZADOR");
            String[][] jugadores = {
                    {"camila.rojas@arena.cl", "Camila Rojas"},
                    {"ignacio.pizarro@arena.cl", "Ignacio Pizarro"},
                    {"fernanda.soto@arena.cl", "Fernanda Soto"},
                    {"benjamin.munoz@arena.cl", "Benjamín Muñoz"},
                    {"valentina.reyes@arena.cl", "Valentina Reyes"},
                    {"tomas.vidal@arena.cl", "Tomás Vidal"},
                    {"antonia.fuentes@arena.cl", "Antonia Fuentes"},
                    {"matias.contreras@arena.cl", "Matías Contreras"},
            };
            for (String[] j : jugadores) {
                service.crearSiNoExiste(j[0], j[1], "jugador123", "JUGADOR");
            }
        };
    }
}
