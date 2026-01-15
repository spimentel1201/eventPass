package com.neonpass.infrastructure.adapter.out.persistence.repository;

import com.neonpass.infrastructure.adapter.out.persistence.entity.EventSectionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repositorio Spring Data JPA para mapeo evento-sección.
 */
@Repository
public interface JpaEventSectionRepository extends JpaRepository<EventSectionEntity, UUID> {

    List<EventSectionEntity> findByEventId(UUID eventId);

    List<EventSectionEntity> findByEventIdAndIsActiveTrue(UUID eventId);

    Optional<EventSectionEntity> findByEventIdAndSectionId(UUID eventId, UUID sectionId);
}
