package com.neonpass.infrastructure.adapter.out.persistence.adapter;

import com.neonpass.domain.model.Order;
import com.neonpass.domain.model.enums.OrderStatus;
import com.neonpass.domain.port.out.OrderRepository;
import com.neonpass.infrastructure.adapter.out.persistence.mapper.OrderMapper;
import com.neonpass.infrastructure.adapter.out.persistence.repository.JpaOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Adapter que implementa el puerto de salida OrderRepository.
 */
@Component
@RequiredArgsConstructor
public class OrderPersistenceAdapter implements OrderRepository {

    private final JpaOrderRepository jpaOrderRepository;
    private final OrderMapper orderMapper;

    @Override
    public Optional<Order> findById(UUID id) {
        return jpaOrderRepository.findById(id)
                .map(orderMapper::toDomain);
    }

    @Override
    public List<Order> findByUserId(UUID userId) {
        return jpaOrderRepository.findByUserId(userId).stream()
                .map(orderMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Order> findByEventId(UUID eventId) {
        return jpaOrderRepository.findByEventId(eventId).stream()
                .map(orderMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Order> findByUserIdAndStatus(UUID userId, OrderStatus status) {
        return jpaOrderRepository.findByUserIdAndStatus(userId, status).stream()
                .map(orderMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Order> findAll() {
        return jpaOrderRepository.findAll().stream()
                .map(orderMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Order save(Order order) {
        var entity = orderMapper.toEntity(order);
        var saved = jpaOrderRepository.save(entity);
        return orderMapper.toDomain(saved);
    }
}
