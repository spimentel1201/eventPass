package com.neonpass.infrastructure.adapter.out.persistence.mapper;

import com.neonpass.domain.model.TicketValidation;
import com.neonpass.infrastructure.adapter.out.persistence.entity.TicketValidationEntity;
import org.mapstruct.Mapper;

/**
 * Mapper para conversión entre TicketValidation (domain) y
 * TicketValidationEntity (JPA).
 */
@Mapper(componentModel = "spring")
public interface TicketValidationMapper {

    TicketValidation toDomain(TicketValidationEntity entity);

    TicketValidationEntity toEntity(TicketValidation domain);
}
