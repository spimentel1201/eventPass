package com.neonpass.infrastructure.adapter.in.web.dto.response;

import com.neonpass.domain.model.enums.ValidationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * DTO para respuesta de validación.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketValidationResponse {

    private UUID ticketId;
    private UUID eventId;
    private UUID seatId;
    private ValidationStatus status;
    private String message;
}
