package com.example.authservice.controller;

import com.example.authservice.dto.AuthDtos.ActualizarCuentaRequest;
import com.example.authservice.dto.AuthDtos.CrearCuentaRequest;
import com.example.authservice.dto.AuthDtos.LoginRequest;
import com.example.authservice.dto.AuthDtos.RefreshRequest;
import com.example.authservice.dto.AuthDtos.RegistroRequest;
import com.example.authservice.dto.AuthDtos.SesionResponse;
import com.example.authservice.dto.AuthDtos.UsuarioSesion;
import com.example.authservice.model.CuentaAcceso;
import com.example.authservice.security.JwtService;
import com.example.authservice.security.UsuarioActual;
import com.example.authservice.service.CuentaAccesoService;
import com.example.authservice.service.SesionService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Auth", description = "Login con JWT, registro, renovación de sesión y cuentas de acceso")
public class AuthController {
    private final CuentaAccesoService service;
    private final SesionService sesionService;
    private final JwtService jwtService;

    public AuthController(CuentaAccesoService service, SesionService sesionService, JwtService jwtService) {
        this.service = service;
        this.sesionService = sesionService;
        this.jwtService = jwtService;
    }

    @Operation(summary = "Iniciar sesión", description = "Devuelve { token, refreshToken, usuario }. 401 si las credenciales no son válidas.")
    @PostMapping("/login")
    public SesionResponse login(@Valid @RequestBody LoginRequest request) {
        return sesionService.iniciar(service.autenticar(request));
    }

    @Operation(summary = "Crear cuenta de jugador", description = "Registro público: crea el perfil y la cuenta con rol JUGADOR e inicia sesión.")
    @PostMapping("/registro")
    public ResponseEntity<SesionResponse> registro(@Valid @RequestBody RegistroRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(sesionService.iniciar(service.registrar(request)));
    }

    @Operation(summary = "Renovar la sesión", description = "Cambia un refresh token vigente por un par nuevo de tokens (rotación).")
    @PostMapping("/refresh")
    public SesionResponse refresh(@Valid @RequestBody RefreshRequest request) {
        return sesionService.renovar(request.refreshToken());
    }

    @Operation(summary = "Cerrar sesión", description = "Revoca el refresh token.")
    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(@Valid @RequestBody RefreshRequest request) {
        sesionService.cerrar(request.refreshToken());
    }

    @Operation(summary = "Usuario de la sesión actual", description = "Lee el usuario desde el token enviado en Authorization.")
    @GetMapping("/me")
    public UsuarioSesion me() {
        Long cuentaId = UsuarioActual.obtener().map(u -> u.cuentaId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sesión no válida o vencida"));
        return sesionService.usuarioSesion(service.buscar(cuentaId));
    }

    @Operation(summary = "Validar un token", description = "Usado por otros servicios o pruebas: responde los claims si la firma y el vencimiento son válidos.")
    @PostMapping("/validar-token")
    public Map<String, Object> validar(@RequestParam String token) {
        try {
            Claims datos = jwtService.validar(token);
            return Map.of("valid", true, "sub", datos.getSubject(), "rol", datos.get("rol"), "exp", datos.getExpiration().getTime());
        } catch (JwtException | IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token invalido o vencido");
        }
    }

    // ---- Administración de cuentas (solo ADMINISTRADOR, ver SeguridadConfig) ----

    @GetMapping("/cuentas")
    public List<CuentaAcceso> listar(@RequestParam(required = false) String rol, @RequestParam(required = false) String estado) {
        return service.listar(rol, estado);
    }

    @PostMapping("/cuentas")
    public ResponseEntity<CuentaAcceso> crear(@Valid @RequestBody CrearCuentaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.crear(request));
    }

    @GetMapping("/cuentas/{id}")
    public CuentaAcceso buscar(@PathVariable Long id) {
        return service.buscar(id);
    }

    @GetMapping("/cuentas/buscar")
    public CuentaAcceso buscarEmail(@RequestParam String email) {
        return service.buscarEmail(email);
    }

    @PutMapping("/cuentas/{id}")
    public CuentaAcceso actualizar(@PathVariable Long id, @Valid @RequestBody ActualizarCuentaRequest request) {
        CuentaAcceso cuenta = service.actualizar(id, request);
        if (!"ACTIVO".equals(cuenta.getEstado())) sesionService.revocarTodas(id);
        return cuenta;
    }

    @PatchMapping("/cuentas/{id}/desactivar")
    public CuentaAcceso desactivar(@PathVariable Long id) {
        sesionService.revocarTodas(id);
        return service.desactivar(id);
    }

    @DeleteMapping("/cuentas/{id}/desactivar")
    public CuentaAcceso desactivarDelete(@PathVariable Long id) {
        return desactivar(id);
    }

    @DeleteMapping("/cuentas/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) {
        sesionService.revocarTodas(id);
        service.eliminar(id);
    }
}
