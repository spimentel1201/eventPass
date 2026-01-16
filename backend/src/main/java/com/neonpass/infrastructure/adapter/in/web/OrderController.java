package com.neonpass.infrastructure.adapter.in.web;

import com.neonpass.domain.model.Order;
import com.neonpass.domain.port.in.CheckoutUseCase;
import com.neonpass.domain.port.in.GetOrderUseCase;
import com.neonpass.domain.port.in.GetUserOrdersUseCase;
import com.neonpass.infrastructure.adapter.in.web.dto.request.CheckoutRequest;
import com.neonpass.infrastructure.adapter.in.web.dto.response.CheckoutResponse;
import com.neonpass.infrastructure.adapter.in.web.dto.response.OrderResponse;
import com.neonpass.infrastructure.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Controlador REST para órdenes y checkout.
 */
@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@Tag(name = "Órdenes", description = "Checkout y gestión de órdenes")
@SecurityRequirement(name = "bearerAuth")
public class OrderController {

    private final CheckoutUseCase checkoutUseCase;
    private final GetOrderUseCase getOrderUseCase;
    private final GetUserOrdersUseCase getUserOrdersUseCase;

    @PostMapping("/checkout")
    @Operation(summary = "Procesar checkout", description = "Convierte asientos reservados en tickets")
    public ResponseEntity<ApiResponse<CheckoutResponse>> checkout(
            @Valid @RequestBody CheckoutRequest request,
            @AuthenticationPrincipal UUID userId) {

        var command = new CheckoutUseCase.CheckoutCommand(
                userId,
                request.getEventId(),
                request.getSeatIds());

        var result = checkoutUseCase.execute(command);

        var response = CheckoutResponse.builder()
                .orderId(result.orderId())
                .ticketCount(result.ticketCount())
                .totalAmount(result.totalAmount())
                .currency(result.currency())
                .ticketIds(result.ticketIds())
                .build();

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response));
    }

    @GetMapping("/{orderId}")
    @Operation(summary = "Obtener orden", description = "Obtiene una orden por ID")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrder(
            @PathVariable UUID orderId) {

        Order order = getOrderUseCase.getOrder(orderId);
        return ResponseEntity.ok(ApiResponse.success(toResponse(order)));
    }

    @GetMapping
    @Operation(summary = "Mis órdenes", description = "Lista las órdenes del usuario")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getMyOrders(
            @AuthenticationPrincipal UUID userId) {

        List<OrderResponse> orders = getUserOrdersUseCase.getOrdersByUser(userId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(orders));
    }

    private OrderResponse toResponse(Order order) {
        return OrderResponse.builder()
                .id(order.getId())
                .eventId(order.getEventId())
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .platformFee(order.getPlatformFee())
                .netAmount(order.getNetAmount())
                .currency(order.getCurrency())
                .createdAt(order.getCreatedAt())
                .build();
    }
}
