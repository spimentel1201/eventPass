package com.neonpass.infrastructure.adapter.out.persistence.mapper;

import com.neonpass.domain.model.CommissionConfig;
import com.neonpass.infrastructure.adapter.out.persistence.entity.CommissionConfigEntity;
import org.mapstruct.Mapper;

/**
 * Mapper para conversión entre CommissionConfig (domain) y
 * CommissionConfigEntity (JPA).
 */
@Mapper(componentModel = "spring")
public interface CommissionConfigMapper {

    CommissionConfig toDomain(CommissionConfigEntity entity);

    CommissionConfigEntity toEntity(CommissionConfig domain);
}
