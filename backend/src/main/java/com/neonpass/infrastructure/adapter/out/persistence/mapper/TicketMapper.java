package com.neonpass.infrastructure.adapter.out.persistence.mapper;

import com.neonpass.domain.model.Ticket;
import com.neonpass.infrastructure.adapter.out.persistence.entity.TicketEntity;
import org.mapstruct.Mapper;

/**
 * Mapper para conversión entre Ticket (domain) y TicketEntity (JPA).
 */
@Mapper(componentModel = "spring")
public interface TicketMapper {

    Ticket toDomain(TicketEntity entity);

    TicketEntity toEntity(Ticket domain);
}
