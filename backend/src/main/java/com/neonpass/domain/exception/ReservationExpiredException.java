package com.neonpass.domain.exception;

import java.util.UUID;

/**
 * Excepción lanzada cuando una reserva ha expirado.
 * 
 * <p>
 * Las reservas tienen un TTL de 10 minutos en Redis.
 * </p>
 */
public class ReservationExpiredException extends RuntimeException {

    private final UUID seatId;

    public ReservationExpiredException(UUID seatId) {
        super("La reserva del asiento " + seatId + " ha expirado");
        this.seatId = seatId;
    }

    public UUID getSeatId() {
        return seatId;
    }
}
