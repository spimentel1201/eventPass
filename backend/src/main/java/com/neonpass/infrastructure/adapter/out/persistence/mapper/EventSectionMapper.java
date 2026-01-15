package com.neonpass.infrastructure.adapter.out.persistence.mapper;

import com.neonpass.domain.model.EventSection;
import com.neonpass.infrastructure.adapter.out.persistence.entity.EventSectionEntity;
import org.mapstruct.Mapper;

/**
 * Mapper para conversión entre EventSection (domain) y EventSectionEntity
 * (JPA).
 */
@Mapper(componentModel = "spring")
public interface EventSectionMapper {

    EventSection toDomain(EventSectionEntity entity);

    EventSectionEntity toEntity(EventSection domain);
}
