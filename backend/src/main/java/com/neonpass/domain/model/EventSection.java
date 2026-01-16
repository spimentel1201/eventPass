package com.neonpass.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Modelo de dominio para mapeo Evento-Sección.
 * 
 * <p>
 * Permite activar/desactivar secciones específicas para cada evento
 * y sobreescribir la capacidad si es necesario.
 * </p>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventSection {

    private UUID id;
    private UUID eventId;
    private UUID sectionId;
    private Boolean isActive;
    /** Capacidad personalizada para este evento (nullable) */
    private Integer customCapacity;
    private LocalDateTime createdAt;
}
