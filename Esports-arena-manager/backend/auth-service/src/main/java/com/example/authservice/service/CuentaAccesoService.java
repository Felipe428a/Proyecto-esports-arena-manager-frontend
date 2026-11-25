package com.example.authservice.service;

import com.example.authservice.client.UserClient;
import com.example.authservice.client.UserClient.UsuarioResponse;
import com.example.authservice.dto.AuthDtos.ActualizarCuentaRequest;
import com.example.authservice.dto.AuthDtos.CrearCuentaRequest;
import com.example.authservice.dto.AuthDtos.LoginRequest;
import com.example.authservice.dto.AuthDtos.RegistroRequest;
import com.example.authservice.model.CuentaAcceso;
import com.example.authservice.repository.CuentaAccesoRepository;
import feign.FeignException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/** Reglas de negocio de las cuentas de acceso. */
@Service
public class CuentaAccesoService {
    private static final Logger log = LoggerFactory.getLogger(CuentaAccesoService.class);
    public static final List<String> ROLES = List.of("JUGADOR", "ORGANIZADOR", "ADMINISTRADOR");

    private final CuentaAccesoRepository repository;
    private final UserClient userClient;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public CuentaAccesoService(CuentaAccesoRepository repository, UserClient userClient) {
        this.repository = repository;
        this.userClient = userClient;
    }

