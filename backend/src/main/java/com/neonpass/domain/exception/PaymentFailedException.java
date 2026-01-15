package com.neonpass.domain.exception;

/**
 * Excepción lanzada cuando falla el procesamiento de un pago.
 */
public class PaymentFailedException extends RuntimeException {

    private final String reason;

    public PaymentFailedException(String reason) {
        super("Error de pago: " + reason);
        this.reason = reason;
    }

    public PaymentFailedException(String reason, Throwable cause) {
        super("Error de pago: " + reason, cause);
        this.reason = reason;
    }

    public String getReason() {
        return reason;
    }
}
