package com.neonpass.domain.port.out;

import com.neonpass.domain.model.Ticket;
import com.neonpass.domain.model.enums.TicketStatus;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Puerto de salida para operaciones de persistencia de tickets.
 */
public interface TicketRepository {

    Optional<Ticket> findById(UUID id);

    List<Ticket> findByOrderId(UUID orderId);

    List<Ticket> findByEventId(UUID eventId);

    /**
     * Busca un ticket por su hash de código QR.
     * Usado en la validación en puerta.
     */
    Optional<Ticket> findByQrCodeHash(String qrCodeHash);

    /**
     * Verifica si existe un ticket para un asiento específico en un evento.
     * Usado para prevenir doble venta (constraint de base de datos).
     */
    boolean existsByEventIdAndSeatId(UUID eventId, UUID seatId);

    /**
     * Verifica si existe un ticket vendido para un asiento.
     */
    boolean existsByEventIdAndSeatIdAndStatusIn(UUID eventId, UUID seatId, List<TicketStatus> statuses);

    Ticket save(Ticket ticket);
}
