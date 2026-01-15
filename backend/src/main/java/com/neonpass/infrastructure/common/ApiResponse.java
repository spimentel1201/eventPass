package com.neonpass.infrastructure.common;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

/**
 * Envelope estándar para todas las respuestas de la API.
 * 
 * <p>
 * Según las convenciones definidas en API_CONVENTIONS.md, todas las respuestas
 * deben seguir esta estructura para mantener consistencia.
 * </p>
 *
 * @param <T> Tipo de datos contenidos en la respuesta
 */
@Data
@Builder
public class ApiResponse<T> {

    private boolean success;
    private T data;
    private ErrorDetails error;
    private MetaData meta;

    /**
     * Detalles del error cuando la operación falla.
     */
    @Data
    @Builder
    public static class ErrorDetails {
        /** Código de error en formato SCREAMING_SNAKE_CASE */
        private String code;
        /** Mensaje descriptivo del error */
        private String message;
        /** Detalles adicionales del error */
        private Map<String, Object> details;
        /** Timestamp del error */
        private String timestamp;
    }

    /**
     * Metadata de la respuesta.
     */
    @Data
    @Builder
    public static class MetaData {
        /** Timestamp de la respuesta */
        private String timestamp;
        /** ID único de la petición para trazabilidad */
        private String requestId;
    }

    /**
     * Crea una respuesta exitosa con datos.
     *
     * @param data Datos a incluir en la respuesta
     * @param <T>  Tipo de los datos
     * @return ApiResponse con success=true
     */
    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .data(data)
                .error(null)
                .meta(MetaData.builder()
                        .timestamp(LocalDateTime.now().toString())
                        .requestId(UUID.randomUUID().toString())
                        .build())
                .build();
    }

    /**
     * Crea una respuesta de error.
     *
     * @param code    Código de error
     * @param message Mensaje descriptivo
     * @param details Detalles adicionales
     * @param <T>     Tipo de los datos (null en errores)
     * @return ApiResponse con success=false
     */
    public static <T> ApiResponse<T> error(String code, String message, Map<String, Object> details) {
        return ApiResponse.<T>builder()
                .success(false)
                .data(null)
                .error(ErrorDetails.builder()
                        .code(code)
                        .message(message)
                        .details(details)
                        .timestamp(LocalDateTime.now().toString())
                        .build())
                .meta(MetaData.builder()
                        .timestamp(LocalDateTime.now().toString())
                        .requestId(UUID.randomUUID().toString())
                        .build())
                .build();
    }

    /**
     * Crea una respuesta de error simple sin detalles adicionales.
     *
     * @param code    Código de error
     * @param message Mensaje descriptivo
     * @param <T>     Tipo de los datos
     * @return ApiResponse con success=false
     */
    public static <T> ApiResponse<T> error(String code, String message) {
        return error(code, message, null);
    }
}
