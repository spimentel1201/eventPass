package com.neonpass.infrastructure.adapter.out.persistence.adapter;

import com.neonpass.domain.model.Organization;
import com.neonpass.domain.port.out.OrganizationRepository;
import com.neonpass.infrastructure.adapter.out.persistence.mapper.OrganizationMapper;
import com.neonpass.infrastructure.adapter.out.persistence.repository.JpaOrganizationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Adapter que implementa el puerto de salida OrganizationRepository.
 */
@Component
@RequiredArgsConstructor
public class OrganizationPersistenceAdapter implements OrganizationRepository {

    private final JpaOrganizationRepository jpaOrganizationRepository;
    private final OrganizationMapper organizationMapper;

    @Override
    public Optional<Organization> findById(UUID id) {
        return jpaOrganizationRepository.findById(id)
                .map(organizationMapper::toDomain);
    }

    @Override
    public Optional<Organization> findBySlug(String slug) {
        return jpaOrganizationRepository.findBySlug(slug)
                .map(organizationMapper::toDomain);
    }

    @Override
    public List<Organization> findByOwnerId(UUID ownerId) {
        return jpaOrganizationRepository.findByOwnerId(ownerId).stream()
                .map(organizationMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Organization save(Organization organization) {
        var entity = organizationMapper.toEntity(organization);
        var saved = jpaOrganizationRepository.save(entity);
        return organizationMapper.toDomain(saved);
    }

    @Override
    public boolean existsBySlug(String slug) {
        return jpaOrganizationRepository.existsBySlug(slug);
    }

    @Override
    public List<Organization> findAll() {
        return jpaOrganizationRepository.findAll().stream()
                .map(organizationMapper::toDomain)
                .collect(Collectors.toList());
    }
}
