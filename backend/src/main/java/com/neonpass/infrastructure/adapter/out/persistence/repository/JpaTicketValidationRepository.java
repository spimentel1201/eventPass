package com.neonpass.infrastructure.adapter.out.persistence.repository;

import com.neonpass.infrastructure.adapter.out.persistence.entity.TicketValidationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repositorio Spring Data JPA para validaciones de ticket.
 */
@Repository
public interface JpaTicketValidationRepository extends JpaRepository<TicketValidationEntity, UUID> {

    List<TicketValidationEntity> findByTicketId(UUID ticketId);

    List<TicketValidationEntity> findByTicketIdOrderByValidatedAtDesc(UUID ticketId);
}
