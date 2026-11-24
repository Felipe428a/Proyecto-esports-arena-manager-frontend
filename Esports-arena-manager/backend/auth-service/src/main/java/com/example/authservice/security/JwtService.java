package com.example.authservice.security;

import com.example.authservice.model.CuentaAcceso;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * Emite y verifica los JWT (HMAC-SHA256). Solo auth-service los firma; los demás microservicios
 * comparten el secreto JWT_SECRETO y solo los verifican.
 * El payload lleva quién es (sub), su rol y el vencimiento (exp). Nunca la contraseña.
 */
@Service
public class JwtService {
    private final SecretKey clave;
    private final long duracionMs;

    public JwtService(@Value("${app.jwt.secreto}") String secreto,
                      @Value("${app.jwt.duracion-ms:900000}") long duracionMs) {
        byte[] bytes = secreto.getBytes(StandardCharsets.UTF_8);
        if (bytes.length < 32) {
            throw new IllegalStateException("JWT_SECRETO es muy corto: debe tener al menos 32 bytes");
        }
        this.clave = Keys.hmacShaKeyFor(bytes);
        this.duracionMs = duracionMs;
    }

    /** Firma un access token para la cuenta. */
    public TokenEmitido emitir(CuentaAcceso cuenta) {
        long ahora = System.currentTimeMillis();
        long vence = ahora + duracionMs;
        String token = Jwts.builder()
                .subject(cuenta.getEmail())
                .claim("cuentaId", cuenta.getId())
                .claim("usuarioId", cuenta.getUsuarioId())
                .claim("nombre", cuenta.getNombre())
                .claim("rol", cuenta.getRol())
                .issuer("esports-arena-auth")
                .issuedAt(new Date(ahora))
                .expiration(new Date(vence))
                .signWith(clave)
                .compact();
        return new TokenEmitido(token, vence);
    }

    /** Verifica firma y vencimiento. Lanza JwtException si el token fue alterado o venció. */
    public Claims validar(String token) {
        return Jwts.parser().verifyWith(clave).build().parseSignedClaims(token).getPayload();
    }

    public record TokenEmitido(String token, long expiraEn) {}
}
