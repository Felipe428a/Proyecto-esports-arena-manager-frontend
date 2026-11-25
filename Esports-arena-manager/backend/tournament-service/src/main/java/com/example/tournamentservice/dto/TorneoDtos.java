package com.example.tournamentservice.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import com.fasterxml.jackson.annotation.JsonAlias;
import java.time.LocalDateTime;

public final class TorneoDtos {
    private TorneoDtos() {}

    public record TorneoRequest(@NotBlank(message = "El nombre es obligatorio") String nombre,
                                @NotNull(message = "El juego es obligatorio") Long juegoId,
                                @NotNull(message = "La fecha de inicio es obligatoria") LocalDateTime fechaInicio,
                                @NotNull(message = "La fecha de término es obligatoria") LocalDateTime fechaFin,
                                @JsonAlias("fechaFinInscripcion") @NotNull(message = "El cierre de inscripción es obligatorio") LocalDateTime fechaCierreInscripcion,
                                @Min(value = 1, message = "El cupo debe ser al menos 1") int cupoMaximo,
                                @NotBlank(message = "La modalidad es obligatoria") String modalidad,
                                String estado,
                                String descripcion) {
        public TorneoRequest(String nombre, Long juegoId, LocalDateTime fechaInicio, LocalDateTime fechaFin,
                             LocalDateTime fechaCierreInscripcion, int cupoMaximo, String modalidad, String estado) {
            this(nombre, juegoId, fechaInicio, fechaFin, fechaCierreInscripcion, cupoMaximo, modalidad, estado, null);
        }
    }

    public record TorneoUpdate(LocalDateTime fechaInicio, LocalDateTime fechaFin, LocalDateTime fechaCierreInscripcion,
                               Integer cupoMaximo, String estado, String nombre, String descripcion) {
        public TorneoUpdate(LocalDateTime fechaInicio, LocalDateTime fechaFin, LocalDateTime fechaCierreInscripcion,
                            Integer cupoMaximo, String estado) {
            this(fechaInicio, fechaFin, fechaCierreInscripcion, cupoMaximo, estado, null, null);
        }
    }
}
