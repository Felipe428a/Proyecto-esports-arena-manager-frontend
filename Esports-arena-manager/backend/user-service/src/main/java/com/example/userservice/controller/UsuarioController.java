package com.example.userservice.controller;

import com.example.userservice.dto.UsuarioDtos.UsuarioRequest;
import com.example.userservice.dto.UsuarioDtos.UsuarioUpdate;
import com.example.userservice.model.Usuario;
import com.example.userservice.security.UsuarioActual;
import com.example.userservice.service.UsuarioService;
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
@RequestMapping("/api/v1/usuarios")
@Tag(name = "Usuarios", description = "Perfiles, roles, nickname y estado competitivo")
public class UsuarioController {
    private final UsuarioService service;

    public UsuarioController(UsuarioService service) {
        this.service = service;
    }

    @Operation(summary = "Crear perfil", description = "Público (lo usa el registro). Solo un ADMINISTRADOR puede crear perfiles con rol distinto de JUGADOR.")
    @PostMapping
    public ResponseEntity<Usuario> crear(@Valid @RequestBody UsuarioRequest request) {
        UsuarioRequest seguro = UsuarioActual.esAdmin() ? request
                : new UsuarioRequest(request.nombre(), request.nickname(), request.email(), "JUGADOR", null);
        return ResponseEntity.status(HttpStatus.CREATED).body(service.crear(seguro));
    }

    @GetMapping
    public List<Usuario> listar(@RequestParam(required = false) String rol,
                                @RequestParam(required = false) String nickname,
                                @RequestParam(required = false) String estado) {
        return service.listar(rol, nickname, estado);
    }

    @GetMapping("/{id}")
    public Usuario buscar(@PathVariable Long id) {
        return service.buscar(id);
    }

    @GetMapping("/buscar")
    public Usuario buscarEmail(@RequestParam String email) {
        return service.buscarEmail(email);
    }

    @GetMapping("/{id}/puede-competir")
    public Map<String, Boolean> puedeCompetir(@PathVariable Long id) {
        return Map.of("puedeCompetir", service.puedeCompetir(id));
    }

    @Operation(summary = "Actualizar perfil", description = "El dueño del perfil puede cambiar nombre y nickname; rol y estado solo los cambia un ADMINISTRADOR.")
    @PutMapping("/{id}")
    public Usuario actualizar(@PathVariable Long id, @Valid @RequestBody UsuarioUpdate request) {
        if (UsuarioActual.esAdmin()) {
            return service.actualizar(id, request);
        }
        if (!UsuarioActual.esUsuario(id)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Solo puedes editar tu propio perfil");
        }
        if (request.rol() != null || request.estado() != null || request.email() != null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Rol, estado y correo solo los cambia un administrador");
        }
        return service.actualizar(id, request);
    }

    @PatchMapping("/{id}/desactivar")
    public Usuario desactivar(@PathVariable Long id) {
        return service.desactivar(id);
    }

    @DeleteMapping("/{id}/desactivar")
    public Usuario desactivarDelete(@PathVariable Long id) {
        return service.desactivar(id);
    }

    @Operation(summary = "Eliminar perfil", description = "Solo ADMINISTRADOR. Responde 204 sin contenido.")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) {
        service.eliminar(id);
    }
}
