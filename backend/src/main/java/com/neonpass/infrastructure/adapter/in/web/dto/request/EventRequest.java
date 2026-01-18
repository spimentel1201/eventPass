package com.neonpass.infrastructure.adapter.in.web.dto.request;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.neonpass.domain.model.enums.EventStatus;
import jakarta.validation.constraints.NotBlank;
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

    private UUID organizationId;

    private UUID venueId;

    @NotBlank(message = "El título es requerido")
    private String title;

    private String description;

    @JsonAlias({ "startDate", "startTime" })
    private LocalDateTime startTime;

    @JsonAlias({ "endDate", "endTime" })
    private LocalDateTime endTime;

    @Builder.Default
    private EventStatus status = EventStatus.DRAFT;

    /**
     * Metadata adicional en formato JSON.
     * Puede contener: media (images, videos, audio), políticas, restricciones, etc.
     */
    private String metadata;
}
