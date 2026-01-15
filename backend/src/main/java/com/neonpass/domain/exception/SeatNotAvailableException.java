package com.neonpass.domain.exception;

import java.util.UUID;

/**
 * Excepción lanzada cuando un asiento no está disponible para reserva.
 * 
 * <p>
 * Esto puede ocurrir cuando otro usuario ya ha reservado el asiento
 * o cuando el asiento ya ha sido vendido.
 * </p>
 */
public class SeatNotAvailableException extends RuntimeException {

    private final UUID seatId;
    private final UUID eventId;

    public SeatNotAvailableException(UUID seatId, UUID eventId) {
        super("El asiento " + seatId + " no está disponible para el evento " + eventId);
        this.seatId = seatId;
        this.eventId = eventId;
    }

    public UUID getSeatId() {
        return seatId;
    }

    public UUID getEventId() {
        return eventId;
    }
}
