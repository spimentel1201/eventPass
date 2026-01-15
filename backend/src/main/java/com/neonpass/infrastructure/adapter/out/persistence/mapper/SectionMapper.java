package com.neonpass.infrastructure.adapter.out.persistence.mapper;

import com.neonpass.domain.model.Section;
import com.neonpass.infrastructure.adapter.out.persistence.entity.SectionEntity;
import org.mapstruct.Mapper;

/**
 * Mapper para conversión entre Section (domain) y SectionEntity (JPA).
 */
@Mapper(componentModel = "spring")
public interface SectionMapper {

    Section toDomain(SectionEntity entity);

    SectionEntity toEntity(Section domain);
}
