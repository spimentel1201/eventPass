package com.neonpass.domain.exception;

import java.util.UUID;

/**
 * Excepción lanzada cuando no se encuentra un asiento.
 */
public class SeatNotFoundException extends RuntimeException {

    private final UUID seatId;

    public SeatNotFoundException(UUID seatId) {
        super("Asiento no encontrado: " + seatId);
        this.seatId = seatId;
    }

    public UUID getSeatId() {
        return seatId;
    }
}
