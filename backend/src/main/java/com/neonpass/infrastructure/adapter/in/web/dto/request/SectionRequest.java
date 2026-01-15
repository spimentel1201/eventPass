package com.neonpass.infrastructure.adapter.in.web.dto.request;

import com.neonpass.domain.model.enums.SectionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;
import java.util.UUID;

/**
 * DTO para crear/actualizar una sección.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SectionRequest {

    @NotNull(message = "El venueId es requerido")
    private UUID venueId;

    @NotBlank(message = "El nombre es requerido")
    private String name;

    @NotNull(message = "El tipo es requerido")
    private SectionType type;

    private Integer capacity;

    /**
     * Configuración visual de la sección (polígono, color, posición, etc.)
     */
    private Map<String, Object> layoutConfig;
}
