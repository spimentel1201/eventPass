package com.neonpass.infrastructure.adapter.out.persistence.mapper;

import com.neonpass.domain.model.Seat;
import com.neonpass.infrastructure.adapter.out.persistence.entity.SeatEntity;
import org.mapstruct.Mapper;

/**
 * Mapper para conversión entre Seat (domain) y SeatEntity (JPA).
 */
@Mapper(componentModel = "spring")
public interface SeatMapper {

    Seat toDomain(SeatEntity entity);

    SeatEntity toEntity(Seat domain);
}
