package com.neonpass.infrastructure.adapter.in.web.dto.response;

import com.neonpass.domain.model.enums.EventStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO resumido para listado de eventos (cards).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventSummaryResponse {

    private UUID id;
    private String title;
    private String description;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private EventStatus status;

    // Solo thumbnail para cards
    private String thumbnailUrl;

    // Nombre del venue para mostrar
    private String venueName;
}
