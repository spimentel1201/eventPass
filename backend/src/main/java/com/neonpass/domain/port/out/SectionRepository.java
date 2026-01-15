package com.neonpass.domain.port.out;

import com.neonpass.domain.model.Section;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Puerto de salida para operaciones de persistencia de secciones.
 */
public interface SectionRepository {

    Optional<Section> findById(UUID id);

    List<Section> findByVenueId(UUID venueId);

    Section save(Section section);
}
