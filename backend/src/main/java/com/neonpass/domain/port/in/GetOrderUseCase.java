package com.neonpass.domain.port.in;

import com.neonpass.domain.model.Order;

import java.util.UUID;

/**
 * Use Case para obtener una orden por ID.
 */
public interface GetOrderUseCase {

    Order getOrder(UUID orderId);
}
