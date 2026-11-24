package com.example.authservice.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Contratos JSON del servicio de autenticación. */
public final class AuthDtos {
    private AuthDtos() {}

    /** Login: { "email": "...", "password": "..." } */
    public record LoginRequest(
            @Email(message = "El email no es válido") @NotBlank(message = "El email es obligatorio") String email,
            @NotBlank(message = "La contraseña es obligatoria") String password) {}

    /** Registro público desde el frontend: siempre crea un JUGADOR. */
    public record RegistroRequest(
            @NotBlank(message = "El nombre es obligatorio") String nombre,
            @NotBlank(message = "El apodo es obligatorio")
            @Pattern(regexp = "^\\S{3,16}$", message = "El apodo debe tener entre 3 y 16 caracteres, sin espacios")
            String nickname,
            @Email(message = "El email no es válido") @NotBlank(message = "El email es obligatorio") String email,
            @NotBlank(message = "La contraseña es obligatoria")
            @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres") String password) {}

    /** Alta de cuenta por un administrador para un perfil que ya existe en user-service. */
    public record CrearCuentaRequest(
            @Email @NotBlank String email,
            @NotBlank String password,
            @NotBlank String rol) {}

    public record ActualizarCuentaRequest(String password, String rol, String estado) {}

    /** Renovación: el frontend envía el refresh token y recibe un par nuevo. */
    public record RefreshRequest(@NotBlank(message = "El refresh token es obligatorio") String refreshToken) {}

    /** Datos del usuario que el frontend guarda en la sesión (nunca la contraseña). */
    public record UsuarioSesion(Long id, Long cuentaId, String nombre, String email, String rol) {}

    /**
     * Respuesta del login, registro y refresh.
     *
     * @param token           access token JWT (vida corta) que va en Authorization: Bearer
     * @param refreshToken    token opaco de vida larga para pedir un access token nuevo
     * @param expiraEn        vencimiento del access token (epoch en milisegundos)
     * @param refreshExpiraEn vencimiento del refresh token (epoch en milisegundos)
     */
    public record SesionResponse(String token, String refreshToken, String tipo, long expiraEn,
                                 long refreshExpiraEn, UsuarioSesion usuario) {}
}
