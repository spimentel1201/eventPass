package com.neonpass.domain.model.enums;

/**
 * Estados del ciclo de vida de un ticket.
 */
public enum TicketStatus {

    /** Ticket válido, no ha sido usado */
    VALID,

    /** Ticket ya fue escaneado y usado */
    USED,

    /** Ticket cancelado */
    CANCELLED
}
