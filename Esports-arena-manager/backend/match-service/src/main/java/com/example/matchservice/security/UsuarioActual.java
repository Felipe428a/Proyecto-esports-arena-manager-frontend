package com.example.matchservice.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Arrays;
import java.util.Objects;
import java.util.Optional;

/** Atajos para conocer, desde la lógica de negocio, quién hace la petición y con qué rol. */
public final class UsuarioActual {
    private UsuarioActual() {}

    public static Optional<UsuarioAutenticado> obtener() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UsuarioAutenticado usuario) {
            return Optional.of(usuario);
        }
        return Optional.empty();
    }

    public static boolean tieneRol(String... roles) {
        return obtener().map(u -> Arrays.asList(roles).contains(u.rol())).orElse(false);
    }

    public static boolean esAdmin() {
        return tieneRol("ADMINISTRADOR");
    }

    /** Organizadores y administradores gestionan la competencia. */
    public static boolean esStaff() {
        return tieneRol("ORGANIZADOR", "ADMINISTRADOR");
    }

    /** true si el usuario autenticado es el dueño del perfil indicado. */
    public static boolean esUsuario(Long usuarioId) {
        return obtener().map(u -> Objects.equals(u.usuarioId(), usuarioId)).orElse(false);
    }
}
