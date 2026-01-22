package com.neonpass.domain.model;

import com.neonpass.domain.model.enums.PaymentProvider;
import com.neonpass.domain.model.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Payment domain model.
 * Represents a payment transaction linked to an order.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    private UUID id;

    /** Order this payment is for */
    private UUID orderId;

    /** User who made the payment */
    private UUID userId;

    /** Payment provider (STRIPE, MERCADOPAGO) */
    private PaymentProvider provider;

    /** Payment status */
    private PaymentStatus status;

    /** Amount in cents/smallest currency unit */
    private BigDecimal amount;

    /** Currency code (PEN, USD) */
    private String currency;

    /** External payment ID from provider */
    private String externalPaymentId;

    /** Client secret for frontend (Stripe) or preference ID (MP) */
    private String clientSecret;

    /** Checkout URL for redirect-based flows */
    private String checkoutUrl;

    /** Error message if payment failed */
    private String errorMessage;

    /** Metadata from provider response */
    private String metadata;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime completedAt;
}
