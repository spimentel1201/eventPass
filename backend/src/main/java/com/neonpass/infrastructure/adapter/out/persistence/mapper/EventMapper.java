package com.neonpass.infrastructure.adapter.out.persistence.mapper;

import com.neonpass.domain.model.Event;
import com.neonpass.infrastructure.adapter.out.persistence.entity.EventEntity;
import org.mapstruct.Mapper;

/**
 * Mapper para conversión entre Event (domain) y EventEntity (JPA).
 */
@Mapper(componentModel = "spring")
public interface EventMapper {

    Event toDomain(EventEntity entity);

    EventEntity toEntity(Event domain);
}
