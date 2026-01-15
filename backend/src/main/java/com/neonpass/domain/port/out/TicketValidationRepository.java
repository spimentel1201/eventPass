package com.neonpass.domain.port.out;

import com.neonpass.domain.model.TicketValidation;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Puerto de salida para operaciones de persistencia de validaciones de ticket.
 */
public interface TicketValidationRepository {

    Optional<TicketValidation> findById(UUID id);

    /**
     * Obtiene el historial de validaciones de un ticket.
     */
    List<TicketValidation> findByTicketId(UUID ticketId);

    TicketValidation save(TicketValidation validation);
}
