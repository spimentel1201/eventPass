package com.neonpass.domain.exception;

import java.util.UUID;

/**
 * Excepción lanzada cuando no se encuentra una orden.
 */
public class OrderNotFoundException extends RuntimeException {

    private final UUID orderId;

    public OrderNotFoundException(UUID orderId) {
        super("Orden no encontrada: " + orderId);
        this.orderId = orderId;
    }

    public UUID getOrderId() {
        return orderId;
    }
}
