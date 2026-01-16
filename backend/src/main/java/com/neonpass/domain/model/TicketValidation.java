package com.neonpass.domain.model;

import com.neonpass.domain.model.enums.ValidationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Modelo de dominio para Validación de Ticket.
 * 
 * <p>
 * Registra cada intento de validación de un ticket en puerta (auditoría).
 * </p>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketValidation {

    private UUID id;
    private UUID ticketId;
    /** ID del staff que validó */
    private UUID validatedBy;
    private LocalDateTime validatedAt;
    /** Metadata de ubicación en formato JSON (GPS, dispositivo, puerta) */
    private String locationMetadata;
    private ValidationStatus status;
    /** Razón del rechazo si aplica */
    private String rejectionReason;
}
