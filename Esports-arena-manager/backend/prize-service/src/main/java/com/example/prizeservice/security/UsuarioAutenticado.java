package com.example.prizeservice.security;

/**
 * Datos del usuario que vienen dentro del JWT (claims). Spring Security lo guarda como "principal".
 *
 * @param cuentaId  id de la cuenta de acceso en auth-service
 * @param usuarioId id del perfil en user-service (es el id que usan equipos, inscripciones, etc.)
 * @param email     correo (claim sub)
 * @param nombre    nombre para mostrar
 * @param rol       JUGADOR, ORGANIZADOR o ADMINISTRADOR
 */
public record UsuarioAutenticado(Long cuentaId, Long usuarioId, String email, String nombre, String rol) {}
