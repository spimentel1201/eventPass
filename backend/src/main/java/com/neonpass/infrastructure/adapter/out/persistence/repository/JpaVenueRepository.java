package com.neonpass.infrastructure.adapter.out.persistence.repository;

import com.neonpass.infrastructure.adapter.out.persistence.entity.VenueEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repositorio Spring Data JPA para recintos.
 */
@Repository
public interface JpaVenueRepository extends JpaRepository<VenueEntity, UUID> {

    List<VenueEntity> findByOrganizationId(UUID organizationId);
}
