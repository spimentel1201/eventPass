package com.neonpass.domain.port.out;

import com.neonpass.domain.model.Event;
import com.neonpass.domain.model.enums.EventStatus;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Puerto de salida para operaciones de persistencia de eventos.
 */
public interface EventRepository {

    Optional<Event> findById(UUID id);

    List<Event> findByOrganizationId(UUID organizationId);

    List<Event> findByVenueId(UUID venueId);

    List<Event> findByStatus(EventStatus status);

    /**
     * Busca eventos publicados y disponibles para compra.
     */
    List<Event> findPublished();

    Event save(Event event);
}
