package com.neonpass.domain.model.enums;

/**
 * Estados del ciclo de vida de un evento.
 */
public enum EventStatus {

    /** Evento en borrador, no visible públicamente */
    DRAFT,

    /** Evento publicado y disponible para venta */
    PUBLISHED,

    /** Evento cancelado */
    CANCELLED,

    /** Evento finalizado */
    COMPLETED
}
