package com.neonpass.domain.model.enums;

/**
 * Roles de usuario en el sistema NeonPass.
 * 
 * <p>
 * Define los niveles de acceso y permisos para cada tipo de usuario.
 * </p>
 */
public enum UserRole {

    /** Usuario final (comprador de tickets) */
    USER,

    /** Administrador de organización (organizador de eventos) */
    ADMIN,

    /** Personal de validación (scanner de QR en puertas) */
    STAFF
}
