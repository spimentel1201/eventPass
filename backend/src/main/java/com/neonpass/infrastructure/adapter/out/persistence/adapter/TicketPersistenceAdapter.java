package com.neonpass.infrastructure.adapter.out.persistence.adapter;

import com.neonpass.domain.model.Ticket;
import com.neonpass.domain.model.enums.TicketStatus;
import com.neonpass.domain.port.out.TicketRepository;
import com.neonpass.infrastructure.adapter.out.persistence.mapper.TicketMapper;
import com.neonpass.infrastructure.adapter.out.persistence.repository.JpaTicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Adapter que implementa el puerto de salida TicketRepository.
 */
@Component
@RequiredArgsConstructor
public class TicketPersistenceAdapter implements TicketRepository {

    private final JpaTicketRepository jpaTicketRepository;
    private final TicketMapper ticketMapper;

    @Override
    public Optional<Ticket> findById(UUID id) {
        return jpaTicketRepository.findById(id)
                .map(ticketMapper::toDomain);
    }

    @Override
    public List<Ticket> findByOrderId(UUID orderId) {
        return jpaTicketRepository.findByOrderId(orderId).stream()
                .map(ticketMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Ticket> findByEventId(UUID eventId) {
        return jpaTicketRepository.findByEventId(eventId).stream()
                .map(ticketMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<Ticket> findByQrCodeHash(String qrCodeHash) {
        return jpaTicketRepository.findByQrCodeHash(qrCodeHash)
                .map(ticketMapper::toDomain);
    }

    @Override
    public boolean existsByEventIdAndSeatId(UUID eventId, UUID seatId) {
        return jpaTicketRepository.existsByEventIdAndSeatId(eventId, seatId);
    }

    @Override
    public boolean existsByEventIdAndSeatIdAndStatusIn(UUID eventId, UUID seatId, List<TicketStatus> statuses) {
        return jpaTicketRepository.existsByEventIdAndSeatIdAndStatusIn(eventId, seatId, statuses);
    }

    @Override
    public Ticket save(Ticket ticket) {
        var entity = ticketMapper.toEntity(ticket);
        var saved = jpaTicketRepository.save(entity);
        return ticketMapper.toDomain(saved);
    }
}
