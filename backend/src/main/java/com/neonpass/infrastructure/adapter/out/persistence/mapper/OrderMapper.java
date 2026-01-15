package com.neonpass.infrastructure.adapter.out.persistence.mapper;

import com.neonpass.domain.model.Order;
import com.neonpass.infrastructure.adapter.out.persistence.entity.OrderEntity;
import org.mapstruct.Mapper;

/**
 * Mapper para conversión entre Order (domain) y OrderEntity (JPA).
 */
@Mapper(componentModel = "spring")
public interface OrderMapper {

    Order toDomain(OrderEntity entity);

    OrderEntity toEntity(Order domain);
}
