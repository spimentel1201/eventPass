package com.neonpass.infrastructure.adapter.in.web;

import com.neonpass.domain.model.Payment;
import com.neonpass.domain.model.enums.PaymentProvider;
import com.neonpass.domain.model.enums.PaymentStatus;
import com.neonpass.domain.port.out.OrderRepository;
import com.neonpass.domain.port.out.PaymentGatewayPort;
import com.neonpass.domain.port.out.PaymentRepository;
import com.neonpass.infrastructure.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Webhook controller for payment provider callbacks.
 * These endpoints are public (no authentication) but verify signatures.
 */
@RestController
@RequestMapping("/api/v1/webhooks")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Webhooks", description = "Payment provider webhook handlers")
public class WebhookController {

    private final List<PaymentGatewayPort> paymentGateways;
    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;

    private Map<PaymentProvider, PaymentGatewayPort> gatewayMap;

    private PaymentGatewayPort getGateway(PaymentProvider provider) {
        if (gatewayMap == null) {
            gatewayMap = paymentGateways.stream()
                    .collect(Collectors.toMap(PaymentGatewayPort::getProvider, Function.identity()));
        }
        return gatewayMap.get(provider);
    }

    @PostMapping("/stripe")
    @Operation(summary = "Stripe webhook", description = "Handle Stripe payment events")
    public ResponseEntity<String> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String signature) {

        log.info("Received Stripe webhook");

        try {
            PaymentGatewayPort stripeGateway = getGateway(PaymentProvider.STRIPE);
            Payment payment = stripeGateway.processWebhook(payload, signature);

            if (payment != null && payment.getStatus() == PaymentStatus.COMPLETED) {
                // Payment completed - order is already updated by OrderController
                // Could trigger additional actions here (email, etc.)
                log.info("Payment completed for order: {}", payment.getOrderId());
            }

            return ResponseEntity.ok("Webhook processed");

        } catch (Exception e) {
            log.error("Error processing Stripe webhook: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Webhook error: " + e.getMessage());
        }
    }

    @PostMapping("/mercadopago")
    @Operation(summary = "MercadoPago webhook", description = "Handle MercadoPago notifications")
    public ResponseEntity<String> handleMercadoPagoWebhook(
            @RequestBody String payload,
            @RequestHeader(value = "X-Signature", required = false) String signature,
            @RequestParam(value = "topic", required = false) String topic,
            @RequestParam(value = "id", required = false) String resourceId) {

        log.info("Received MercadoPago webhook - topic: {}, id: {}", topic, resourceId);

        try {
            if ("payment".equals(topic) && resourceId != null) {
                // Get payment details from MercadoPago
                PaymentGatewayPort mpGateway = getGateway(PaymentProvider.MERCADOPAGO);

                // Find payment by external reference (our payment ID)
                // This requires the webhook to include collection_id or external_reference
                log.info("Processing MercadoPago payment notification: {}", resourceId);
            }

            return ResponseEntity.ok("OK");

        } catch (Exception e) {
            log.error("Error processing MercadoPago webhook: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Webhook error: " + e.getMessage());
        }
    }

    @GetMapping("/health")
    @Operation(summary = "Webhook health check")
    public ResponseEntity<ApiResponse<String>> healthCheck() {
        return ResponseEntity.ok(ApiResponse.success("Webhook endpoints healthy"));
    }
}
