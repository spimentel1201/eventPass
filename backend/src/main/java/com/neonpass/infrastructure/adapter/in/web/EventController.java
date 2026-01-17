package com.neonpass.infrastructure.adapter.in.web;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.neonpass.domain.model.Event;
import com.neonpass.domain.model.Venue;
import com.neonpass.domain.port.in.CreateEventUseCase;
import com.neonpass.domain.port.in.GetEventUseCase;
import com.neonpass.domain.port.in.ListEventsUseCase;
import com.neonpass.domain.port.out.EventRepository;
import com.neonpass.domain.port.out.VenueRepository;
import com.neonpass.infrastructure.adapter.in.web.dto.request.EventRequest;
import com.neonpass.infrastructure.adapter.in.web.dto.response.EventResponse;
import com.neonpass.infrastructure.adapter.in.web.dto.response.EventSummaryResponse;
import com.neonpass.infrastructure.adapter.in.web.dto.response.PageResponse;
import com.neonpass.infrastructure.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
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
 * Controlador REST para gestión de eventos.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/events")
@RequiredArgsConstructor
@Tag(name = "Eventos", description = "Gestión de eventos")
public class EventController {

    private final CreateEventUseCase createEventUseCase;
    private final GetEventUseCase getEventUseCase;
    private final ListEventsUseCase listEventsUseCase;
    private final EventRepository eventRepository;
    private final VenueRepository venueRepository;
    private final ObjectMapper objectMapper;

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
                .body(ApiResponse.success(toFullResponse(event)));
    }

    @GetMapping("/{eventId}")
    @Operation(summary = "Obtener evento", description = "Obtiene un evento completo por su ID con imágenes")
    public ResponseEntity<ApiResponse<EventResponse>> getEvent(
            @PathVariable UUID eventId) {

        Event event = getEventUseCase.execute(eventId);

        return ResponseEntity.ok(ApiResponse.success(toFullResponse(event)));
    }

    @GetMapping
    @Operation(summary = "Listar eventos", description = "Lista eventos publicados con paginación")
    public ResponseEntity<ApiResponse<PageResponse<EventSummaryResponse>>> listEvents(
            @Parameter(description = "Número de página (0-indexed)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Tamaño de página") @RequestParam(defaultValue = "10") int size) {

        List<Event> allEvents = listEventsUseCase.execute();

        // Paginación manual (en producción usarías Pageable)
        int start = page * size;
        int end = Math.min(start + size, allEvents.size());

        List<EventSummaryResponse> pagedEvents = allEvents.stream()
                .skip(start)
                .limit(size)
                .map(this::toSummaryResponse)
                .collect(Collectors.toList());

        PageResponse<EventSummaryResponse> pageResponse = PageResponse.of(
                pagedEvents, page, size, allEvents.size());

        return ResponseEntity.ok(ApiResponse.success(pageResponse));
    }

    @PutMapping("/{eventId}")
    @Operation(summary = "Actualizar evento", description = "Actualiza un evento existente")
    public ResponseEntity<ApiResponse<EventResponse>> updateEvent(
            @PathVariable UUID eventId,
            @RequestBody EventRequest request) {

        // Get existing event
        Event existingEvent = getEventUseCase.execute(eventId);

        // Update fields
        Event updatedEvent = Event.builder()
                .id(existingEvent.getId())
                .organizationId(request.getOrganizationId() != null ? request.getOrganizationId()
                        : existingEvent.getOrganizationId())
                .venueId(request.getVenueId() != null ? request.getVenueId() : existingEvent.getVenueId())
                .title(request.getTitle() != null ? request.getTitle() : existingEvent.getTitle())
                .description(
                        request.getDescription() != null ? request.getDescription() : existingEvent.getDescription())
                .startTime(request.getStartTime() != null ? request.getStartTime() : existingEvent.getStartTime())
                .endTime(request.getEndTime() != null ? request.getEndTime() : existingEvent.getEndTime())
                .status(request.getStatus() != null ? request.getStatus() : existingEvent.getStatus())
                .metadata(request.getMetadata() != null ? request.getMetadata() : existingEvent.getMetadata())
                .createdAt(existingEvent.getCreatedAt())
                .updatedAt(java.time.LocalDateTime.now())
                .deleted(existingEvent.getDeleted())
                .build();

        // Save using repository (inject it)
        Event savedEvent = eventRepository.save(updatedEvent);

        return ResponseEntity.ok(ApiResponse.success(toFullResponse(savedEvent)));
    }

    /**
     * Convierte Event a respuesta completa con imágenes.
     */
    private EventResponse toFullResponse(Event event) {
        EventResponse.EventImagesResponse images = extractImages(event.getMetadata());
        Map<String, Object> metadata = parseMetadata(event.getMetadata());

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
                .images(images)
                .metadata(metadata)
                .build();
    }

    /**
     * Convierte Event a respuesta resumida para cards.
     */
    private EventSummaryResponse toSummaryResponse(Event event) {
        String thumbnailUrl = extractThumbnailUrl(event.getMetadata());
        String venueName = getVenueName(event.getVenueId());

        return EventSummaryResponse.builder()
                .id(event.getId())
                .title(event.getTitle())
                .description(truncateDescription(event.getDescription(), 150))
                .startTime(event.getStartTime())
                .endTime(event.getEndTime())
                .status(event.getStatus())
                .thumbnailUrl(thumbnailUrl)
                .venueName(venueName)
                .build();
    }

    private String truncateDescription(String description, int maxLength) {
        if (description == null)
            return null;
        if (description.length() <= maxLength)
            return description;
        return description.substring(0, maxLength) + "...";
    }

    private String getVenueName(UUID venueId) {
        if (venueId == null)
            return null;
        return venueRepository.findById(venueId)
                .map(Venue::getName)
                .orElse(null);
    }

    @SuppressWarnings("unchecked")
    private EventResponse.EventImagesResponse extractImages(String metadataJson) {
        if (metadataJson == null || metadataJson.isBlank()) {
            return null;
        }

        try {
            Map<String, Object> metadata = objectMapper.readValue(metadataJson, new TypeReference<>() {
            });
            Map<String, Object> media = (Map<String, Object>) metadata.get("media");
            if (media == null)
                return null;

            Map<String, Object> images = (Map<String, Object>) media.get("images");
            if (images == null)
                return null;

            EventResponse.ImageInfo banner = extractImageInfo((Map<String, Object>) images.get("banner"));
            EventResponse.ImageInfo thumbnail = extractImageInfo((Map<String, Object>) images.get("thumbnail"));

            if (banner == null && thumbnail == null)
                return null;

            return EventResponse.EventImagesResponse.builder()
                    .banner(banner)
                    .thumbnail(thumbnail)
                    .build();

        } catch (Exception e) {
            log.warn("Error parsing event images from metadata", e);
            return null;
        }
    }

    @SuppressWarnings("unchecked")
    private EventResponse.ImageInfo extractImageInfo(Map<String, Object> imageData) {
        if (imageData == null)
            return null;

        return EventResponse.ImageInfo.builder()
                .url((String) imageData.get("url"))
                .width(imageData.get("width") != null ? ((Number) imageData.get("width")).intValue() : null)
                .height(imageData.get("height") != null ? ((Number) imageData.get("height")).intValue() : null)
                .transformations((Map<String, String>) imageData.get("transformations"))
                .build();
    }

    @SuppressWarnings("unchecked")
    private String extractThumbnailUrl(String metadataJson) {
        if (metadataJson == null || metadataJson.isBlank()) {
            return null;
        }

        try {
            Map<String, Object> metadata = objectMapper.readValue(metadataJson, new TypeReference<>() {
            });
            Map<String, Object> media = (Map<String, Object>) metadata.get("media");
            if (media == null)
                return null;

            Map<String, Object> images = (Map<String, Object>) media.get("images");
            if (images == null)
                return null;

            // Intentar thumbnail primero, luego banner
            Map<String, Object> thumbnail = (Map<String, Object>) images.get("thumbnail");
            if (thumbnail != null && thumbnail.get("url") != null) {
                return (String) thumbnail.get("url");
            }

            Map<String, Object> banner = (Map<String, Object>) images.get("banner");
            if (banner != null && banner.get("url") != null) {
                return (String) banner.get("url");
            }

            return null;
        } catch (Exception e) {
            return null;
        }
    }

    private Map<String, Object> parseMetadata(String metadataJson) {
        if (metadataJson == null || metadataJson.isBlank()) {
            return null;
        }
        try {
            return objectMapper.readValue(metadataJson, new TypeReference<>() {
            });
        } catch (Exception e) {
            return null;
        }
    }
}
