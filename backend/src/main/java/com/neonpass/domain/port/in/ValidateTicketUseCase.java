package com.neonpass.domain.port.in;

import com.neonpass.domain.model.enums.ValidationStatus;

import java.util.UUID;

/**
 * Use Case para validar tickets en puerta.
 */
public interface ValidateTicketUseCase {

    ValidationResult execute(ValidateTicketCommand command);

    record ValidateTicketCommand(
            String qrCodeHash,
            UUID validatedBy // Staff que valida
    ) {
    }

    record ValidationResult(
            UUID ticketId,
            UUID eventId,
            UUID seatId,
            ValidationStatus status,
            String message) {
    }
}
