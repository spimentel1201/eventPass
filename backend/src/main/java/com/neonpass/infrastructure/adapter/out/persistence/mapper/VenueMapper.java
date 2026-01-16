package com.neonpass.infrastructure.adapter.out.persistence.mapper;

import com.neonpass.domain.model.Venue;
import com.neonpass.infrastructure.adapter.out.persistence.entity.VenueEntity;
import org.mapstruct.Mapper;

/**
 * Mapper para conversión entre Venue (domain) y VenueEntity (JPA).
 */
@Mapper(componentModel = "spring")
public interface VenueMapper {

    Venue toDomain(VenueEntity entity);

    VenueEntity toEntity(Venue domain);
}
