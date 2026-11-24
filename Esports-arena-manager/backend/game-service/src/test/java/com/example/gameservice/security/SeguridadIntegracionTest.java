package com.example.gameservice.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Prueba de integración de la seguridad (Spring Security + JWT + base H2):
 * GET es público, escribir exige token y rol ADMINISTRADOR.
 */
@SpringBootTest
@AutoConfigureMockMvc
class SeguridadIntegracionTest {
    private static final String JUEGO = """
            {"nombre":"Juego de Prueba %s","genero":"Puzzle","modalidad":"INDIVIDUAL","jugadoresPorEquipo":1}""";

    @Autowired private MockMvc mvc;
    @Value("${app.jwt.secreto}") private String secreto;

    @Test
    void listarJuegos_SinToken_EsPublico() throws Exception {
        mvc.perform(get("/api/v1/juegos")).andExpect(status().isOk());
    }

    @Test
    void crearJuego_SinToken_Responde401EnJson() throws Exception {
        mvc.perform(post("/api/v1/juegos").contentType(MediaType.APPLICATION_JSON).content(JUEGO.formatted("A")))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.mensaje").value("Sesión no válida o vencida"));
    }

    @Test
    void crearJuego_ConTokenAlterado_Responde401() throws Exception {
        // Token de JUGADOR al que se le pega el payload de un token de ADMINISTRADOR: la firma ya no coincide
        String[] jugador = token("JUGADOR", 60_000).split("\\.");
        String[] admin = token("ADMINISTRADOR", 60_000).split("\\.");
        String alterado = jugador[0] + "." + admin[1] + "." + jugador[2];
        mvc.perform(post("/api/v1/juegos").header("Authorization", "Bearer " + alterado)
                        .contentType(MediaType.APPLICATION_JSON).content(JUEGO.formatted("B")))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void crearJuego_ConTokenVencido_Responde401() throws Exception {
        mvc.perform(post("/api/v1/juegos").header("Authorization", "Bearer " + token("ADMINISTRADOR", -1_000))
                        .contentType(MediaType.APPLICATION_JSON).content(JUEGO.formatted("C")))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void crearJuego_ComoJugador_Responde403() throws Exception {
        mvc.perform(post("/api/v1/juegos").header("Authorization", "Bearer " + token("JUGADOR", 60_000))
                        .contentType(MediaType.APPLICATION_JSON).content(JUEGO.formatted("D")))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.mensaje").value("Sin permiso para esta acción"));
    }

    @Test
    void crudCompleto_ComoAdministrador_Funciona() throws Exception {
        String admin = "Bearer " + token("ADMINISTRADOR", 60_000);
        String respuesta = mvc.perform(post("/api/v1/juegos").header("Authorization", admin)
                        .contentType(MediaType.APPLICATION_JSON).content(JUEGO.formatted("E")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nombre").value("Juego de Prueba E"))
                .andReturn().getResponse().getContentAsString();
        String id = respuesta.replaceAll(".*\"id\":(\\d+).*", "$1");

        mvc.perform(put("/api/v1/juegos/" + id).header("Authorization", admin)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"reglasGenerales\":\"Nuevas reglas\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.reglasGenerales").value("Nuevas reglas"));

        mvc.perform(delete("/api/v1/juegos/" + id).header("Authorization", admin))
                .andExpect(status().isNoContent());

        mvc.perform(get("/api/v1/juegos/" + id)).andExpect(status().isNotFound());
    }

    private String token(String rol, long duracionMs) {
        long ahora = System.currentTimeMillis();
        return Jwts.builder()
                .subject("prueba@arena.cl")
                .claim("rol", rol)
                .claim("usuarioId", 1)
                .issuedAt(new Date(ahora))
                .expiration(new Date(ahora + duracionMs))
                .signWith(Keys.hmacShaKeyFor(secreto.getBytes(StandardCharsets.UTF_8)))
                .compact();
    }
}
