package com.neonpass.infrastructure.adapter.out.persistence.mapper;

import com.neonpass.domain.model.User;
import com.neonpass.infrastructure.adapter.out.persistence.entity.UserEntity;
import org.mapstruct.Mapper;

/**
 * Mapper para conversión entre User (domain) y UserEntity (JPA).
 */
@Mapper(componentModel = "spring")
public interface UserMapper {

    User toDomain(UserEntity entity);

    UserEntity toEntity(User domain);
}
