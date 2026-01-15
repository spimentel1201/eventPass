package com.neonpass.infrastructure.adapter.in.web;

import com.neonpass.domain.model.Event;
import com.neonpass.domain.port.in.CreateEventUseCase;
import com.neonpass.domain.port.in.GetEventUseCase;
import com.neonpass.domain.port.in.ListEventsUseCase;
import com.neonpass.infrastructure.adapter.in.web.dto.request.EventRequest;
import com.neonpass.infrastructure.adapter.in.web.dto.response.EventResponse;
import com.neonpass.infrastructure.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
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
 * Controlador REST para gestión de eventos.
 */
@RestController
@RequestMapping("/api/v1/events")
@RequiredArgsConstructor
@Tag(name = "Eventos", description = "Gestión de eventos")
public class EventController {

    private final CreateEventUseCase createEventUseCase;
    private final GetEventUseCase getEventUseCase;
    private final ListEventsUseCase listEventsUseCase;

    @PostMapping
    @Operation(summary = "Crear evento", description = "Crea un nuevo evento")
    public ResponseEntity<ApiResponse<EventResponse>> createEvent(
            @Valid @RequestBody EventRequest request) {

        var command = new CreateEventUseCase.CreateEventCommand(
                request.getOrganizationId(),
                request.getVenueId(),
                request.getTitle(),
                request.getDescription(),
                request.getStartTime(),
                request.getEndTime(),
                request.getStatus());

        Event event = createEventUseCase.execute(command);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(toResponse(event)));
    }

    @GetMapping("/{eventId}")
    @Operation(summary = "Obtener evento", description = "Obtiene un evento por su ID")
    public ResponseEntity<ApiResponse<EventResponse>> getEvent(
            @PathVariable UUID eventId) {

        Event event = getEventUseCase.execute(eventId);

        return ResponseEntity.ok(ApiResponse.success(toResponse(event)));
    }

    @GetMapping
    @Operation(summary = "Listar eventos", description = "Lista todos los eventos publicados")
    public ResponseEntity<ApiResponse<List<EventResponse>>> listEvents() {

        List<EventResponse> events = listEventsUseCase.execute().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(events));
    }

    private EventResponse toResponse(Event event) {
        return EventResponse.builder()
                .id(event.getId())
                .organizationId(event.getOrganizationId())
                .venueId(event.getVenueId())
                .title(event.getTitle())
                .description(event.getDescription())
                .startTime(event.getStartTime())
                .endTime(event.getEndTime())
                .status(event.getStatus())
                .createdAt(event.getCreatedAt())
                .build();
    }
}
