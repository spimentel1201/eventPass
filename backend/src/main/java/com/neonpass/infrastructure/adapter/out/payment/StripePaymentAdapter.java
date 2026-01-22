package com.neonpass.infrastructure.adapter.out.payment;

import com.neonpass.domain.model.Payment;
import com.neonpass.domain.model.enums.PaymentProvider;
import com.neonpass.domain.model.enums.PaymentStatus;
import com.neonpass.domain.port.out.PaymentGatewayPort;
import com.neonpass.domain.port.out.PaymentRepository;
import com.stripe.Stripe;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Refund;
import com.stripe.net.Webhook;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.RefundCreateParams;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Stripe payment gateway adapter.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class StripePaymentAdapter implements PaymentGatewayPort {

    private final PaymentRepository paymentRepository;

    @Value("${stripe.secret-key:}")
    private String secretKey;

    @Value("${stripe.webhook-secret:}")
    private String webhookSecret;

    @PostConstruct
    public void init() {
        if (secretKey != null && !secretKey.isEmpty()) {
            Stripe.apiKey = secretKey;
            log.info("Stripe API initialized");
        } else {
            log.warn("Stripe API key not configured");
        }
    }

    @Override
    public PaymentProvider getProvider() {
        return PaymentProvider.STRIPE;
    }

    @Override
    public Payment createPaymentIntent(
            UUID orderId,
            UUID userId,
            BigDecimal amount,
            String currency,
            String description,
            String metadata) {

        Payment payment = Payment.builder()
                .id(UUID.randomUUID())
                .orderId(orderId)
                .userId(userId)
                .provider(PaymentProvider.STRIPE)
                .status(PaymentStatus.PENDING)
                .amount(amount)
                .currency(currency.toUpperCase())
                .createdAt(LocalDateTime.now())
                .build();

        try {
            // Convert to cents for Stripe
            long amountInCents = amount.multiply(BigDecimal.valueOf(100)).longValue();

            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(amountInCents)
                    .setCurrency(currency.toLowerCase())
                    .setDescription(description)
                    .putMetadata("order_id", orderId.toString())
                    .putMetadata("payment_id", payment.getId().toString())
                    .setAutomaticPaymentMethods(
                            PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                    .setEnabled(true)
                                    .build())
                    .build();

            PaymentIntent paymentIntent = PaymentIntent.create(params);

            payment.setExternalPaymentId(paymentIntent.getId());
            payment.setClientSecret(paymentIntent.getClientSecret());
            payment.setStatus(PaymentStatus.PROCESSING);
            payment.setMetadata("{\"payment_intent_id\":\"" + paymentIntent.getId() + "\"}");

            log.info("Created Stripe PaymentIntent: {}", paymentIntent.getId());

        } catch (StripeException e) {
            log.error("Stripe error creating payment intent: {}", e.getMessage());
            payment.setStatus(PaymentStatus.FAILED);
            payment.setErrorMessage(e.getMessage());
        }

        return paymentRepository.save(payment);
    }

    @Override
    public Payment confirmPayment(UUID paymentId, String externalPaymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found: " + paymentId));

        try {
            PaymentIntent paymentIntent = PaymentIntent.retrieve(externalPaymentId);
            updatePaymentFromIntent(payment, paymentIntent);
        } catch (StripeException e) {
            log.error("Error confirming Stripe payment: {}", e.getMessage());
            payment.setStatus(PaymentStatus.FAILED);
            payment.setErrorMessage(e.getMessage());
        }

        payment.setUpdatedAt(LocalDateTime.now());
        return paymentRepository.save(payment);
    }

    @Override
    public Payment getPaymentStatus(String externalPaymentId) {
        Payment payment = paymentRepository.findByExternalPaymentId(externalPaymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found for: " + externalPaymentId));

        try {
            PaymentIntent paymentIntent = PaymentIntent.retrieve(externalPaymentId);
            updatePaymentFromIntent(payment, paymentIntent);
            payment.setUpdatedAt(LocalDateTime.now());
            return paymentRepository.save(payment);
        } catch (StripeException e) {
            log.error("Error getting Stripe payment status: {}", e.getMessage());
            throw new RuntimeException("Error getting payment status", e);
        }
    }

    @Override
    public Payment processWebhook(String payload, String signature) {
        Event event;
        try {
            event = Webhook.constructEvent(payload, signature, webhookSecret);
        } catch (SignatureVerificationException e) {
            log.error("Invalid Stripe webhook signature");
            throw new RuntimeException("Invalid webhook signature");
        }

        log.info("Received Stripe webhook event: {}", event.getType());

        if ("payment_intent.succeeded".equals(event.getType()) ||
                "payment_intent.payment_failed".equals(event.getType())) {

            PaymentIntent paymentIntent = (PaymentIntent) event.getDataObjectDeserializer()
                    .getObject().orElseThrow();

            String paymentIntentId = paymentIntent.getId();
            Payment payment = paymentRepository.findByExternalPaymentId(paymentIntentId)
                    .orElse(null);

            if (payment != null) {
                updatePaymentFromIntent(payment, paymentIntent);
                payment.setUpdatedAt(LocalDateTime.now());
                return paymentRepository.save(payment);
            }
        }

        return null;
    }

    @Override
    public Payment refundPayment(UUID paymentId, BigDecimal amount) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found: " + paymentId));

        try {
            RefundCreateParams.Builder refundBuilder = RefundCreateParams.builder()
                    .setPaymentIntent(payment.getExternalPaymentId());

            if (amount != null) {
                refundBuilder.setAmount(amount.multiply(BigDecimal.valueOf(100)).longValue());
            }

            Refund refund = Refund.create(refundBuilder.build());

            payment.setStatus(PaymentStatus.REFUNDED);
            payment.setUpdatedAt(LocalDateTime.now());
            log.info("Refund created: {}", refund.getId());

        } catch (StripeException e) {
            log.error("Error refunding Stripe payment: {}", e.getMessage());
            throw new RuntimeException("Error processing refund", e);
        }

        return paymentRepository.save(payment);
    }

    private void updatePaymentFromIntent(Payment payment, PaymentIntent paymentIntent) {
        String status = paymentIntent.getStatus();
        switch (status) {
            case "succeeded":
                payment.setStatus(PaymentStatus.COMPLETED);
                payment.setCompletedAt(LocalDateTime.now());
                break;
            case "processing":
                payment.setStatus(PaymentStatus.PROCESSING);
                break;
            case "canceled":
                payment.setStatus(PaymentStatus.CANCELLED);
                break;
            case "requires_payment_method":
            case "requires_action":
            case "requires_confirmation":
                payment.setStatus(PaymentStatus.PENDING);
                break;
            default:
                log.warn("Unknown PaymentIntent status: {}", status);
        }
    }
}
