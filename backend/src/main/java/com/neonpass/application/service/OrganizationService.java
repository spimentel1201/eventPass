package com.neonpass.application.service;

import com.neonpass.domain.model.Organization;
import com.neonpass.domain.port.in.CreateOrganizationUseCase;
import com.neonpass.domain.port.out.OrganizationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Servicio de gestión de organizaciones.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class OrganizationService implements CreateOrganizationUseCase {

    private final OrganizationRepository organizationRepository;

    @Override
    public Organization execute(CreateOrganizationCommand command) {
        log.info("Creando organización: {}", command.name());

        Organization org = Organization.builder()
                .id(UUID.randomUUID())
                .ownerId(command.ownerId())
                .name(command.name())
                .slug(command.slug())
                .createdAt(LocalDateTime.now())
                .deleted(false)
                .build();

        Organization saved = organizationRepository.save(org);
        log.info("Organización creada: {}", saved.getId());

        return saved;
    }

    @Transactional(readOnly = true)
    public Optional<Organization> findById(UUID id) {
        return organizationRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public List<Organization> findAll() {
        return organizationRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Organization> findByOwner(UUID ownerId) {
        return organizationRepository.findByOwnerId(ownerId);
    }
}
