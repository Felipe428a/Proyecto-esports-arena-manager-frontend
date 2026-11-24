package com.example.authservice.security;

import com.example.authservice.model.CuentaAcceso;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.security.SignatureException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Base64;

import static org.junit.jupiter.api.Assertions.*;

/** Generación y verificación de JWT: claims, firma y vencimiento. */
class JwtServiceTest {
    private static final String SECRETO = "clave-de-pruebas-esports-arena-manager-de-32-bytes-o-mas";
    private CuentaAcceso cuenta;

    @BeforeEach
    void setUp() {
        cuenta = new CuentaAcceso();
        cuenta.setId(7L);
        cuenta.setUsuarioId(3L);
        cuenta.setEmail("camila.rojas@arena.cl");
        cuenta.setNombre("Camila Rojas");
        cuenta.setRol("JUGADOR");
    }

    @Test
    void emitir_DebeIncluirSubRolYVencimiento() {
        JwtService servicio = new JwtService(SECRETO, 60_000);

        JwtService.TokenEmitido emitido = servicio.emitir(cuenta);
        Claims datos = servicio.validar(emitido.token());

        assertEquals("camila.rojas@arena.cl", datos.getSubject());
        assertEquals("JUGADOR", datos.get("rol", String.class));
        assertEquals(3, ((Number) datos.get("usuarioId")).intValue());
        assertTrue(emitido.expiraEn() > System.currentTimeMillis());
        assertEquals(3, emitido.token().split("\\.").length, "header.payload.firma");
    }

    @Test
    void validar_PayloadAlterado_DebeRechazarse() {
        JwtService servicio = new JwtService(SECRETO, 60_000);
        String[] partes = servicio.emitir(cuenta).token().split("\\.");
        // Un atacante cambia su rol a ADMINISTRADOR sin conocer el secreto
        String payload = new String(Base64.getUrlDecoder().decode(partes[1])).replace("JUGADOR", "ADMINISTRADOR");
        String alterado = partes[0] + "." + Base64.getUrlEncoder().withoutPadding().encodeToString(payload.getBytes()) + "." + partes[2];

        assertThrows(SignatureException.class, () -> servicio.validar(alterado));
    }

    @Test
    void validar_TokenVencido_DebeRechazarse() {
        JwtService servicio = new JwtService(SECRETO, -1_000); // ya nace vencido
        String token = servicio.emitir(cuenta).token();

        assertThrows(ExpiredJwtException.class, () -> servicio.validar(token));
    }

    @Test
    void validar_FirmadoConOtroSecreto_DebeRechazarse() {
        String token = new JwtService("otro-secreto-distinto-de-al-menos-32-bytes!!", 60_000).emitir(cuenta).token();

        assertThrows(SignatureException.class, () -> new JwtService(SECRETO, 60_000).validar(token));
    }

    @Test
    void constructor_SecretoCorto_DebeFallarAlArrancar() {
        assertThrows(IllegalStateException.class, () -> new JwtService("corto", 60_000));
    }
}
