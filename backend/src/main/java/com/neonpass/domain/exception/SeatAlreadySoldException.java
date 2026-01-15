package com.neonpass.domain.exception;

import java.util.UUID;

/**
 * Excepción lanzada cuando un asiento ya ha sido vendido.
 */
public class SeatAlreadySoldException extends RuntimeException {

    private final UUID seatId;

    public SeatAlreadySoldException(UUID seatId) {
        super("El asiento " + seatId + " ya ha sido vendido");
        this.seatId = seatId;
    }

    public UUID getSeatId() {
        return seatId;
    }
}
