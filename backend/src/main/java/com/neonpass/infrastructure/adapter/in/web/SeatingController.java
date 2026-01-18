package com.neonpass.infrastructure.adapter.in.web;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.neonpass.application.service.SeatingMapService;
import com.neonpass.domain.model.Section;
import com.neonpass.domain.model.Seat;
import com.neonpass.infrastructure.adapter.in.web.dto.request.SeatRequest;
import com.neonpass.infrastructure.adapter.in.web.dto.request.SectionRequest;
import com.neonpass.infrastructure.adapter.in.web.dto.request.VenueLayoutRequest;
import com.neonpass.infrastructure.adapter.in.web.dto.response.SeatResponse;
import com.neonpass.infrastructure.adapter.in.web.dto.response.SectionResponse;
import com.neonpass.infrastructure.adapter.in.web.dto.response.SeatingMapResponse;
import com.neonpass.infrastructure.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Controlador REST para gestión de layouts, secciones y asientos.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Seating", description = "Gestión de layouts, secciones y asientos")
public class SeatingController {

        private final SeatingMapService seatingMapService;
        private final ObjectMapper objectMapper;

        // ==========================================
        // VENUE LAYOUT
        // ==========================================

        @PutMapping("/venues/{venueId}/layout")
        @Operation(summary = "Guardar layout", description = "Guarda el layout del venue desde el editor visual")
        @SecurityRequirement(name = "bearerAuth")
        public ResponseEntity<ApiResponse<Void>> saveVenueLayout(
                        @PathVariable UUID venueId,
                        @RequestBody VenueLayoutRequest request) {

                seatingMapService.saveVenueLayout(venueId, request.getLayout());
                return ResponseEntity.ok(ApiResponse.success(null));
        }

        @GetMapping("/venues/{venueId}/layout")
        @Operation(summary = "Obtener layout", description = "Obtiene el layout del venue para el editor")
        public ResponseEntity<ApiResponse<Map<String, Object>>> getVenueLayout(
                        @PathVariable UUID venueId) {

                Map<String, Object> layout = seatingMapService.getVenueLayout(venueId);
                return ResponseEntity.ok(ApiResponse.success(layout));
        }

        // ==========================================
        // EVENT SEATING MAP (para compra)
        // ==========================================

        @GetMapping("/events/{eventId}/seating-map")
        @Operation(summary = "Mapa de asientos", description = "Obtiene el mapa de asientos con disponibilidad para un evento")
        public ResponseEntity<ApiResponse<SeatingMapResponse>> getEventSeatingMap(
                        @PathVariable UUID eventId) {

                SeatingMapResponse seatingMap = seatingMapService.getEventSeatingMap(eventId);
                return ResponseEntity.ok(ApiResponse.success(seatingMap));
        }

        // ==========================================
        // SECTIONS
        // ==========================================

        @PostMapping("/sections")
        @Operation(summary = "Crear sección", description = "Crea una nueva sección en un venue")
        @SecurityRequirement(name = "bearerAuth")
        public ResponseEntity<ApiResponse<SectionResponse>> createSection(
                        @Valid @RequestBody SectionRequest request) {

                Section section = seatingMapService.createSection(
                                request.getVenueId(),
                                request.getName(),
                                request.getType(),
                                request.getCapacity(),
                                request.getLayoutConfig());

                return ResponseEntity.status(HttpStatus.CREATED)
                                .body(ApiResponse.success(toSectionResponse(section)));
        }

        @GetMapping("/venues/{venueId}/sections")
        @Operation(summary = "Secciones del venue", description = "Lista las secciones de un venue")
        public ResponseEntity<ApiResponse<List<SectionResponse>>> getSectionsByVenue(
                        @PathVariable UUID venueId) {

                List<SectionResponse> sections = seatingMapService.getSectionsByVenue(venueId).stream()
                                .map(this::toSectionResponse)
                                .collect(Collectors.toList());

                return ResponseEntity.ok(ApiResponse.success(sections));
        }

