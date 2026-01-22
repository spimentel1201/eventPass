package com.neonpass.domain.port.out;

import com.neonpass.domain.model.Payment;
import com.neonpass.domain.model.enums.PaymentProvider;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Port for payment gateway operations.
 * Implemented by StripePaymentAdapter and MercadoPagoPaymentAdapter.
 */
public interface PaymentGatewayPort {

    /**
     * Returns which provider this adapter handles.
     */
    PaymentProvider getProvider();

    /**
     * Create a payment intent/preference with the provider.
     * 
     * @param orderId     Order ID
     * @param amount      Amount in base currency units
     * @param currency    Currency code (PEN, USD)
     * @param description Payment description
     * @param metadata    Additional metadata
     * @return Created payment with client secret or checkout URL
     */
    Payment createPaymentIntent(
            UUID orderId,
            UUID userId,
            BigDecimal amount,
            String currency,
            String description,
            String metadata);

    /**
     * Confirm/capture a payment after user authorization.
     * 
     * @param paymentId         Internal payment ID
     * @param externalPaymentId External payment ID from provider
     * @return Updated payment with status
     */
    Payment confirmPayment(UUID paymentId, String externalPaymentId);

    /**
     * Get payment status from provider.
     * 
     * @param externalPaymentId External payment ID
     * @return Current payment with updated status
     */
    Payment getPaymentStatus(String externalPaymentId);

    /**
     * Process webhook event from provider.
     * 
     * @param payload   Raw webhook payload
     * @param signature Signature header for verification
     * @return Updated payment or null if not a payment event
     */
    Payment processWebhook(String payload, String signature);

    /**
     * Refund a completed payment.
     * 
     * @param paymentId Internal payment ID
     * @param amount    Amount to refund (null for full refund)
     * @return Updated payment with refund status
     */
    Payment refundPayment(UUID paymentId, BigDecimal amount);
}
