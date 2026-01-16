package com.neonpass.domain.exception;

/**
 * Excepción para errores de subida de imagen.
 */
public class ImageUploadException extends RuntimeException {

    public ImageUploadException(String message, Throwable cause) {
        super(message, cause);
    }
}
