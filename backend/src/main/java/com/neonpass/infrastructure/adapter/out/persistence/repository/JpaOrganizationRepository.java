package com.neonpass.infrastructure.adapter.out.persistence.repository;

import com.neonpass.infrastructure.adapter.out.persistence.entity.OrganizationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repositorio Spring Data JPA para organizaciones.
 */
@Repository
public interface JpaOrganizationRepository extends JpaRepository<OrganizationEntity, UUID> {

    Optional<OrganizationEntity> findBySlug(String slug);

    List<OrganizationEntity> findByOwnerId(UUID ownerId);

    boolean existsBySlug(String slug);
}
