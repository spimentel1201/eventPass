package com.neonpass.application.service;

import com.neonpass.domain.exception.EventNotFoundException;
import com.neonpass.domain.model.Event;
import com.neonpass.domain.model.enums.EventStatus;
import com.neonpass.domain.port.in.CreateEventUseCase;
import com.neonpass.domain.port.in.GetEventUseCase;
import com.neonpass.domain.port.in.ListEventsUseCase;
import com.neonpass.domain.port.out.EventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Servicio de aplicación para gestión de eventos.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class EventService implements CreateEventUseCase, GetEventUseCase, ListEventsUseCase {

    private final EventRepository eventRepository;

    @Override
    public Event execute(CreateEventCommand command) {
        log.info("Creando nuevo evento: {}", command.title());

        Event event = Event.builder()
                .id(UUID.randomUUID())
                .organizationId(command.organizationId())
                .venueId(command.venueId())
                .title(command.title())
                .description(command.description())
                .startTime(command.startTime())
                .endTime(command.endTime())
                .status(command.status() != null ? command.status() : EventStatus.DRAFT)
                .createdAt(LocalDateTime.now())
                .deleted(false)
                .build();

        Event savedEvent = eventRepository.save(event);
        log.info("Evento creado exitosamente: {}", savedEvent.getId());

        return savedEvent;
    }

    @Override
    @Transactional(readOnly = true)
    public Event execute(UUID eventId) {
        log.info("Buscando evento: {}", eventId);

        return eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException(eventId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Event> execute() {
        log.info("Listando eventos publicados");
        return eventRepository.findPublished();
    }
}
