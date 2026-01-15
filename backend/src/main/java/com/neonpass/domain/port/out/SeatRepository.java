package com.neonpass.domain.port.out;

import com.neonpass.domain.model.Seat;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Puerto de salida para operaciones de persistencia de asientos.
 */
public interface SeatRepository {

    Optional<Seat> findById(UUID id);

    List<Seat> findBySectionId(UUID sectionId);

    /**
     * Busca asientos disponibles para un evento específico.
     * 
     * @param sectionId ID de la sección
     * @param eventId   ID del evento
     * @return Lista de asientos no vendidos
     */
    List<Seat> findAvailableSeats(UUID sectionId, UUID eventId);

    Seat save(Seat seat);
}
