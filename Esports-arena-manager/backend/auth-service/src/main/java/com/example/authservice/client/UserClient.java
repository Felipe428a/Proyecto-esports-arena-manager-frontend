package com.example.authservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Map;

/** Comunicación con user-service: el perfil competitivo (nombre, nickname, rol) vive allá. */
@FeignClient(name = "user-service", url = "${services.user.url}")
public interface UserClient {
    @GetMapping("/api/v1/usuarios/buscar")
    UsuarioResponse buscarPorEmail(@RequestParam String email);

    @PostMapping("/api/v1/usuarios")
    UsuarioResponse crear(@RequestBody NuevoUsuario usuario);

    @PutMapping("/api/v1/usuarios/{id}")
    UsuarioResponse actualizar(@PathVariable Long id, @RequestBody Map<String, Object> cambios);

    record UsuarioResponse(Long id, String nombre, String nickname, String email, String rol, String estado) {}

    record NuevoUsuario(String nombre, String nickname, String email, String rol) {}
}
