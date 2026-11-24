package com.example.authservice.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

/**
 * Refresh token: texto aleatorio (no es un JWT) que se guarda en la base para poder revocarlo.
 * Cada uso lo rota: se marca como revocado y se entrega uno nuevo.
 */
@Entity
@Table(name = "refresh_tokens")
public class RefreshToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true, length = 120)
    private String token;
    @Column(nullable = false)
    private Long cuentaId;
    @Column(nullable = false)
    private Instant expiraEn;
    @Column(nullable = false)
    private boolean revocado;
    @Column(nullable = false, updatable = false)
    private Instant creadoEn = Instant.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public Long getCuentaId() { return cuentaId; }
    public void setCuentaId(Long cuentaId) { this.cuentaId = cuentaId; }
    public Instant getExpiraEn() { return expiraEn; }
    public void setExpiraEn(Instant expiraEn) { this.expiraEn = expiraEn; }
    public boolean isRevocado() { return revocado; }
    public void setRevocado(boolean revocado) { this.revocado = revocado; }
    public Instant getCreadoEn() { return creadoEn; }
    public void setCreadoEn(Instant creadoEn) { this.creadoEn = creadoEn; }
}
