package com.neonpass.infrastructure.adapter.in.web;

import com.neonpass.domain.model.Payment;
import com.neonpass.domain.model.enums.PaymentProvider;
import com.neonpass.domain.port.out.PaymentGatewayPort;
import com.neonpass.domain.port.out.PaymentRepository;
import com.neonpass.infrastructure.common.ApiResponse;
import com.neonpass.infrastructure.adapter.in.web.dto.request.CreatePaymentRequest;
import com.neonpass.infrastructure.adapter.in.web.dto.response.PaymentResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * REST controller for payment operations.
 */
@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Payments", description = "Payment processing operations")
@SecurityRequirement(name = "bearerAuth")
public class PaymentController {

        private final PaymentRepository paymentRepository;
        private final List<PaymentGatewayPort> paymentGateways;

        @Value("${stripe.publishable-key:}")
        private String stripePublishableKey;

        @Value("${mercadopago.public-key:}")
        private String mercadoPagoPublicKey;

        private Map<PaymentProvider, PaymentGatewayPort> gatewayMap;

        private PaymentGatewayPort getGateway(PaymentProvider provider) {
                if (gatewayMap == null) {
                        gatewayMap = paymentGateways.stream()
                                        .collect(Collectors.toMap(PaymentGatewayPort::getProvider,
                                                        Function.identity()));
                }
                PaymentGatewayPort gateway = gatewayMap.get(provider);
                if (gateway == null) {
                        throw new IllegalArgumentException("Unknown payment provider: " + provider);
                }
                return gateway;
        }

        @PostMapping("/create-intent")
        @Operation(summary = "Create payment intent", description = "Creates a payment intent with the specified provider")
        public ResponseEntity<ApiResponse<PaymentResponse>> createPaymentIntent(
                        @Valid @RequestBody CreatePaymentRequest request,
                        @AuthenticationPrincipal UUID userId) {

                log.info("Creating payment intent for order: {} with provider: {}",
                                request.getOrderId(), request.getProvider());

                PaymentGatewayPort gateway = getGateway(request.getProvider());

                Payment payment = gateway.createPaymentIntent(
                                request.getOrderId(),
                                userId,
                                request.getAmount(),
                                request.getCurrency() != null ? request.getCurrency() : "PEN",
                                request.getDescription() != null ? request.getDescription()
                                                : "NeonPass Ticket Purchase",
                                null);

                PaymentResponse response = toResponse(payment);
                return ResponseEntity.ok(ApiResponse.success(response));
        }

        @GetMapping("/{paymentId}")
        @Operation(summary = "Get payment", description = "Get payment details by ID")
        public ResponseEntity<ApiResponse<PaymentResponse>> getPayment(@PathVariable UUID paymentId) {
                Payment payment = paymentRepository.findById(paymentId)
                                .orElseThrow(() -> new RuntimeException("Payment not found: " + paymentId));

                return ResponseEntity.ok(ApiResponse.success(toResponse(payment)));
        }

        @GetMapping("/{paymentId}/status")
        @Operation(summary = "Get payment status", description = "Get current payment status from provider")
        public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentStatus(@PathVariable UUID paymentId) {
                Payment payment = paymentRepository.findById(paymentId)
                                .orElseThrow(() -> new RuntimeException("Payment not found: " + paymentId));

                PaymentGatewayPort gateway = getGateway(payment.getProvider());
                Payment updatedPayment = gateway.getPaymentStatus(payment.getExternalPaymentId());

                return ResponseEntity.ok(ApiResponse.success(toResponse(updatedPayment)));
        }

        @PostMapping("/{paymentId}/confirm")
        @Operation(summary = "Confirm payment", description = "Confirm a pending payment")
        public ResponseEntity<ApiResponse<PaymentResponse>> confirmPayment(
                        @PathVariable UUID paymentId,
                        @RequestParam String externalPaymentId) {

                Payment payment = paymentRepository.findById(paymentId)
                                .orElseThrow(() -> new RuntimeException("Payment not found: " + paymentId));

                PaymentGatewayPort gateway = getGateway(payment.getProvider());
                Payment confirmedPayment = gateway.confirmPayment(paymentId, externalPaymentId);

                return ResponseEntity.ok(ApiResponse.success(toResponse(confirmedPayment)));
        }

        @GetMapping("/config")
        @Operation(summary = "Get payment config", description = "Get public keys for payment SDKs")
        public ResponseEntity<ApiResponse<Map<String, String>>> getPaymentConfig() {
                Map<String, String> config = Map.of(
                                "stripePublishableKey", stripePublishableKey != null ? stripePublishableKey : "",
                                "mercadoPagoPublicKey", mercadoPagoPublicKey != null ? mercadoPagoPublicKey : "");
                return ResponseEntity.ok(ApiResponse.success(config));
        }

        @GetMapping("/my-payments")
        @Operation(summary = "Get user payments", description = "Get all payments for authenticated user")
        public ResponseEntity<ApiResponse<List<PaymentResponse>>> getMyPayments(
                        @AuthenticationPrincipal UUID userId) {

                List<Payment> payments = paymentRepository.findByUserId(userId);
                List<PaymentResponse> responses = payments.stream()
                                .map(this::toResponse)
                                .collect(Collectors.toList());

                return ResponseEntity.ok(ApiResponse.success(responses));
        }

        private PaymentResponse toResponse(Payment payment) {
                return PaymentResponse.builder()
                                .id(payment.getId())
                                .orderId(payment.getOrderId())
                                .provider(payment.getProvider())
                                .status(payment.getStatus())
                                .amount(payment.getAmount())
                                .currency(payment.getCurrency())
                                .clientSecret(payment.getClientSecret())
                                .checkoutUrl(payment.getCheckoutUrl())
                                .publicKey(payment.getProvider() == PaymentProvider.STRIPE
                                                ? stripePublishableKey
                                                : mercadoPagoPublicKey)
                                .errorMessage(payment.getErrorMessage())
                                .createdAt(payment.getCreatedAt())
                                .completedAt(payment.getCompletedAt())
                                .build();
        }
}
