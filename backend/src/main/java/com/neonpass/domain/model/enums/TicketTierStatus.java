package com.neonpass.domain.model.enums;

/**
 * Estados de un nivel de precio (Ticket Tier).
 */
public enum TicketTierStatus {

    /** Tier activo y disponible para compra */
    ACTIVE,

    /** Tier agotado */
    SOLD_OUT,

    /** Tier oculto (no visible en la tienda) */
    HIDDEN
}
