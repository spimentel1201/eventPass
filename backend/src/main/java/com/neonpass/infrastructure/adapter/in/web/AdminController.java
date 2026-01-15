package com.neonpass.infrastructure.adapter.in.web;

import com.neonpass.application.service.AdminService;
import com.neonpass.domain.model.User;
import com.neonpass.infrastructure.adapter.in.web.dto.request.ChangeRoleRequest;
import com.neonpass.infrastructure.adapter.in.web.dto.response.AdminDashboardResponse;
import com.neonpass.infrastructure.adapter.in.web.dto.response.UserResponse;
import com.neonpass.infrastructure.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
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

    @GetMapping("/dashboard")
    @Operation(summary = "Dashboard", description = "Obtiene estadísticas generales de la plataforma")
    public ResponseEntity<ApiResponse<AdminDashboardResponse>> getDashboard() {
        AdminDashboardResponse dashboard = adminService.getDashboard();
        return ResponseEntity.ok(ApiResponse.success(dashboard));
    }

    @GetMapping("/users")
    @Operation(summary = "Listar usuarios", description = "Lista todos los usuarios de la plataforma")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        List<UserResponse> users = adminService.getAllUsers().stream()
                .map(this::toUserResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(users));
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

    private UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
