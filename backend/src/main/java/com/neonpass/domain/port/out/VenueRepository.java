package com.neonpass.domain.port.out;

import com.neonpass.domain.model.Venue;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Puerto de salida para operaciones de persistencia de recintos.
 */
public interface VenueRepository {

    Optional<Venue> findById(UUID id);

    List<Venue> findByOrganizationId(UUID organizationId);

    Venue save(Venue venue);

    List<Venue> findAll();
}
