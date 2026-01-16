package com.neonpass.application.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.neonpass.domain.exception.EventNotFoundException;
import com.neonpass.domain.model.Event;
import com.neonpass.domain.model.Section;
import com.neonpass.domain.model.Seat;
import com.neonpass.domain.model.Venue;
import com.neonpass.domain.model.enums.SectionType;
import com.neonpass.domain.model.enums.TicketStatus;
import com.neonpass.domain.port.out.*;
import com.neonpass.infrastructure.adapter.in.web.dto.response.SeatResponse;
import com.neonpass.infrastructure.adapter.in.web.dto.response.SeatingMapResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Servicio para gestión de layouts y mapas de asientos.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SeatingMapService {

    private final VenueRepository venueRepository;
    private final SectionRepository sectionRepository;
    private final SeatRepository seatRepository;
    private final EventRepository eventRepository;
    private final TicketRepository ticketRepository;
    private final ObjectMapper objectMapper;

    /**
     * Guarda el layout del venue desde el editor visual.
     */
    @Transactional
    public void saveVenueLayout(UUID venueId, Map<String, Object> layout) {
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new RuntimeException("Venue not found: " + venueId));

        venue.setBaseLayoutJson(serializeToJson(layout));
        venueRepository.save(venue);
        log.info("Layout saved for venue {}", venueId);
    }

    /**
     * Obtiene el layout del venue para el editor.
     */
    public Map<String, Object> getVenueLayout(UUID venueId) {
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new RuntimeException("Venue not found: " + venueId));

        return parseFromJson(venue.getBaseLayoutJson());
    }

    /**
     * Obtiene el mapa de asientos para un evento con disponibilidad.
     */
    @Transactional(readOnly = true)
    public SeatingMapResponse getEventSeatingMap(UUID eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException(eventId));

        Venue venue = venueRepository.findById(event.getVenueId())
                .orElseThrow(() -> new RuntimeException("Venue not found"));

        List<Section> sections = sectionRepository.findByVenueId(venue.getId());

        // Obtener tickets vendidos/reservados para el evento
        Set<UUID> soldSeatIds = ticketRepository.findByEventId(eventId).stream()
                .filter(t -> t.getSeatId() != null)
                .filter(t -> TicketStatus.VALID.equals(t.getStatus()) ||
                        TicketStatus.USED.equals(t.getStatus()))
                .map(t -> t.getSeatId())
                .collect(Collectors.toSet());

        // Construir respuesta de secciones con asientos
        List<SeatingMapResponse.SectionWithSeatsResponse> sectionResponses = sections.stream()
                .map(section -> buildSectionWithSeats(section, soldSeatIds))
                .collect(Collectors.toList());

        // Calcular resumen
        int totalCapacity = sections.stream()
                .mapToInt(s -> s.getCapacity() != null ? s.getCapacity() : 0)
                .sum();
        int totalSold = soldSeatIds.size();

        return SeatingMapResponse.builder()
                .eventId(eventId)
                .venueId(venue.getId())
                .venueName(venue.getName())
                .venueLayout(parseFromJson(venue.getBaseLayoutJson()))
                .sections(sectionResponses)
                .summary(SeatingMapResponse.AvailabilitySummary.builder()
                        .totalCapacity(totalCapacity)
                        .totalAvailable(totalCapacity - totalSold)
                        .totalSold(totalSold)
                        .totalReserved(0)
                        .build())
                .build();
    }

    private SeatingMapResponse.SectionWithSeatsResponse buildSectionWithSeats(
            Section section, Set<UUID> soldSeatIds) {

        List<Seat> seats = seatRepository.findBySectionId(section.getId());

        List<SeatResponse> seatResponses = seats.stream()
                .map(seat -> SeatResponse.builder()
                        .id(seat.getId())
                        .sectionId(seat.getSectionId())
                        .rowLabel(seat.getRowLabel())
                        .numberLabel(seat.getNumberLabel())
                        .xPosition(seat.getXPosition())
                        .yPosition(seat.getYPosition())
                        .isAccessible(seat.getIsAccessible())
                        .status(soldSeatIds.contains(seat.getId()) ? "SOLD" : "AVAILABLE")
                        .build())
                .collect(Collectors.toList());

        int soldCount = (int) seatResponses.stream()
                .filter(s -> "SOLD".equals(s.getStatus()))
                .count();

        return SeatingMapResponse.SectionWithSeatsResponse.builder()
                .id(section.getId())
                .name(section.getName())
                .type(section.getType().name())
                .capacity(section.getCapacity())
                .layoutConfig(parseFromJson(section.getLayoutConfig()))
                .availableCount(seats.size() - soldCount)
                .soldCount(soldCount)
                .seats(SectionType.SEATED.equals(section.getType()) ? seatResponses : null)
                .build();
    }

    /**
     * Crea una sección para un venue.
     */
    @Transactional
    public Section createSection(UUID venueId, String name, SectionType type,
            Integer capacity, Map<String, Object> layoutConfig) {
        venueRepository.findById(venueId)
                .orElseThrow(() -> new RuntimeException("Venue not found: " + venueId));

        Section section = Section.builder()
                .id(UUID.randomUUID())
                .venueId(venueId)
                .name(name)
                .type(type)
                .capacity(capacity)
                .layoutConfig(serializeToJson(layoutConfig))
                .deleted(false)
                .build();

        return sectionRepository.save(section);
    }

    /**
     * Actualiza una sección existente.
     */
    @Transactional
    public Section updateSection(UUID sectionId, String name, SectionType type,
            Integer capacity, Map<String, Object> layoutConfig) {
        Section section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new RuntimeException("Section not found: " + sectionId));

        if (name != null)
            section.setName(name);
        if (type != null)
            section.setType(type);
        if (capacity != null)
            section.setCapacity(capacity);
        if (layoutConfig != null)
            section.setLayoutConfig(serializeToJson(layoutConfig));

        log.info("Updated section {}", sectionId);
        return sectionRepository.save(section);
    }

    /**
     * Elimina una sección (soft delete).
     */
    @Transactional
    public void deleteSection(UUID sectionId) {
        Section section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new RuntimeException("Section not found: " + sectionId));

        section.setDeleted(true);
        sectionRepository.save(section);
        log.info("Deleted section {}", sectionId);
    }

    /**
     * Crea asientos en bulk para una sección.
     */
    @Transactional
    public List<Seat> createSeats(UUID sectionId, List<Seat> seats) {
        sectionRepository.findById(sectionId)
                .orElseThrow(() -> new RuntimeException("Section not found: " + sectionId));

        List<Seat> savedSeats = new ArrayList<>();
        for (Seat seat : seats) {
            seat.setId(UUID.randomUUID());
            seat.setSectionId(sectionId);
            seat.setDeleted(false);
            savedSeats.add(seatRepository.save(seat));
        }

        log.info("Created {} seats for section {}", savedSeats.size(), sectionId);
        return savedSeats;
    }

    public List<Section> getSectionsByVenue(UUID venueId) {
        return sectionRepository.findByVenueId(venueId);
    }

    public List<Seat> getSeatsBySection(UUID sectionId) {
        return seatRepository.findBySectionId(sectionId);
    }

    private String serializeToJson(Map<String, Object> data) {
        if (data == null)
            return null;
        try {
            return objectMapper.writeValueAsString(data);
        } catch (JsonProcessingException e) {
            log.error("Error serializing to JSON", e);
            return "{}";
        }
    }

    private Map<String, Object> parseFromJson(String json) {
        if (json == null || json.isBlank())
            return new HashMap<>();
        try {
            return objectMapper.readValue(json, new TypeReference<>() {
            });
        } catch (JsonProcessingException e) {
            log.warn("Error parsing JSON", e);
            return new HashMap<>();
        }
    }
}
