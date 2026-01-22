package com.neonpass.infrastructure.adapter.out.persistence.mapper;

import com.neonpass.domain.model.Payment;
import com.neonpass.infrastructure.adapter.out.persistence.entity.PaymentEntity;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

/**
 * MapStruct mapper for Payment entity.
 */
@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface PaymentMapper {

    Payment toDomain(PaymentEntity entity);

    PaymentEntity toEntity(Payment domain);
}
