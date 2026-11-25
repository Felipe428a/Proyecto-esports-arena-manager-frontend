package com.example.gameservice.config;

import com.example.gameservice.model.Juego;
import com.example.gameservice.repository.JuegoRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Datos de prueba de game-service. Solo se cargan si la tabla está vacía y app.datos-iniciales=true
 * (APP_DATOS_INICIALES). Los ids coinciden con los de los otros microservicios, que se cargan
 * en el mismo orden sobre una base nueva. Las fechas son relativas a hoy para que la demo siempre funcione.
 */
@Configuration
@ConditionalOnProperty(name = "app.datos-iniciales", havingValue = "true", matchIfMissing = true)
public class DatosIniciales {
    @Bean
    CommandLineRunner cargarDatos(JuegoRepository repo) {
        return args -> {
            if (repo.count() > 0) return;
            guardar(repo, "Cripta Cero", "Shooter táctico", "EQUIPOS", 3, "Mejor de 3 mapas. Se juega con 3 integrantes por equipo.");   // id 1
            guardar(repo, "Trono de Runas", "MOBA", "EQUIPOS", 3, "Partidas a una sola ronda con selección alternada.");              // id 2
            guardar(repo, "Velocidad Máxima", "Carreras", "INDIVIDUAL", 1, "Clasificatoria por tiempo y carrera final de 12 pilotos.");  // id 3
            guardar(repo, "Puños de Acero", "Lucha", "INDIVIDUAL", 1, "Combates al mejor de 5 rounds, doble eliminación.");              // id 4
        };
    }

    private static void guardar(JuegoRepository repo, String nombre, String genero, String modalidad, int jugadores, String reglas) {
        Juego j = new Juego();
        j.setNombre(nombre);
        j.setGenero(genero);
        j.setModalidad(modalidad);
        j.setJugadoresPorEquipo(jugadores);
        j.setReglasGenerales(reglas);
        repo.save(j);
    }
}
