package com.neonpass.infrastructure.adapter.out.persistence.repository;

import com.neonpass.infrastructure.adapter.out.persistence.entity.SeatEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repositorio Spring Data JPA para asientos.
 */
@Repository
public interface JpaSeatRepository extends JpaRepository<SeatEntity, UUID> {

    List<SeatEntity> findBySectionId(UUID sectionId);

    /**
     * Busca asientos disponibles para un evento.
     * Excluye asientos que ya tienen ticket vendido para ese evento.
     */
    @Query("""
            SELECT s FROM SeatEntity s
            WHERE s.sectionId = :sectionId
            AND s.deleted = false
            AND s.id NOT IN (
                SELECT t.seatId FROM TicketEntity t
                WHERE t.eventId = :eventId
                AND t.seatId IS NOT NULL
                AND t.status IN ('VALID', 'USED')
            )
            """)
    List<SeatEntity> findAvailableSeats(
            @Param("sectionId") UUID sectionId,
            @Param("eventId") UUID eventId);
}
