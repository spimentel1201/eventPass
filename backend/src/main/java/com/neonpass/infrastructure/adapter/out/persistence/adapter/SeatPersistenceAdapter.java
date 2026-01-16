package com.neonpass.infrastructure.adapter.out.persistence.adapter;

import com.neonpass.domain.model.Seat;
import com.neonpass.domain.port.out.SeatRepository;
import com.neonpass.infrastructure.adapter.out.persistence.mapper.SeatMapper;
import com.neonpass.infrastructure.adapter.out.persistence.repository.JpaSeatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Adapter que implementa el puerto de salida SeatRepository.
 */
@Component
@RequiredArgsConstructor
public class SeatPersistenceAdapter implements SeatRepository {

    private final JpaSeatRepository jpaSeatRepository;
    private final SeatMapper seatMapper;

    @Override
    public Optional<Seat> findById(UUID id) {
        return jpaSeatRepository.findById(id)
                .map(seatMapper::toDomain);
    }

    @Override
    public List<Seat> findBySectionId(UUID sectionId) {
        return jpaSeatRepository.findBySectionId(sectionId).stream()
                .map(seatMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Seat> findAvailableSeats(UUID sectionId, UUID eventId) {
        return jpaSeatRepository.findAvailableSeats(sectionId, eventId).stream()
                .map(seatMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Seat save(Seat seat) {
        var entity = seatMapper.toEntity(seat);
        var saved = jpaSeatRepository.save(entity);
        return seatMapper.toDomain(saved);
    }
}
