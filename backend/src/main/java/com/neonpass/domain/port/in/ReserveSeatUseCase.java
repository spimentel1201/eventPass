package com.neonpass.domain.port.in;

import java.util.List;
import java.util.UUID;

/**
 * Use Case para reservar asientos.
 */
public interface ReserveSeatUseCase {

    /**
     * Reserva un asiento para un usuario.
     *
     * @param command Datos de la reserva
     * @return Resultado de la reserva
     */
    ReservationResult execute(ReserveSeatCommand command);

    record ReserveSeatCommand(
            UUID eventId,
            UUID seatId,
            UUID userId) {
    }

    record ReservationResult(
            UUID eventId,
            UUID seatId,
            UUID userId,
            boolean success,
            String message,
            int expiresInSeconds) {
    }
}
