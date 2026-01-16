package com.neonpass.infrastructure.adapter.out.persistence.adapter;

import com.neonpass.domain.model.TicketTier;
import com.neonpass.domain.port.out.TicketTierRepository;
import com.neonpass.infrastructure.adapter.out.persistence.mapper.TicketTierMapper;
import com.neonpass.infrastructure.adapter.out.persistence.repository.JpaTicketTierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Adapter que implementa el puerto de salida TicketTierRepository.
 */
@Component
@RequiredArgsConstructor
public class TicketTierPersistenceAdapter implements TicketTierRepository {

    private final JpaTicketTierRepository jpaTicketTierRepository;
    private final TicketTierMapper ticketTierMapper;

    @Override
    public Optional<TicketTier> findById(UUID id) {
        return jpaTicketTierRepository.findById(id)
                .map(ticketTierMapper::toDomain);
    }

    @Override
    public List<TicketTier> findByEventId(UUID eventId) {
        return jpaTicketTierRepository.findByEventId(eventId).stream()
                .map(ticketTierMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<TicketTier> findBySectionId(UUID sectionId) {
        return jpaTicketTierRepository.findBySectionId(sectionId).stream()
                .map(ticketTierMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<TicketTier> findByEventIdAndSectionId(UUID eventId, UUID sectionId) {
        return jpaTicketTierRepository.findByEventIdAndSectionId(eventId, sectionId).stream()
                .map(ticketTierMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public TicketTier save(TicketTier ticketTier) {
        var entity = ticketTierMapper.toEntity(ticketTier);
        var saved = jpaTicketTierRepository.save(entity);
        return ticketTierMapper.toDomain(saved);
    }
}
