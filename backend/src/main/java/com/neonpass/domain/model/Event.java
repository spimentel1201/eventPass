package com.neonpass.domain.model;

import com.neonpass.domain.model.enums.EventStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Modelo de dominio para Evento.
 * 
 * <p>
 * Representa un evento específico (concierto, obra, partido) en una fecha.
 * </p>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Event {

    private UUID id;
    private UUID organizationId;
    private UUID venueId;
    private String title;
    private String description;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private EventStatus status;
    /** Metadata adicional en formato JSON */
    private String metadata;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean deleted;

    /**
     * Verifica si el evento está publicado y disponible para venta.
     */
    public boolean isPublished() {
        return EventStatus.PUBLISHED.equals(this.status);
    }
}
