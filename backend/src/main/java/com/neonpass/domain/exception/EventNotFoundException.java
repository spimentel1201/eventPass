package com.neonpass.domain.exception;

import java.util.UUID;

/**
 * Excepción lanzada cuando no se encuentra un evento.
 */
public class EventNotFoundException extends RuntimeException {

    private final UUID eventId;

    public EventNotFoundException(UUID eventId) {
        super("Evento no encontrado: " + eventId);
        this.eventId = eventId;
    }

    public UUID getEventId() {
        return eventId;
    }
}
