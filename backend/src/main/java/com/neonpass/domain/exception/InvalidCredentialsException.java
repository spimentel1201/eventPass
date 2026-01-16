package com.neonpass.domain.exception;

/**
 * Excepción lanzada cuando las credenciales de autenticación son inválidas.
 */
public class InvalidCredentialsException extends RuntimeException {

    public InvalidCredentialsException() {
        super("Credenciales inválidas");
    }

    public InvalidCredentialsException(String message) {
        super(message);
    }
}
