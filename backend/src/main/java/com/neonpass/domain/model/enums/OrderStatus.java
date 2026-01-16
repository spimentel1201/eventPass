package com.neonpass.domain.model.enums;

/**
 * Estados del ciclo de vida de una orden de compra.
 */
public enum OrderStatus {

    /** Orden pendiente de pago */
    PENDING,

    /** Orden pagada exitosamente */
    PAID,

    /** Pago fallido */
    FAILED,

    /** Orden reembolsada */
    REFUNDED
}
