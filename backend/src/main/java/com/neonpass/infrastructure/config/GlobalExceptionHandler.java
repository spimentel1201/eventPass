package com.neonpass.infrastructure.config;

import com.neonpass.domain.exception.*;
import com.neonpass.infrastructure.common.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

/**
 * Manejador global de excepciones para la API.
 * 
 * <p>
 * Convierte todas las excepciones en respuestas ApiResponse estandarizadas
 * según las convenciones de API_CONVENTIONS.md.
 * </p>
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    // ==================== 404 Not Found ====================

    @ExceptionHandler(EventNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleEventNotFound(EventNotFoundException ex) {
        log.warn("Evento no encontrado: {}", ex.getEventId());
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("EVENT_NOT_FOUND", ex.getMessage()));
    }

    @ExceptionHandler(SeatNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleSeatNotFound(SeatNotFoundException ex) {
        log.warn("Asiento no encontrado: {}", ex.getSeatId());
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("SEAT_NOT_FOUND", ex.getMessage()));
    }

    @ExceptionHandler(OrderNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleOrderNotFound(OrderNotFoundException ex) {
        log.warn("Orden no encontrada: {}", ex.getOrderId());
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("ORDER_NOT_FOUND", ex.getMessage()));
    }

    // ==================== 401 Unauthorized ====================

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ApiResponse<Void>> handleInvalidCredentials(InvalidCredentialsException ex) {
        log.warn("Credenciales inválidas");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("INVALID_CREDENTIALS", ex.getMessage()));
    }

    // ==================== 409 Conflict ====================

    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<ApiResponse<Void>> handleEmailAlreadyExists(EmailAlreadyExistsException ex) {
        log.warn("Email ya registrado: {}", ex.getEmail());
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiResponse.error("EMAIL_ALREADY_EXISTS", ex.getMessage()));
    }

    @ExceptionHandler(SeatNotAvailableException.class)
    public ResponseEntity<ApiResponse<Void>> handleSeatNotAvailable(SeatNotAvailableException ex) {
        log.warn("Asiento no disponible: {} para evento {}", ex.getSeatId(), ex.getEventId());
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiResponse.error("SEAT_NOT_AVAILABLE", ex.getMessage()));
    }

    @ExceptionHandler(SeatAlreadySoldException.class)
    public ResponseEntity<ApiResponse<Void>> handleSeatAlreadySold(SeatAlreadySoldException ex) {
        log.warn("Asiento ya vendido: {}", ex.getSeatId());
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiResponse.error("SEAT_ALREADY_SOLD", ex.getMessage()));
    }

    @ExceptionHandler(TicketAlreadyUsedException.class)
    public ResponseEntity<ApiResponse<Void>> handleTicketAlreadyUsed(TicketAlreadyUsedException ex) {
        log.warn("Ticket ya usado: {}", ex.getTicketId());
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiResponse.error("TICKET_ALREADY_USED", ex.getMessage()));
    }

    // ==================== 410 Gone ====================

    @ExceptionHandler(ReservationExpiredException.class)
    public ResponseEntity<ApiResponse<Void>> handleReservationExpired(ReservationExpiredException ex) {
        log.warn("Reserva expirada para asiento: {}", ex.getSeatId());
        return ResponseEntity.status(HttpStatus.GONE)
                .body(ApiResponse.error("RESERVATION_EXPIRED", ex.getMessage()));
    }

    // ==================== 422 Unprocessable Entity ====================

    @ExceptionHandler(PaymentFailedException.class)
    public ResponseEntity<ApiResponse<Void>> handlePaymentFailed(PaymentFailedException ex) {
        log.error("Error de pago: {}", ex.getReason());
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                .body(ApiResponse.error("PAYMENT_FAILED", ex.getMessage()));
    }

    // ==================== 400 Bad Request ====================

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidationErrors(MethodArgumentNotValidException ex) {
        Map<String, Object> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        log.warn("Errores de validación: {}", errors);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("VALIDATION_ERROR", "Error de validación en los campos", errors));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Void>> handleIllegalArgument(IllegalArgumentException ex) {
        log.warn("Argumento inválido: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("INVALID_ARGUMENT", ex.getMessage()));
    }

    // ==================== 500 Internal Server Error ====================

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGenericException(Exception ex) {
        log.error("Error interno del servidor: ", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("INTERNAL_ERROR", "Error interno del servidor"));
    }
}
