package com.neonpass.domain.model;

import com.neonpass.domain.model.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Modelo de dominio para Orden de Compra.
 * 
 * <p>
 * Representa una transacción de compra de tickets por un usuario.
 * </p>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Order {

    private UUID id;
    private UUID userId;
    private UUID eventId;
    private BigDecimal totalAmount;
    /** Comisión de la plataforma */
    private BigDecimal platformFee;
    /** Monto neto después de comisiones (totalAmount - platformFee) */
    private BigDecimal netAmount;
    private OrderStatus status;
    /** ID del Payment Intent de Stripe */
    private String paymentIntentId;
    private String currency;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
