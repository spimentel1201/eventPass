package com.neonpass.infrastructure.adapter.in.web.dto.response;

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
 * Payment response DTO.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {

    private UUID id;
    private UUID orderId;
    private PaymentProvider provider;
    private PaymentStatus status;
    private BigDecimal amount;
    private String currency;

    /** Client secret for Stripe Elements */
    private String clientSecret;

    /** Checkout URL for MercadoPago redirect */
    private String checkoutUrl;

    /** Public key for frontend SDK */
    private String publicKey;

    private String errorMessage;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
}
