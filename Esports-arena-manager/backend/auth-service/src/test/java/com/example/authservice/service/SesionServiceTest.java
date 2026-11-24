package com.example.authservice.service;

import com.example.authservice.dto.AuthDtos.SesionResponse;
import com.example.authservice.model.CuentaAcceso;
import com.example.authservice.model.RefreshToken;
import com.example.authservice.repository.RefreshTokenRepository;
import com.example.authservice.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/** Renovación segura de la sesión con refresh token (rotación y revocación). */
@ExtendWith(MockitoExtension.class)
class SesionServiceTest {
    @Mock private RefreshTokenRepository refreshRepository;
    @Mock private CuentaAccesoService cuentaService;

    private SesionService sesionService;
    private CuentaAcceso cuenta;

    @BeforeEach
    void setUp() {
        JwtService jwt = new JwtService("clave-de-pruebas-esports-arena-manager-de-32-bytes-o-mas", 60_000);
        sesionService = new SesionService(jwt, refreshRepository, cuentaService, 3_600_000);
        cuenta = new CuentaAcceso();
        cuenta.setId(1L);
        cuenta.setUsuarioId(3L);
        cuenta.setEmail("camila.rojas@arena.cl");
        cuenta.setNombre("Camila Rojas");
        cuenta.setRol("JUGADOR");
    }

    @Test
    void iniciar_DebeEntregarAccessYRefreshToken() {
        SesionResponse sesion = sesionService.iniciar(cuenta);

        assertNotNull(sesion.token());
        assertNotNull(sesion.refreshToken());
        assertEquals("Bearer", sesion.tipo());
        assertEquals(3L, sesion.usuario().id());
        assertEquals("JUGADOR", sesion.usuario().rol());
        verify(refreshRepository).save(any(RefreshToken.class));
    }

    @Test
    void renovar_RefreshVigente_DebeRevocarElAnteriorYEntregarUnoNuevo() {
        RefreshToken actual = refresh("abc", Instant.now().plusSeconds(600), false);
        when(refreshRepository.findByToken("abc")).thenReturn(Optional.of(actual));
        when(cuentaService.buscar(1L)).thenReturn(cuenta);
        when(cuentaService.enlazarPerfil(cuenta)).thenReturn(cuenta);

        SesionResponse nueva = sesionService.renovar("abc");

        assertTrue(actual.isRevocado(), "el refresh usado queda revocado (rotación)");
        assertNotEquals("abc", nueva.refreshToken());
        assertNotNull(nueva.token());
    }

    @Test
    void renovar_RefreshRevocado_DebeResponder401() {
        when(refreshRepository.findByToken("usado")).thenReturn(Optional.of(refresh("usado", Instant.now().plusSeconds(600), true)));

        ResponseStatusException e = assertThrows(ResponseStatusException.class, () -> sesionService.renovar("usado"));
        assertEquals(HttpStatus.UNAUTHORIZED, e.getStatusCode());
    }

    @Test
    void renovar_RefreshVencido_DebeResponder401() {
        when(refreshRepository.findByToken("viejo")).thenReturn(Optional.of(refresh("viejo", Instant.now().minusSeconds(1), false)));

        ResponseStatusException e = assertThrows(ResponseStatusException.class, () -> sesionService.renovar("viejo"));
        assertEquals(HttpStatus.UNAUTHORIZED, e.getStatusCode());
    }

    @Test
    void renovar_CuentaDesactivada_DebeResponder401() {
        cuenta.setEstado("DESACTIVADO");
        when(refreshRepository.findByToken("abc")).thenReturn(Optional.of(refresh("abc", Instant.now().plusSeconds(600), false)));
        when(cuentaService.buscar(1L)).thenReturn(cuenta);

        assertThrows(ResponseStatusException.class, () -> sesionService.renovar("abc"));
    }

    @Test
    void cerrar_DebeRevocarElRefreshToken() {
        RefreshToken actual = refresh("abc", Instant.now().plusSeconds(600), false);
        when(refreshRepository.findByToken("abc")).thenReturn(Optional.of(actual));

        sesionService.cerrar("abc");

        assertTrue(actual.isRevocado());
    }

    private RefreshToken refresh(String texto, Instant expira, boolean revocado) {
        RefreshToken r = new RefreshToken();
        r.setToken(texto);
        r.setCuentaId(1L);
        r.setExpiraEn(expira);
        r.setRevocado(revocado);
        return r;
    }
}
