package com.neonpass.domain.port.out;

import com.neonpass.domain.model.CommissionConfig;

import java.util.Optional;
import java.util.UUID;

/**
 * Puerto de salida para operaciones de persistencia de configuración de
 * comisiones.
 */
public interface CommissionConfigRepository {

    Optional<CommissionConfig> findById(UUID id);

    /**
     * Obtiene la configuración de comisiones de una organización.
     */
    Optional<CommissionConfig> findByOrganizationId(UUID organizationId);

    CommissionConfig save(CommissionConfig config);
}
