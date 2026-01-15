package com.neonpass.infrastructure.adapter.in.web;

import com.neonpass.application.service.VenueService;
import com.neonpass.domain.model.Venue;
import com.neonpass.domain.port.in.CreateVenueUseCase;
import com.neonpass.infrastructure.adapter.in.web.dto.request.VenueRequest;
import com.neonpass.infrastructure.adapter.in.web.dto.response.VenueResponse;
import com.neonpass.infrastructure.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Controlador REST para venues.
 */
@RestController
@RequestMapping("/api/v1/venues")
@RequiredArgsConstructor
@Tag(name = "Venues", description = "Gestión de recintos")
public class VenueController {

    private final CreateVenueUseCase createVenueUseCase;
    private final VenueService venueService;

    @PostMapping
    @Operation(summary = "Crear venue", description = "Crea un nuevo recinto")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<VenueResponse>> create(
            @Valid @RequestBody VenueRequest request) {

        var command = new CreateVenueUseCase.CreateVenueCommand(
                request.getOrganizationId(),
                request.getName(),
                request.getAddress(),
                request.getTimezone());

        Venue venue = createVenueUseCase.execute(command);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(toResponse(venue)));
    }

    @GetMapping
    @Operation(summary = "Listar venues", description = "Lista todos los recintos")
    public ResponseEntity<ApiResponse<List<VenueResponse>>> list() {
        List<VenueResponse> venues = venueService.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(venues));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener venue", description = "Obtiene un recinto por ID")
    public ResponseEntity<ApiResponse<VenueResponse>> getById(@PathVariable UUID id) {
        return venueService.findById(id)
                .map(venue -> ResponseEntity.ok(ApiResponse.success(toResponse(venue))))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/organization/{organizationId}")
    @Operation(summary = "Venues por organización", description = "Lista recintos de una organización")
    public ResponseEntity<ApiResponse<List<VenueResponse>>> byOrganization(
            @PathVariable UUID organizationId) {
        List<VenueResponse> venues = venueService.findByOrganization(organizationId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(venues));
    }

    private VenueResponse toResponse(Venue venue) {
        return VenueResponse.builder()
                .id(venue.getId())
                .organizationId(venue.getOrganizationId())
                .name(venue.getName())
                .address(venue.getAddress())
                .timezone(venue.getTimezone())
                .createdAt(venue.getCreatedAt())
                .build();
    }
}
