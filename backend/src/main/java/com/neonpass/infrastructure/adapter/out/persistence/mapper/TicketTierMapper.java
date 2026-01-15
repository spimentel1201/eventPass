package com.neonpass.infrastructure.adapter.out.persistence.mapper;

import com.neonpass.domain.model.TicketTier;
import com.neonpass.infrastructure.adapter.out.persistence.entity.TicketTierEntity;
import org.mapstruct.Mapper;

/**
 * Mapper para conversión entre TicketTier (domain) y TicketTierEntity (JPA).
 */
@Mapper(componentModel = "spring")
public interface TicketTierMapper {

    TicketTier toDomain(TicketTierEntity entity);

    TicketTierEntity toEntity(TicketTier domain);
}
