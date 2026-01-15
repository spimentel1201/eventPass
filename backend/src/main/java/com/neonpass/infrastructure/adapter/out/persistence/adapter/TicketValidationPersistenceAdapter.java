package com.neonpass.infrastructure.adapter.out.persistence.adapter;

import com.neonpass.domain.model.TicketValidation;
import com.neonpass.domain.port.out.TicketValidationRepository;
import com.neonpass.infrastructure.adapter.out.persistence.mapper.TicketValidationMapper;
import com.neonpass.infrastructure.adapter.out.persistence.repository.JpaTicketValidationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Adapter que implementa el puerto de salida TicketValidationRepository.
 */
@Component
@RequiredArgsConstructor
public class TicketValidationPersistenceAdapter implements TicketValidationRepository {

    private final JpaTicketValidationRepository jpaTicketValidationRepository;
    private final TicketValidationMapper ticketValidationMapper;

    @Override
    public Optional<TicketValidation> findById(UUID id) {
        return jpaTicketValidationRepository.findById(id)
                .map(ticketValidationMapper::toDomain);
    }

    @Override
    public List<TicketValidation> findByTicketId(UUID ticketId) {
        return jpaTicketValidationRepository.findByTicketIdOrderByValidatedAtDesc(ticketId).stream()
                .map(ticketValidationMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public TicketValidation save(TicketValidation validation) {
        var entity = ticketValidationMapper.toEntity(validation);
        var saved = jpaTicketValidationRepository.save(entity);
        return ticketValidationMapper.toDomain(saved);
    }
}
