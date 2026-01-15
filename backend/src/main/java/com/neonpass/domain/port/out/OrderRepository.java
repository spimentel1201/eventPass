package com.neonpass.domain.port.out;

import com.neonpass.domain.model.Order;
import com.neonpass.domain.model.enums.OrderStatus;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Puerto de salida para operaciones de persistencia de órdenes.
 */
public interface OrderRepository {

    Optional<Order> findById(UUID id);

    List<Order> findByUserId(UUID userId);

    List<Order> findByEventId(UUID eventId);

    List<Order> findByUserIdAndStatus(UUID userId, OrderStatus status);

    List<Order> findAll();

    Order save(Order order);
}
