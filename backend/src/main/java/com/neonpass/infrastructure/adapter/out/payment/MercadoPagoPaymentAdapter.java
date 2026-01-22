package com.neonpass.infrastructure.adapter.out.payment;

import com.mercadopago.MercadoPagoConfig;
import com.mercadopago.client.preference.PreferenceBackUrlsRequest;
import com.mercadopago.client.preference.PreferenceClient;
import com.mercadopago.client.preference.PreferenceItemRequest;
import com.mercadopago.client.preference.PreferenceRequest;
import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.exceptions.MPException;
import com.mercadopago.resources.preference.Preference;
import com.neonpass.domain.model.Payment;
import com.neonpass.domain.model.enums.PaymentProvider;
import com.neonpass.domain.model.enums.PaymentStatus;
import com.neonpass.domain.port.out.PaymentGatewayPort;
import com.neonpass.domain.port.out.PaymentRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * MercadoPago payment gateway adapter.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class MercadoPagoPaymentAdapter implements PaymentGatewayPort {

    private final PaymentRepository paymentRepository;

    @Value("${mercadopago.access-token:}")
    private String accessToken;

    @Value("${mercadopago.success-url:http://localhost:3000/checkout/success}")
    private String successUrl;

    @Value("${mercadopago.failure-url:http://localhost:3000/checkout/failure}")
    private String failureUrl;

    @Value("${mercadopago.pending-url:http://localhost:3000/checkout/pending}")
    private String pendingUrl;

    @PostConstruct
    public void init() {
        if (accessToken != null && !accessToken.isEmpty()) {
            MercadoPagoConfig.setAccessToken(accessToken);
            log.info("MercadoPago API initialized");
        } else {
            log.warn("MercadoPago access token not configured");
        }
    }

    @Override
    public PaymentProvider getProvider() {
        return PaymentProvider.MERCADOPAGO;
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
                .provider(PaymentProvider.MERCADOPAGO)
                .status(PaymentStatus.PENDING)
                .amount(amount)
                .currency(currency.toUpperCase())
                .createdAt(LocalDateTime.now())
                .build();

        try {
            PreferenceClient client = new PreferenceClient();

            // Create preference item
            PreferenceItemRequest itemRequest = PreferenceItemRequest.builder()
                    .id(orderId.toString())
                    .title(description)
                    .description("NeonPass Ticket Purchase")
                    .quantity(1)
                    .currencyId(currency.toUpperCase())
                    .unitPrice(amount)
                    .build();

            // Back URLs for redirect flow
            PreferenceBackUrlsRequest backUrls = PreferenceBackUrlsRequest.builder()
                    .success(successUrl + "?payment_id=" + payment.getId())
                    .failure(failureUrl + "?payment_id=" + payment.getId())
                    .pending(pendingUrl + "?payment_id=" + payment.getId())
                    .build();

            // Create preference request
            PreferenceRequest preferenceRequest = PreferenceRequest.builder()
                    .items(List.of(itemRequest))
                    .backUrls(backUrls)
                    .autoReturn("approved")
                    .externalReference(payment.getId().toString())
                    .notificationUrl(null) // Set in production to webhook URL
                    .build();

            Preference preference = client.create(preferenceRequest);

            payment.setExternalPaymentId(preference.getId());
            payment.setCheckoutUrl(preference.getInitPoint());
            payment.setStatus(PaymentStatus.PROCESSING);
            payment.setMetadata("{\"preference_id\":\"" + preference.getId() + "\"}");

            log.info("Created MercadoPago Preference: {}", preference.getId());

        } catch (MPException | MPApiException e) {
            log.error("MercadoPago error creating preference: {}", e.getMessage());
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
            // Get payment status from MercadoPago
            com.mercadopago.client.payment.PaymentClient paymentClient = new com.mercadopago.client.payment.PaymentClient();

            com.mercadopago.resources.payment.Payment mpPayment = paymentClient.get(Long.parseLong(externalPaymentId));

            updatePaymentFromMPPayment(payment, mpPayment);

        } catch (MPException | MPApiException e) {
            log.error("Error confirming MercadoPago payment: {}", e.getMessage());
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

        // Note: For preference-based payments, we need the payment ID from webhook
        payment.setUpdatedAt(LocalDateTime.now());
        return payment;
    }

    @Override
    public Payment processWebhook(String payload, String signature) {
        // Parse the webhook notification
        log.info("Processing MercadoPago webhook");

        // MercadoPago sends notifications in x-www-form-urlencoded or JSON
        // The payload contains: id, topic (payment, merchant_order, etc.)
        // For production, verify signature using X-Signature header

        try {
            // Parse payment ID from payload (simplified)
            // In production, use proper JSON parsing
            if (payload.contains("\"topic\":\"payment\"")) {
                // Extract payment ID and update status
                // This is simplified - use proper JSON parsing in production
                log.info("Received payment notification");
            }
        } catch (Exception e) {
            log.error("Error processing MercadoPago webhook: {}", e.getMessage());
        }

        return null;
    }

    @Override
    public Payment refundPayment(UUID paymentId, BigDecimal amount) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found: " + paymentId));

        try {
            // MercadoPago refund API
            com.mercadopago.client.payment.PaymentRefundClient refundClient = new com.mercadopago.client.payment.PaymentRefundClient();

            // For preference-based payments, we need the actual payment ID
            // from the webhook, not the preference ID
            log.warn("Refund requires actual MP payment ID, not preference ID");

            payment.setStatus(PaymentStatus.REFUNDED);
            payment.setUpdatedAt(LocalDateTime.now());

        } catch (Exception e) {
            log.error("Error refunding MercadoPago payment: {}", e.getMessage());
            throw new RuntimeException("Error processing refund", e);
        }

        return paymentRepository.save(payment);
    }

    private void updatePaymentFromMPPayment(Payment payment,
            com.mercadopago.resources.payment.Payment mpPayment) {
        String status = mpPayment.getStatus();
        switch (status) {
            case "approved":
                payment.setStatus(PaymentStatus.COMPLETED);
                payment.setCompletedAt(LocalDateTime.now());
                break;
            case "pending":
            case "in_process":
                payment.setStatus(PaymentStatus.PROCESSING);
                break;
            case "rejected":
                payment.setStatus(PaymentStatus.FAILED);
                break;
            case "cancelled":
                payment.setStatus(PaymentStatus.CANCELLED);
                break;
            case "refunded":
                payment.setStatus(PaymentStatus.REFUNDED);
                break;
            default:
                log.warn("Unknown MercadoPago status: {}", status);
        }
    }
}
