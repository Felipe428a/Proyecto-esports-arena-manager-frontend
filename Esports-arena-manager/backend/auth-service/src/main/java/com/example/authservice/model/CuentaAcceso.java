package com.example.authservice.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Cuenta de acceso: credenciales y rol. El perfil competitivo vive en user-service
 * y se enlaza por usuarioId.
 */
@Entity
@Table(name = "cuentas_acceso")
public class CuentaAcceso {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true)
    private String email;
    /** Hash BCrypt: la contraseña nunca se guarda ni se devuelve en texto plano. */
    @JsonIgnore
    @Column(nullable = false)
    private String passwordHash;
    @Column(nullable = false)
    private String rol;
    @Column(nullable = false)
    private String estado = "ACTIVO";
    /** Id del perfil en user-service. */
    private Long usuarioId;
    private String nombre;
    @Column(nullable = false, updatable = false)
    private LocalDateTime fechaCreacion = LocalDateTime.now();
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "cuenta_acceso_historial", joinColumns = @JoinColumn(name = "cuenta_id"))
    @Column(name = "evento", nullable = false)
    private List<String> historial = new ArrayList<>();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public String getRol() { return rol; }
    public void setRol(String rol) { this.rol = rol; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public Long getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }
    public List<String> getHistorial() { return historial; }
    public void setHistorial(List<String> historial) { this.historial = historial; }
}
