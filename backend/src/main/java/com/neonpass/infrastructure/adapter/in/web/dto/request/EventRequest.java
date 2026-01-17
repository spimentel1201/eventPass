package com.neonpass.infrastructure.adapter.in.web.dto.request;

import com.neonpass.domain.model.enums.EventStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO para solicitud de creación/actualización de evento.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventRequest {

    @NotNull(message = "El ID de la organización es requerido")
    private UUID organizationId;

    @NotNull(message = "El ID del recinto es requerido")
    private UUID venueId;

    @NotBlank(message = "El título es requerido")
    private String title;

    private String description;

    @NotNull(message = "La fecha de inicio es requerida")
    private LocalDateTime startTime;

    private LocalDateTime endTime;

    @Builder.Default
    private EventStatus status = EventStatus.DRAFT;

    /**
     * Metadata adicional en formato JSON.
     * Puede contener: media (images, videos, audio), políticas, restricciones, etc.
     */
    private String metadata;
}
