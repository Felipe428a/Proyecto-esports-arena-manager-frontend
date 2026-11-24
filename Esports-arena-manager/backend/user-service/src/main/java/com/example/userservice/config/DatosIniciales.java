package com.example.userservice.config;

import com.example.userservice.model.Usuario;
import com.example.userservice.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Datos de prueba de user-service. Solo se cargan si la tabla está vacía y app.datos-iniciales=true
 * (APP_DATOS_INICIALES). Los ids coinciden con los de los otros microservicios, que se cargan
 * en el mismo orden sobre una base nueva. Las fechas son relativas a hoy para que la demo siempre funcione.
 */
@Configuration
@ConditionalOnProperty(name = "app.datos-iniciales", havingValue = "true", matchIfMissing = true)
public class DatosIniciales {
    @Bean
    CommandLineRunner cargarDatos(UsuarioRepository repo) {
        return args -> {
            if (repo.count() > 0) return;
            // id 1
            guardar(repo, "Admin Arena", "admin", "admin@arena.cl", "ADMINISTRADOR");
            // id 2
            guardar(repo, "Olivia Fuentes", "organiza", "organizador@arena.cl", "ORGANIZADOR");
            // id 3
            guardar(repo, "Camila Rojas", "camro", "camila.rojas@arena.cl", "JUGADOR");
            // id 4
            guardar(repo, "Ignacio Pizarro", "ignapz", "ignacio.pizarro@arena.cl", "JUGADOR");
            // id 5
            guardar(repo, "Fernanda Soto", "fersoto", "fernanda.soto@arena.cl", "JUGADOR");
            // id 6
            guardar(repo, "Benjamín Muñoz", "benmz", "benjamin.munoz@arena.cl", "JUGADOR");
            // id 7
            guardar(repo, "Valentina Reyes", "valreyes", "valentina.reyes@arena.cl", "JUGADOR");
            // id 8
            guardar(repo, "Tomás Vidal", "tvidal", "tomas.vidal@arena.cl", "JUGADOR");
            // id 9
            guardar(repo, "Antonia Fuentes", "antof", "antonia.fuentes@arena.cl", "JUGADOR");
            // id 10
            guardar(repo, "Matías Contreras", "maticon", "matias.contreras@arena.cl", "JUGADOR");
            // id 11
            guardar(repo, "Rocío Álvarez", "rocioa", "rocio.alvarez@arena.cl", "JUGADOR");
            // id 12
            guardar(repo, "Elías Bravo", "ebravo", "elias.bravo@arena.cl", "JUGADOR");
            // id 13
            guardar(repo, "Diego Lagos", "dlagos", "diego.lagos@arena.cl", "JUGADOR");
            // id 14
            guardar(repo, "Sofía Paredes", "sofip", "sofia.paredes@arena.cl", "JUGADOR");
            // id 15
            guardar(repo, "Martín Rivas", "mrivas", "martin.rivas@arena.cl", "JUGADOR");
        };
    }

    private static void guardar(UsuarioRepository repo, String nombre, String nickname, String email, String rol) {
        Usuario u = new Usuario();
        u.setNombre(nombre);
        u.setNickname(nickname);
        u.setEmail(email);
        u.setRol(rol);
        repo.save(u);
    }
}
