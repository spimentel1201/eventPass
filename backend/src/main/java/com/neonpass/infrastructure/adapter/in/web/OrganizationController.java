package com.neonpass.infrastructure.adapter.in.web;

import com.neonpass.application.service.OrganizationService;
import com.neonpass.domain.model.Organization;
import com.neonpass.domain.port.in.CreateOrganizationUseCase;
import com.neonpass.infrastructure.adapter.in.web.dto.request.OrganizationRequest;
import com.neonpass.infrastructure.adapter.in.web.dto.response.OrganizationResponse;
import com.neonpass.infrastructure.adapter.in.web.dto.response.PageResponse;
import com.neonpass.infrastructure.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
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
 * Controlador REST para organizaciones.
 */
@RestController
@RequestMapping("/api/v1/organizations")
@RequiredArgsConstructor
@Tag(name = "Organizaciones", description = "Gestión de organizaciones promotoras")
public class OrganizationController {

        private final CreateOrganizationUseCase createOrganizationUseCase;
        private final OrganizationService organizationService;

        @PostMapping
        @Operation(summary = "Crear organización", description = "Crea una nueva organización")
        @SecurityRequirement(name = "bearerAuth")
        public ResponseEntity<ApiResponse<OrganizationResponse>> create(
                        @Valid @RequestBody OrganizationRequest request,
                        @AuthenticationPrincipal UUID userId) {

                var command = new CreateOrganizationUseCase.CreateOrganizationCommand(
                                userId,
                                request.getName(),
                                request.getSlug());

                Organization org = createOrganizationUseCase.execute(command);

                return ResponseEntity.status(HttpStatus.CREATED)
                                .body(ApiResponse.success(toResponse(org)));
        }

        @GetMapping
        @Operation(summary = "Listar organizaciones", description = "Lista todas las organizaciones con paginación")
        public ResponseEntity<ApiResponse<PageResponse<OrganizationResponse>>> list(
                        @Parameter(description = "Número de página (0-indexed)") @RequestParam(defaultValue = "0") int page,
                        @Parameter(description = "Tamaño de página") @RequestParam(defaultValue = "10") int size) {

                List<Organization> allOrgs = organizationService.findAll();

                int start = page * size;
                int end = Math.min(start + size, allOrgs.size());

                List<OrganizationResponse> pagedOrgs = allOrgs.stream()
                                .skip(start)
                                .limit(size)
                                .map(this::toResponse)
                                .collect(Collectors.toList());

                PageResponse<OrganizationResponse> pageResponse = PageResponse.of(
                                pagedOrgs, page, size, allOrgs.size());

                return ResponseEntity.ok(ApiResponse.success(pageResponse));
        }

        @GetMapping("/{id}")
        @Operation(summary = "Obtener organización", description = "Obtiene una organización por ID")
        public ResponseEntity<ApiResponse<OrganizationResponse>> getById(@PathVariable UUID id) {
                return organizationService.findById(id)
                                .map(org -> ResponseEntity.ok(ApiResponse.success(toResponse(org))))
                                .orElse(ResponseEntity.notFound().build());
        }

        @GetMapping("/my")
        @Operation(summary = "Mis organizaciones", description = "Lista las organizaciones del usuario")
        @SecurityRequirement(name = "bearerAuth")
        public ResponseEntity<ApiResponse<List<OrganizationResponse>>> myOrganizations(
                        @AuthenticationPrincipal UUID userId) {
                List<OrganizationResponse> orgs = organizationService.findByOwner(userId).stream()
                                .map(this::toResponse)
                                .collect(Collectors.toList());

                return ResponseEntity.ok(ApiResponse.success(orgs));
        }

        private OrganizationResponse toResponse(Organization org) {
                return OrganizationResponse.builder()
                                .id(org.getId())
                                .ownerId(org.getOwnerId())
                                .name(org.getName())
                                .slug(org.getSlug())
                                .createdAt(org.getCreatedAt())
                                .build();
        }
}
