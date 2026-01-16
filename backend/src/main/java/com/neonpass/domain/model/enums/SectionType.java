package com.neonpass.domain.model.enums;

/**
 * Tipos de sección en un recinto.
 * 
 * <p>
 * Define si la sección tiene asientos numerados o es de admisión general.
 * </p>
 */
public enum SectionType {

    /** Sección con asientos numerados individuales */
    SEATED,

    /** Sección de admisión general (campo, standing) */
    GENERAL,

    /** Sección de pie / standing */
    STANDING,

    /** Sección VIP */
    VIP,

    /** Sección para personas con discapacidad */
    DISABLED
}
