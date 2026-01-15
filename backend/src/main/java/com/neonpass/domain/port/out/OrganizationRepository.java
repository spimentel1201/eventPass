package com.neonpass.domain.port.out;

import com.neonpass.domain.model.Organization;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Puerto de salida para operaciones de persistencia de organizaciones.
 */
public interface OrganizationRepository {

    Optional<Organization> findById(UUID id);

    Optional<Organization> findBySlug(String slug);

    List<Organization> findByOwnerId(UUID ownerId);

    Organization save(Organization organization);

    boolean existsBySlug(String slug);
}
