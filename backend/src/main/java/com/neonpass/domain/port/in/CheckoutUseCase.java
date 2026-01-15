package com.neonpass.domain.port.in;

import java.util.List;
import java.util.UUID;

/**
 * Use Case para procesar checkout.
 */
public interface CheckoutUseCase {

    CheckoutResult execute(CheckoutCommand command);

    record CheckoutCommand(
            UUID userId,
            UUID eventId,
            List<UUID> seatIds // Asientos a comprar
    ) {
    }

    record CheckoutResult(
            UUID orderId,
            int ticketCount,
            java.math.BigDecimal totalAmount,
            String currency,
            List<UUID> ticketIds) {
    }
}
