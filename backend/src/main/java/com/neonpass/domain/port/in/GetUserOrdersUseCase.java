package com.neonpass.domain.port.in;

import com.neonpass.domain.model.Order;

import java.util.List;
import java.util.UUID;

/**
 * Use Case para obtener órdenes de un usuario.
 */
public interface GetUserOrdersUseCase {

    List<Order> getOrdersByUser(UUID userId);
}