    /** Alta hecha por un administrador para un perfil que ya existe en user-service. */
    public CuentaAcceso crear(CrearCuentaRequest request) {
        validarRol(request.rol());
        UsuarioResponse perfil = userClient.buscarPorEmail(request.email());
        if (repository.existsByEmail(request.email())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Correo ya registrado");
        CuentaAcceso cuenta = nuevaCuenta(request.email(), request.password(), request.rol().toUpperCase());
        if (perfil != null) {
            cuenta.setUsuarioId(perfil.id());
            cuenta.setNombre(perfil.nombre());
        }
        return repository.save(cuenta);
    }

    /**
     * Registro público: crea (o reutiliza) el perfil en user-service y la cuenta, siempre con rol JUGADOR.
     * Los roles ORGANIZADOR y ADMINISTRADOR solo los asigna un administrador.
     */
    public CuentaAcceso registrar(RegistroRequest request) {
        String email = request.email().trim().toLowerCase();
        if (repository.existsByEmail(email)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Correo ya registrado");
        UsuarioResponse perfil = buscarPerfil(email);
        if (perfil == null) {
            perfil = userClient.crear(new UserClient.NuevoUsuario(request.nombre().trim(), request.nickname().trim(), email, "JUGADOR"));
        }
        CuentaAcceso cuenta = nuevaCuenta(email, request.password(), "JUGADOR");
        cuenta.setUsuarioId(perfil.id());
        cuenta.setNombre(perfil.nombre());
        return repository.save(cuenta);
    }

    public List<CuentaAcceso> listar(String rol, String estado) {
        return repository.findAll().stream()
                .filter(c -> rol == null || c.getRol().equalsIgnoreCase(rol))
                .filter(c -> estado == null || c.getEstado().equalsIgnoreCase(estado))
                .toList();
    }

    public CuentaAcceso buscar(Long id) {
        return repository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cuenta no encontrada"));
    }

    public CuentaAcceso buscarEmail(String email) {
        return repository.findByEmail(email).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cuenta no encontrada"));
    }

    public CuentaAcceso actualizar(Long id, ActualizarCuentaRequest request) {
        CuentaAcceso cuenta = buscar(id);
        if (request.password() != null && !request.password().isBlank()) {
            cuenta.setPasswordHash(encoder.encode(request.password()));
            cuenta.getHistorial().add("Password actualizada " + LocalDateTime.now());
        }
        if (request.rol() != null) {
            validarRol(request.rol());
            cuenta.getHistorial().add("Rol cambiado de " + cuenta.getRol() + " a " + request.rol().toUpperCase());
            cuenta.setRol(request.rol().toUpperCase());
            sincronizarRolPerfil(cuenta);
        }
        if (request.estado() != null) {
            validarEstado(request.estado());
            cuenta.getHistorial().add("Estado cambiado de " + cuenta.getEstado() + " a " + request.estado().toUpperCase());
            cuenta.setEstado(request.estado().toUpperCase());
        }
        return repository.save(cuenta);
    }

    public CuentaAcceso desactivar(Long id) {
        CuentaAcceso cuenta = buscar(id);
        cuenta.setEstado("DESACTIVADO");
        cuenta.getHistorial().add("Cuenta desactivada " + LocalDateTime.now());
        return repository.save(cuenta);
    }

    public void eliminar(Long id) {
        repository.delete(buscar(id));
    }

    /** Valida email + contraseña (BCrypt). Mismo mensaje para ambos casos: no revela si el correo existe. */
    public CuentaAcceso autenticar(LoginRequest request) {
        CuentaAcceso cuenta = repository.findByEmail(request.email().trim().toLowerCase())
                .or(() -> repository.findByEmail(request.email()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email o contraseña incorrectos"));
        if (!"ACTIVO".equals(cuenta.getEstado()) || !encoder.matches(request.password(), cuenta.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email o contraseña incorrectos");
        }
        return enlazarPerfil(cuenta);
    }

    /** Si la cuenta aún no conoce su perfil (datos iniciales), lo busca en user-service por email. */
    public CuentaAcceso enlazarPerfil(CuentaAcceso cuenta) {
        if (cuenta.getUsuarioId() != null) return cuenta;
        UsuarioResponse perfil = buscarPerfil(cuenta.getEmail());
        if (perfil == null) return cuenta;
        cuenta.setUsuarioId(perfil.id());
        cuenta.setNombre(perfil.nombre());
        return repository.save(cuenta);
    }

    /** Crea la cuenta solo si el correo no existe (lo usa la carga de datos iniciales). */
    public void crearSiNoExiste(String email, String nombre, String password, String rol) {
        if (repository.existsByEmail(email)) return;
        CuentaAcceso cuenta = nuevaCuenta(email, password, rol);
        cuenta.setNombre(nombre);
        repository.save(cuenta);
    }

    private CuentaAcceso nuevaCuenta(String email, String password, String rol) {
        CuentaAcceso cuenta = new CuentaAcceso();
        cuenta.setEmail(email);
        cuenta.setPasswordHash(encoder.encode(password));
        cuenta.setRol(rol);
        cuenta.getHistorial().add("Cuenta creada " + cuenta.getFechaCreacion());
        return cuenta;
    }

    private UsuarioResponse buscarPerfil(String email) {
        try {
            return userClient.buscarPorEmail(email);
        } catch (FeignException.NotFound e) {
            return null;
        } catch (FeignException e) {
            log.warn("No se pudo consultar user-service: {}", e.getMessage());
            return null;
        }
    }

    /** El rol también se refleja en el perfil de user-service (se reenvía el token del administrador). */
    private void sincronizarRolPerfil(CuentaAcceso cuenta) {
        if (cuenta.getUsuarioId() == null) {
            UsuarioResponse perfil = buscarPerfil(cuenta.getEmail()); // cuentas de datos iniciales aún sin enlazar
            if (perfil == null) return;
            cuenta.setUsuarioId(perfil.id());
            cuenta.setNombre(perfil.nombre());
        }
        try {
            userClient.actualizar(cuenta.getUsuarioId(), Map.of("rol", cuenta.getRol()));
        } catch (FeignException e) {
            log.warn("No se pudo sincronizar el rol en user-service: {}", e.getMessage());
        }
    }

    private void validarRol(String rol) {
        if (!ROLES.contains(rol.toUpperCase())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rol invalido");
        }
    }

    private void validarEstado(String estado) {
        if (!List.of("ACTIVO", "DESACTIVADO").contains(estado.toUpperCase())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Estado invalido");
        }
    }
}
