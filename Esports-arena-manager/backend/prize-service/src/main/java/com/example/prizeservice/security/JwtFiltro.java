package com.example.prizeservice.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Filtro que corre una vez por petición (sesión 2):
 * 1. ¿Trae el header Authorization? 2. ¿Empieza con "Bearer "? 3. ¿Firma correcta y sin vencer?
 * Si todo está bien, deja al usuario autenticado con su rol (ROLE_ + rol).
 * Si no, NO lanza error: la petición sigue sin usuario y las reglas de SeguridadConfig deciden (401/403).
 */
@Component
public class JwtFiltro extends OncePerRequestFilter {
    private final JwtService jwtService;

    public JwtFiltro(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header != null && header.startsWith("Bearer ")) {
            try {
                autenticar(jwtService.validar(header.substring(7)));
            } catch (JwtException | IllegalArgumentException e) {
                SecurityContextHolder.clearContext(); // token alterado o vencido: sigue sin usuario
            }
        }
        chain.doFilter(request, response);
    }

    private void autenticar(Claims datos) {
        String rol = datos.get("rol", String.class);
        UsuarioAutenticado usuario = new UsuarioAutenticado(
                comoLong(datos.get("cuentaId")),
                comoLong(datos.get("usuarioId")),
                datos.getSubject(),
                datos.get("nombre", String.class),
                rol);
        var autenticacion = new UsernamePasswordAuthenticationToken(
                usuario, null, List.of(new SimpleGrantedAuthority("ROLE_" + rol)));
        SecurityContextHolder.getContext().setAuthentication(autenticacion);
    }

    private static Long comoLong(Object valor) {
        return valor instanceof Number numero ? numero.longValue() : null;
    }
}
