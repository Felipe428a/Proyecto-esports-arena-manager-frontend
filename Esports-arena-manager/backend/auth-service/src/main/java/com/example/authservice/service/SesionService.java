package com.example.authservice.service;

import com.example.authservice.dto.AuthDtos.SesionResponse;
import com.example.authservice.dto.AuthDtos.UsuarioSesion;
import com.example.authservice.model.CuentaAcceso;
import com.example.authservice.model.RefreshToken;
import com.example.authservice.repository.RefreshTokenRepository;
import com.example.authservice.security.JwtService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;

/**
 * Emisión, renovación y revocación de sesiones.
 * - Access token (JWT) de vida corta: viaja en cada petición.
 * - Refresh token (aleatorio, guardado en BD) de vida larga: solo sirve para pedir un access token nuevo.
 *   Se rota en cada uso y se revoca al cerrar sesión.
 */
@Service
public class SesionService {
    private static final SecureRandom ALEATORIO = new SecureRandom();

    private final JwtService jwtService;
    private final RefreshTokenRepository refreshRepository;
    private final CuentaAccesoService cuentaService;
    private final long refreshDuracionMs;

    public SesionService(JwtService jwtService, RefreshTokenRepository refreshRepository, CuentaAccesoService cuentaService,
                         @Value("${app.jwt.refresh-duracion-ms:604800000}") long refreshDuracionMs) {
        this.jwtService = jwtService;
        this.refreshRepository = refreshRepository;
        this.cuentaService = cuentaService;
        this.refreshDuracionMs = refreshDuracionMs;
    }

    @Transactional
    public SesionResponse iniciar(CuentaAcceso cuenta) {
        JwtService.TokenEmitido access = jwtService.emitir(cuenta);
        RefreshToken refresh = new RefreshToken();
        refresh.setToken(generarTextoAleatorio());
        refresh.setCuentaId(cuenta.getId());
        refresh.setExpiraEn(Instant.now().plusMillis(refreshDuracionMs));
        refreshRepository.save(refresh);
        return new SesionResponse(access.token(), refresh.getToken(), "Bearer", access.expiraEn(),
                refresh.getExpiraEn().toEpochMilli(), usuarioSesion(cuenta));
    }

    /** Renueva la sesión: valida el refresh token, lo revoca y entrega un par nuevo (rotación). */
    @Transactional
    public SesionResponse renovar(String textoRefresh) {
        RefreshToken actual = refreshRepository.findByToken(textoRefresh)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sesión no válida o vencida"));
        if (actual.isRevocado() || actual.getExpiraEn().isBefore(Instant.now())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sesión no válida o vencida");
        }
        CuentaAcceso cuenta = cuentaService.buscar(actual.getCuentaId());
        if (!"ACTIVO".equals(cuenta.getEstado())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Cuenta desactivada");
        }
        actual.setRevocado(true);
        refreshRepository.save(actual);
        return iniciar(cuentaService.enlazarPerfil(cuenta));
    }

    /** Cerrar sesión: el refresh token deja de servir. El access token vence solo (vida corta). */
    @Transactional
    public void cerrar(String textoRefresh) {
        refreshRepository.findByToken(textoRefresh).ifPresent(token -> {
            token.setRevocado(true);
            refreshRepository.save(token);
        });
    }

    /** Revoca todas las sesiones de una cuenta (por ejemplo, al desactivarla). */
    @Transactional
    public void revocarTodas(Long cuentaId) {
        refreshRepository.findByCuentaIdAndRevocadoFalse(cuentaId).forEach(token -> {
            token.setRevocado(true);
            refreshRepository.save(token);
        });
    }

    public UsuarioSesion usuarioSesion(CuentaAcceso cuenta) {
        return new UsuarioSesion(cuenta.getUsuarioId(), cuenta.getId(), cuenta.getNombre(), cuenta.getEmail(), cuenta.getRol());
    }

    private static String generarTextoAleatorio() {
        byte[] bytes = new byte[48];
        ALEATORIO.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
