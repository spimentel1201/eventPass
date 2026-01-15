package com.neonpass.infrastructure.adapter.out.persistence.adapter;

import com.neonpass.domain.model.Venue;
import com.neonpass.domain.port.out.VenueRepository;
import com.neonpass.infrastructure.adapter.out.persistence.mapper.VenueMapper;
import com.neonpass.infrastructure.adapter.out.persistence.repository.JpaVenueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Adapter que implementa el puerto de salida VenueRepository.
 */
@Component
@RequiredArgsConstructor
public class VenuePersistenceAdapter implements VenueRepository {

    private final JpaVenueRepository jpaVenueRepository;
    private final VenueMapper venueMapper;

    @Override
    public Optional<Venue> findById(UUID id) {
        return jpaVenueRepository.findById(id)
                .map(venueMapper::toDomain);
    }

    @Override
    public List<Venue> findByOrganizationId(UUID organizationId) {
        return jpaVenueRepository.findByOrganizationId(organizationId).stream()
                .map(venueMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Venue save(Venue venue) {
        var entity = venueMapper.toEntity(venue);
        var saved = jpaVenueRepository.save(entity);
        return venueMapper.toDomain(saved);
    }

    @Override
    public List<Venue> findAll() {
        return jpaVenueRepository.findAll().stream()
                .map(venueMapper::toDomain)
                .collect(Collectors.toList());
    }
}
