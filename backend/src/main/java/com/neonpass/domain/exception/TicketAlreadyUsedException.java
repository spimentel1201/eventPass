package com.neonpass.domain.exception;

import java.util.UUID;

/**
 * Excepción lanzada cuando se intenta usar un ticket que ya fue escaneado.
 */
public class TicketAlreadyUsedException extends RuntimeException {

    private final UUID ticketId;

    public TicketAlreadyUsedException(UUID ticketId) {
        super("El ticket " + ticketId + " ya ha sido utilizado");
        this.ticketId = ticketId;
    }

    public UUID getTicketId() {
        return ticketId;
    }
}