        @PutMapping("/sections/{sectionId}")
        @Operation(summary = "Actualizar sección", description = "Actualiza una sección existente")
        @SecurityRequirement(name = "bearerAuth")
        public ResponseEntity<ApiResponse<SectionResponse>> updateSection(
                        @PathVariable UUID sectionId,
                        @RequestBody SectionRequest request) {

                Section section = seatingMapService.updateSection(
                                sectionId,
                                request.getName(),
                                request.getType(),
                                request.getCapacity(),
                                request.getLayoutConfig());

                return ResponseEntity.ok(ApiResponse.success(toSectionResponse(section)));
        }

        @DeleteMapping("/sections/{sectionId}")
        @Operation(summary = "Eliminar sección", description = "Elimina una sección")
        @SecurityRequirement(name = "bearerAuth")
        public ResponseEntity<ApiResponse<Void>> deleteSection(@PathVariable UUID sectionId) {
                seatingMapService.deleteSection(sectionId);
                return ResponseEntity.ok(ApiResponse.success(null));
        }

        // ==========================================
        // SEATS
        // ==========================================

        @PostMapping("/sections/{sectionId}/seats")
        @Operation(summary = "Crear asientos", description = "Crea asientos en bulk para una sección")
        @SecurityRequirement(name = "bearerAuth")
        public ResponseEntity<ApiResponse<List<SeatResponse>>> createSeats(
                        @PathVariable UUID sectionId,
                        @Valid @RequestBody List<SeatRequest> requests) {

                List<Seat> seats = requests.stream()
                                .map(r -> Seat.builder()
                                                .rowLabel(r.getRowLabel())
                                                .numberLabel(r.getNumberLabel())
                                                .xPosition(r.getXPosition())
                                                .yPosition(r.getYPosition())
                                                .isAccessible(r.getIsAccessible() != null ? r.getIsAccessible() : false)
                                                .build())
                                .collect(Collectors.toList());

                List<SeatResponse> created = seatingMapService.createSeats(sectionId, seats).stream()
                                .map(this::toSeatResponse)
                                .collect(Collectors.toList());

                return ResponseEntity.status(HttpStatus.CREATED)
                                .body(ApiResponse.success(created));
        }

        @GetMapping("/sections/{sectionId}/seats")
        @Operation(summary = "Asientos de sección", description = "Lista los asientos de una sección")
        public ResponseEntity<ApiResponse<List<SeatResponse>>> getSeatsBySection(
                        @PathVariable UUID sectionId) {

                List<SeatResponse> seats = seatingMapService.getSeatsBySection(sectionId).stream()
                                .map(this::toSeatResponse)
                                .collect(Collectors.toList());

                return ResponseEntity.ok(ApiResponse.success(seats));
        }

        // ==========================================
        // HELPERS
        // ==========================================

        private SectionResponse toSectionResponse(Section section) {
                Map<String, Object> layoutConfig = null;
                if (section.getLayoutConfig() != null) {
                        try {
                                layoutConfig = objectMapper.readValue(section.getLayoutConfig(), new TypeReference<>() {
                                });
                        } catch (Exception e) {
                                log.warn("Error parsing section layoutConfig", e);
                        }
                }

                return SectionResponse.builder()
                                .id(section.getId())
                                .venueId(section.getVenueId())
                                .name(section.getName())
                                .type(section.getType())
                                .capacity(section.getCapacity())
                                .layoutConfig(layoutConfig)
                                .createdAt(section.getCreatedAt())
                                .build();
        }

        private SeatResponse toSeatResponse(Seat seat) {
                return SeatResponse.builder()
                                .id(seat.getId())
                                .sectionId(seat.getSectionId())
                                .rowLabel(seat.getRowLabel())
                                .numberLabel(seat.getNumberLabel())
                                .xPosition(seat.getXPosition())
                                .yPosition(seat.getYPosition())
                                .isAccessible(seat.getIsAccessible())
                                .status("AVAILABLE")
                                .build();
        }
}
