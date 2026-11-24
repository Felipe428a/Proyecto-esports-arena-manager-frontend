package com.example.prizeservice.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

/**
 * Verifica los JWT firmados por auth-service (HMAC-SHA256 con el secreto compartido JWT_SECRETO).
 * Si la firma no coincide o el token venció, lanza JwtException.
 */
@Service
public class JwtService {
    private final SecretKey clave;

    public JwtService(@Value("${app.jwt.secreto}") String secreto) {
        byte[] bytes = secreto.getBytes(StandardCharsets.UTF_8);
        if (bytes.length < 32) {
            throw new IllegalStateException("JWT_SECRETO es muy corto: debe tener al menos 32 bytes");
        }
        this.clave = Keys.hmacShaKeyFor(bytes);
    }

    public Claims validar(String token) {
        return Jwts.parser().verifyWith(clave).build().parseSignedClaims(token).getPayload();
    }
}
