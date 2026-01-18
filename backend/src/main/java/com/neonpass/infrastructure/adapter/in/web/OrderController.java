package com.neonpass.infrastructure.adapter.in.web;

import com.neonpass.application.service.TicketService;
import com.neonpass.domain.model.Order;
import com.neonpass.domain.model.Ticket;
import com.neonpass.domain.model.enums.OrderStatus;
import com.neonpass.domain.port.in.CheckoutUseCase;
import com.neonpass.domain.port.in.GetOrderUseCase;
import com.neonpass.domain.port.in.GetUserOrdersUseCase;
import com.neonpass.domain.port.out.EventRepository;
import com.neonpass.domain.port.out.OrderRepository;
import com.neonpass.domain.port.out.TicketRepository;
import com.neonpass.infrastructure.adapter.in.web.dto.request.CheckoutRequest;
import com.neonpass.infrastructure.adapter.in.web.dto.request.SectionCheckoutRequest;
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

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
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
        private final OrderRepository orderRepository;
        private final EventRepository eventRepository;
        private final TicketRepository ticketRepository;
        private final TicketService ticketService;

        @PostMapping("/checkout")
        @Operation(summary = "Procesar checkout por sección", description = "Crear orden basada en selección de secciones y cantidades")
        public ResponseEntity<ApiResponse<CheckoutResponse>> checkout(
                        @Valid @RequestBody SectionCheckoutRequest request,
                        @AuthenticationPrincipal UUID userId) {

                // Calculate total from items
                BigDecimal total = request.getItems().stream()
                                .map(item -> item.getPricePerTicket().multiply(BigDecimal.valueOf(item.getQuantity())))
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                // Add platform fee (10%)
                BigDecimal platformFee = total.multiply(BigDecimal.valueOf(0.10));
                BigDecimal grandTotal = total.add(platformFee);

                // Create order
                Order order = Order.builder()
                                .id(UUID.randomUUID())
                                .userId(userId)
                                .eventId(request.getEventId())
                                .status(OrderStatus.PAID)
                                .totalAmount(grandTotal)
                                .platformFee(platformFee)
                                .netAmount(total)
                                .currency("PEN")
                                .createdAt(LocalDateTime.now())
                                .build();

                // Save order to database
                Order savedOrder = orderRepository.save(order);

                // Create tickets for each item
                List<UUID> ticketIds = new ArrayList<>();
                for (SectionCheckoutRequest.SectionItem item : request.getItems()) {
                        for (int i = 0; i < item.getQuantity(); i++) {
                                Ticket ticket = ticketService.createTicket(
                                                savedOrder.getId(),
                                                request.getEventId(),
                                                null, // ticketTierId - could use sectionId as tier
                                                null, // seatId - General Admission
                                                item.getPricePerTicket(),
                                                "PEN");
                                ticketIds.add(ticket.getId());
                        }
                }

                int ticketCount = ticketIds.size();

                var response = CheckoutResponse.builder()
                                .orderId(savedOrder.getId())
                                .ticketCount(ticketCount)
                                .totalAmount(grandTotal)
                                .currency("PEN")
                                .ticketIds(ticketIds)
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
                String eventTitle = null;
                if (order.getEventId() != null) {
                        eventTitle = eventRepository.findById(order.getEventId())
                                        .map(e -> e.getTitle())
                                        .orElse(null);
                }

                int ticketCount = ticketRepository.findByOrderId(order.getId()).size();

                return OrderResponse.builder()
                                .id(order.getId())
                                .eventId(order.getEventId())
                                .status(order.getStatus())
                                .totalAmount(order.getTotalAmount())
                                .platformFee(order.getPlatformFee())
                                .netAmount(order.getNetAmount())
                                .currency(order.getCurrency())
                                .createdAt(order.getCreatedAt())
                                .eventTitle(eventTitle)
                                .ticketCount(ticketCount)
                                .build();
        }
}
