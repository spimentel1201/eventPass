package com.neonpass.infrastructure.adapter.out.persistence.adapter;

import com.neonpass.domain.model.CommissionConfig;
import com.neonpass.domain.port.out.CommissionConfigRepository;
import com.neonpass.infrastructure.adapter.out.persistence.mapper.CommissionConfigMapper;
import com.neonpass.infrastructure.adapter.out.persistence.repository.JpaCommissionConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

/**
 * Adapter que implementa el puerto de salida CommissionConfigRepository.
 */
@Component
@RequiredArgsConstructor
public class CommissionConfigPersistenceAdapter implements CommissionConfigRepository {

    private final JpaCommissionConfigRepository jpaCommissionConfigRepository;
    private final CommissionConfigMapper commissionConfigMapper;

    @Override
    public Optional<CommissionConfig> findById(UUID id) {
        return jpaCommissionConfigRepository.findById(id)
                .map(commissionConfigMapper::toDomain);
    }

    @Override
    public Optional<CommissionConfig> findByOrganizationId(UUID organizationId) {
        return jpaCommissionConfigRepository.findByOrganizationId(organizationId)
                .map(commissionConfigMapper::toDomain);
    }

    @Override
    public CommissionConfig save(CommissionConfig config) {
        var entity = commissionConfigMapper.toEntity(config);
        var saved = jpaCommissionConfigRepository.save(entity);
        return commissionConfigMapper.toDomain(saved);
    }
}
