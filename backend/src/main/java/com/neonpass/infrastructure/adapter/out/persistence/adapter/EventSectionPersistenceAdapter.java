package com.neonpass.infrastructure.adapter.out.persistence.adapter;

import com.neonpass.domain.model.EventSection;
import com.neonpass.domain.port.out.EventSectionRepository;
import com.neonpass.infrastructure.adapter.out.persistence.mapper.EventSectionMapper;
import com.neonpass.infrastructure.adapter.out.persistence.repository.JpaEventSectionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Adapter que implementa el puerto de salida EventSectionRepository.
 */
@Component
@RequiredArgsConstructor
public class EventSectionPersistenceAdapter implements EventSectionRepository {

    private final JpaEventSectionRepository jpaEventSectionRepository;
    private final EventSectionMapper eventSectionMapper;

    @Override
    public Optional<EventSection> findById(UUID id) {
        return jpaEventSectionRepository.findById(id)
                .map(eventSectionMapper::toDomain);
    }

    @Override
    public List<EventSection> findByEventId(UUID eventId) {
        return jpaEventSectionRepository.findByEventId(eventId).stream()
                .map(eventSectionMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<EventSection> findActiveByEventId(UUID eventId) {
        return jpaEventSectionRepository.findByEventIdAndIsActiveTrue(eventId).stream()
                .map(eventSectionMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<EventSection> findByEventIdAndSectionId(UUID eventId, UUID sectionId) {
        return jpaEventSectionRepository.findByEventIdAndSectionId(eventId, sectionId)
                .map(eventSectionMapper::toDomain);
    }

    @Override
    public EventSection save(EventSection eventSection) {
        var entity = eventSectionMapper.toEntity(eventSection);
        var saved = jpaEventSectionRepository.save(entity);
        return eventSectionMapper.toDomain(saved);
    }
}
