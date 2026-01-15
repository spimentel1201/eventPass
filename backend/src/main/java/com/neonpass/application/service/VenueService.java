package com.neonpass.application.service;

import com.neonpass.domain.model.Venue;
import com.neonpass.domain.port.in.CreateVenueUseCase;
import com.neonpass.domain.port.out.VenueRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Servicio de gestión de venues (recintos).
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class VenueService implements CreateVenueUseCase {

    private final VenueRepository venueRepository;

    @Override
    public Venue execute(CreateVenueCommand command) {
        log.info("Creando venue: {}", command.name());

        Venue venue = Venue.builder()
                .id(UUID.randomUUID())
                .organizationId(command.organizationId())
                .name(command.name())
                .address(command.address())
                .timezone(command.timezone())
                .createdAt(LocalDateTime.now())
                .deleted(false)
                .build();

        Venue saved = venueRepository.save(venue);
        log.info("Venue creado: {}", saved.getId());

        return saved;
    }

    @Transactional(readOnly = true)
    public Optional<Venue> findById(UUID id) {
        return venueRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public List<Venue> findAll() {
        return venueRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Venue> findByOrganization(UUID organizationId) {
        return venueRepository.findByOrganizationId(organizationId);
    }
}
