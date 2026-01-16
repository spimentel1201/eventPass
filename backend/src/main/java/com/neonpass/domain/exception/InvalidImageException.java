package com.neonpass.domain.exception;

/**
 * Excepción para imágenes inválidas.
 */
public class InvalidImageException extends RuntimeException {

    public InvalidImageException(String message) {
        super(message);
    }
}
