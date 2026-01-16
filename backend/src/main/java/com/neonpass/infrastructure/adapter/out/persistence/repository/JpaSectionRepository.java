package com.neonpass.infrastructure.adapter.out.persistence.repository;

import com.neonpass.infrastructure.adapter.out.persistence.entity.SectionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repositorio Spring Data JPA para secciones.
 */
@Repository
public interface JpaSectionRepository extends JpaRepository<SectionEntity, UUID> {

    List<SectionEntity> findByVenueId(UUID venueId);
}
