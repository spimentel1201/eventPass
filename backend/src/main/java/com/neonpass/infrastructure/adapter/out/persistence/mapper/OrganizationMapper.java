package com.neonpass.infrastructure.adapter.out.persistence.mapper;

import com.neonpass.domain.model.Organization;
import com.neonpass.infrastructure.adapter.out.persistence.entity.OrganizationEntity;
import org.mapstruct.Mapper;

/**
 * Mapper para conversión entre Organization (domain) y OrganizationEntity
 * (JPA).
 */
@Mapper(componentModel = "spring")
public interface OrganizationMapper {

    Organization toDomain(OrganizationEntity entity);

    OrganizationEntity toEntity(Organization domain);
}
