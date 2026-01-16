package com.neonpass.domain.port.out;

import com.neonpass.domain.model.EventSection;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Puerto de salida para operaciones de persistencia de mapeo evento-sección.
 */
public interface EventSectionRepository {

    Optional<EventSection> findById(UUID id);

    List<EventSection> findByEventId(UUID eventId);

    /**
     * Busca solo las secciones activas para un evento.
     */
    List<EventSection> findActiveByEventId(UUID eventId);

    Optional<EventSection> findByEventIdAndSectionId(UUID eventId, UUID sectionId);

    EventSection save(EventSection eventSection);
}
