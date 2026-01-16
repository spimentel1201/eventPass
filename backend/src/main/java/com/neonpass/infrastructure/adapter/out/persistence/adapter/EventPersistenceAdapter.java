package com.neonpass.infrastructure.adapter.out.persistence.adapter;

import com.neonpass.domain.model.Event;
import com.neonpass.domain.model.enums.EventStatus;
import com.neonpass.domain.port.out.EventRepository;
import com.neonpass.infrastructure.adapter.out.persistence.mapper.EventMapper;
import com.neonpass.infrastructure.adapter.out.persistence.repository.JpaEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Adapter que implementa el puerto de salida EventRepository.
 */
@Component
@RequiredArgsConstructor
public class EventPersistenceAdapter implements EventRepository {

    private final JpaEventRepository jpaEventRepository;
    private final EventMapper eventMapper;

    @Override
    public Optional<Event> findById(UUID id) {
        return jpaEventRepository.findById(id)
                .map(eventMapper::toDomain);
    }

    @Override
    public List<Event> findByOrganizationId(UUID organizationId) {
        return jpaEventRepository.findByOrganizationId(organizationId).stream()
                .map(eventMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Event> findByVenueId(UUID venueId) {
        return jpaEventRepository.findByVenueId(venueId).stream()
                .map(eventMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Event> findByStatus(EventStatus status) {
        return jpaEventRepository.findByStatus(status).stream()
                .map(eventMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Event> findPublished() {
        return jpaEventRepository.findByStatusOrderByStartTimeAsc(EventStatus.PUBLISHED).stream()
                .map(eventMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Event> findAll() {
        return jpaEventRepository.findAll().stream()
                .map(eventMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Event save(Event event) {
        var entity = eventMapper.toEntity(event);
        var saved = jpaEventRepository.save(entity);
        return eventMapper.toDomain(saved);
    }
}
