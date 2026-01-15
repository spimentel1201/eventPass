package com.neonpass.infrastructure.adapter.in.web;

import com.neonpass.application.service.AdminService;
import com.neonpass.domain.model.Order;
import com.neonpass.domain.model.User;
import com.neonpass.domain.model.enums.OrderStatus;
import com.neonpass.domain.port.out.EventRepository;
import com.neonpass.domain.port.out.OrderRepository;
import com.neonpass.domain.port.out.TicketRepository;
import com.neonpass.domain.port.out.UserRepository;
import com.neonpass.infrastructure.adapter.in.web.dto.request.ChangeRoleRequest;
import com.neonpass.infrastructure.adapter.in.web.dto.response.AdminDashboardResponse;
import com.neonpass.infrastructure.adapter.in.web.dto.response.OrderResponse;
import com.neonpass.infrastructure.adapter.in.web.dto.response.PageResponse;
import com.neonpass.infrastructure.adapter.in.web.dto.response.UserResponse;
import com.neonpass.infrastructure.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Controlador REST para administración.
 * Solo accesible para usuarios con rol ADMIN.
 */
@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Endpoints de administración")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final TicketRepository ticketRepository;

    @GetMapping("/dashboard")
    @Operation(summary = "Dashboard", description = "Obtiene estadísticas generales de la plataforma")
    public ResponseEntity<ApiResponse<AdminDashboardResponse>> getDashboard() {
        AdminDashboardResponse dashboard = adminService.getDashboard();
        return ResponseEntity.ok(ApiResponse.success(dashboard));
    }

    @GetMapping("/users")
    @Operation(summary = "Listar usuarios", description = "Lista todos los usuarios con paginación")
    public ResponseEntity<ApiResponse<PageResponse<UserResponse>>> getAllUsers(
            @Parameter(description = "Número de página (0-indexed)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Tamaño de página") @RequestParam(defaultValue = "10") int size) {

        List<User> allUsers = adminService.getAllUsers();

        List<UserResponse> pagedUsers = allUsers.stream()
                .skip((long) page * size)
                .limit(size)
                .map(this::toUserResponse)
                .collect(Collectors.toList());

        PageResponse<UserResponse> pageResponse = PageResponse.of(
                pagedUsers, page, size, allUsers.size());

        return ResponseEntity.ok(ApiResponse.success(pageResponse));
    }

    @GetMapping("/users/{userId}")
    @Operation(summary = "Obtener usuario", description = "Obtiene un usuario por ID")
    public ResponseEntity<ApiResponse<UserResponse>> getUser(@PathVariable UUID userId) {
        return adminService.getUserById(userId)
                .map(user -> ResponseEntity.ok(ApiResponse.success(toUserResponse(user))))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/users/{userId}/role")
    @Operation(summary = "Cambiar rol", description = "Cambia el rol de un usuario")
    public ResponseEntity<ApiResponse<UserResponse>> changeUserRole(
            @PathVariable UUID userId,
            @Valid @RequestBody ChangeRoleRequest request) {

        User user = adminService.changeUserRole(userId, request.getRole());
        return ResponseEntity.ok(ApiResponse.success(toUserResponse(user)));
    }

    @DeleteMapping("/users/{userId}")
    @Operation(summary = "Desactivar usuario", description = "Desactiva un usuario (soft delete)")
    public ResponseEntity<Void> deactivateUser(@PathVariable UUID userId) {
        adminService.deactivateUser(userId);
        return ResponseEntity.noContent().build();
    }

    // ==========================================
    // ORDERS MANAGEMENT
    // ==========================================

    @GetMapping("/orders")
    @Operation(summary = "Listar órdenes", description = "Lista todas las órdenes con filtros y paginación")
    public ResponseEntity<ApiResponse<PageResponse<OrderResponse>>> getAllOrders(
            @Parameter(description = "Filtrar por estado") @RequestParam(required = false) OrderStatus status,
            @Parameter(description = "Filtrar por evento") @RequestParam(required = false) UUID eventId,
            @Parameter(description = "Filtrar por usuario") @RequestParam(required = false) UUID userId,
            @Parameter(description = "Número de página (0-indexed)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Tamaño de página") @RequestParam(defaultValue = "10") int size) {

        List<Order> allOrders = orderRepository.findAll();

        // Aplicar filtros
        if (status != null) {
            allOrders = allOrders.stream()
                    .filter(o -> status.equals(o.getStatus()))
                    .collect(Collectors.toList());
        }
        if (eventId != null) {
            allOrders = allOrders.stream()
                    .filter(o -> eventId.equals(o.getEventId()))
                    .collect(Collectors.toList());
        }
        if (userId != null) {
            allOrders = allOrders.stream()
                    .filter(o -> userId.equals(o.getUserId()))
                    .collect(Collectors.toList());
        }

        // Ordenar por fecha de creación descendente
        allOrders.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));

        // Paginar
        List<OrderResponse> pagedOrders = allOrders.stream()
                .skip((long) page * size)
                .limit(size)
                .map(this::toOrderResponse)
                .collect(Collectors.toList());

        PageResponse<OrderResponse> pageResponse = PageResponse.of(
                pagedOrders, page, size, allOrders.size());

        return ResponseEntity.ok(ApiResponse.success(pageResponse));
    }

    @GetMapping("/orders/{orderId}")
    @Operation(summary = "Obtener orden", description = "Obtiene una orden por ID")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrder(@PathVariable UUID orderId) {
        return orderRepository.findById(orderId)
                .map(order -> ResponseEntity.ok(ApiResponse.success(toOrderResponse(order))))
                .orElse(ResponseEntity.notFound().build());
    }

    private UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .createdAt(user.getCreatedAt())
                .build();
    }

    private OrderResponse toOrderResponse(Order order) {
        // Obtener info adicional
        String userEmail = userRepository.findById(order.getUserId())
                .map(User::getEmail)
                .orElse(null);

        String eventTitle = eventRepository.findById(order.getEventId())
                .map(e -> e.getTitle())
                .orElse(null);

        int ticketCount = ticketRepository.findByOrderId(order.getId()).size();

        return OrderResponse.builder()
                .id(order.getId())
                .userId(order.getUserId())
                .eventId(order.getEventId())
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .platformFee(order.getPlatformFee())
                .netAmount(order.getNetAmount())
                .currency(order.getCurrency())
                .createdAt(order.getCreatedAt())
                .userEmail(userEmail)
                .eventTitle(eventTitle)
                .ticketCount(ticketCount)
                .build();
    }
}
