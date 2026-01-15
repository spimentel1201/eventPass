package com.neonpass.infrastructure.adapter.out.persistence.repository;

import com.neonpass.domain.model.enums.TicketStatus;
import com.neonpass.infrastructure.adapter.out.persistence.entity.TicketEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repositorio Spring Data JPA para tickets.
 */
@Repository
public interface JpaTicketRepository extends JpaRepository<TicketEntity, UUID> {

    List<TicketEntity> findByOrderId(UUID orderId);

    List<TicketEntity> findByEventId(UUID eventId);

    Optional<TicketEntity> findByQrCodeHash(String qrCodeHash);

    boolean existsByEventIdAndSeatId(UUID eventId, UUID seatId);

    boolean existsByEventIdAndSeatIdAndStatusIn(UUID eventId, UUID seatId, List<TicketStatus> statuses);
}
