package com.neonpass.infrastructure.adapter.out.persistence.adapter;

import com.neonpass.domain.model.Section;
import com.neonpass.domain.port.out.SectionRepository;
import com.neonpass.infrastructure.adapter.out.persistence.mapper.SectionMapper;
import com.neonpass.infrastructure.adapter.out.persistence.repository.JpaSectionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Adapter que implementa el puerto de salida SectionRepository.
 */
@Component
@RequiredArgsConstructor
public class SectionPersistenceAdapter implements SectionRepository {

    private final JpaSectionRepository jpaSectionRepository;
    private final SectionMapper sectionMapper;

    @Override
    public Optional<Section> findById(UUID id) {
        return jpaSectionRepository.findById(id)
                .map(sectionMapper::toDomain);
    }

    @Override
    public List<Section> findByVenueId(UUID venueId) {
        return jpaSectionRepository.findByVenueId(venueId).stream()
                .map(sectionMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Section save(Section section) {
        var entity = sectionMapper.toEntity(section);
        var saved = jpaSectionRepository.save(entity);
        return sectionMapper.toDomain(saved);
    }
}
