package com.neonpass.domain.model.enums;

/**
 * Resultado de la validación de un ticket en puerta.
 */
public enum ValidationStatus {

    /** Validación exitosa, acceso permitido */
    SUCCESS,

    /** Validación rechazada */
    REJECTED,

    /** Intento de uso duplicado (ticket ya escaneado) */
    DUPLICATE_ATTEMPT
}
