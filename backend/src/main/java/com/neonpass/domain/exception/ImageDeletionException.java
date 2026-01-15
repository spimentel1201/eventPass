package com.neonpass.domain.exception;

/**
 * Excepción para errores de eliminación de imagen.
 */
public class ImageDeletionException extends RuntimeException {

    public ImageDeletionException(String message, Throwable cause) {
        super(message, cause);
    }
}
