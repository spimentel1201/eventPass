package com.neonpass.infrastructure.adapter.out.persistence.repository;

import com.neonpass.domain.model.enums.OrderStatus;
import com.neonpass.infrastructure.adapter.out.persistence.entity.OrderEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repositorio Spring Data JPA para órdenes.
 */
@Repository
public interface JpaOrderRepository extends JpaRepository<OrderEntity, UUID> {

    List<OrderEntity> findByUserId(UUID userId);

    List<OrderEntity> findByEventId(UUID eventId);

    List<OrderEntity> findByUserIdAndStatus(UUID userId, OrderStatus status);
}
