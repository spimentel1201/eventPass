package com.neonpass.domain.port.in;

import java.util.UUID;

/**
 * Use Case para liberar reserva de asiento.
 */
public interface ReleaseSeatUseCase {

    boolean execute(ReleaseSeatCommand command);

    record ReleaseSeatCommand(
            UUID eventId,
            UUID seatId,
            UUID userId) {
    }
}
