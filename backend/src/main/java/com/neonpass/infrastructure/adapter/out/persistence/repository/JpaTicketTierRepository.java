package com.neonpass.infrastructure.adapter.out.persistence.repository;

import com.neonpass.infrastructure.adapter.out.persistence.entity.TicketTierEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repositorio Spring Data JPA para niveles de precio.
 */
@Repository
public interface JpaTicketTierRepository extends JpaRepository<TicketTierEntity, UUID> {

    List<TicketTierEntity> findByEventId(UUID eventId);

    List<TicketTierEntity> findBySectionId(UUID sectionId);

    List<TicketTierEntity> findByEventIdAndSectionId(UUID eventId, UUID sectionId);
}
