package com.neonpass.infrastructure.adapter.out.persistence.repository;

import com.neonpass.infrastructure.adapter.out.persistence.entity.CommissionConfigEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repositorio Spring Data JPA para configuración de comisiones.
 */
@Repository
public interface JpaCommissionConfigRepository extends JpaRepository<CommissionConfigEntity, UUID> {

    Optional<CommissionConfigEntity> findByOrganizationId(UUID organizationId);
}
