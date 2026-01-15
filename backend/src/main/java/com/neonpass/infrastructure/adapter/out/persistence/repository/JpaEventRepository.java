package com.neonpass.infrastructure.adapter.out.persistence.repository;

import com.neonpass.domain.model.enums.EventStatus;
import com.neonpass.infrastructure.adapter.out.persistence.entity.EventEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repositorio Spring Data JPA para eventos.
 */
@Repository
public interface JpaEventRepository extends JpaRepository<EventEntity, UUID> {

    List<EventEntity> findByOrganizationId(UUID organizationId);

    List<EventEntity> findByVenueId(UUID venueId);

    List<EventEntity> findByStatus(EventStatus status);

    /**
     * Busca eventos publicados.
     */
    List<EventEntity> findByStatusOrderByStartTimeAsc(EventStatus status);
}
