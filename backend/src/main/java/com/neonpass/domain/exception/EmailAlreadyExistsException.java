package com.neonpass.domain.exception;

/**
 * Excepción lanzada cuando se intenta registrar un email que ya existe.
 */
public class EmailAlreadyExistsException extends RuntimeException {

    private final String email;

    public EmailAlreadyExistsException(String email) {
        super("El email ya está registrado: " + email);
        this.email = email;
    }

    public String getEmail() {
        return email;
    }
}
