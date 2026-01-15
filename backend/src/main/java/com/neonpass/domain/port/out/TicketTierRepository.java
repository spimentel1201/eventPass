package com.neonpass.domain.port.out;

import com.neonpass.domain.model.TicketTier;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Puerto de salida para operaciones de persistencia de niveles de precio.
 */
public interface TicketTierRepository {

    Optional<TicketTier> findById(UUID id);

    List<TicketTier> findByEventId(UUID eventId);

    List<TicketTier> findBySectionId(UUID sectionId);

    List<TicketTier> findByEventIdAndSectionId(UUID eventId, UUID sectionId);

    TicketTier save(TicketTier ticketTier);
}
