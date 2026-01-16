package com.neonpass.application.service;

import com.neonpass.domain.exception.EventNotFoundException;
import com.neonpass.domain.exception.OrderNotFoundException;
import com.neonpass.domain.exception.SeatNotAvailableException;
import com.neonpass.domain.model.Order;
import com.neonpass.domain.model.Ticket;
import com.neonpass.domain.model.TicketTier;
import com.neonpass.domain.model.enums.OrderStatus;
import com.neonpass.domain.port.in.CheckoutUseCase;
import com.neonpass.domain.port.in.GetOrderUseCase;
import com.neonpass.domain.port.in.GetUserOrdersUseCase;
import com.neonpass.domain.port.out.EventRepository;
import com.neonpass.domain.port.out.OrderRepository;
import com.neonpass.domain.port.out.TicketTierRepository;
import com.neonpass.infrastructure.adapter.out.redis.SeatLockService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Servicio de gestión de órdenes.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class OrderService implements CheckoutUseCase, GetOrderUseCase, GetUserOrdersUseCase {

    private final OrderRepository orderRepository;
    private final EventRepository eventRepository;
    private final TicketTierRepository ticketTierRepository;
    private final SeatLockService seatLockService;
    private final TicketService ticketService;

    private static final BigDecimal PLATFORM_FEE_RATE = new BigDecimal("0.05"); // 5%
    private static final String DEFAULT_CURRENCY = "USD";

    @Override
    public CheckoutResult execute(CheckoutCommand command) {
        log.info("Procesando checkout para usuario {} con {} asientos",
                command.userId(), command.seatIds().size());

        // Verificar evento
        eventRepository.findById(command.eventId())
                .orElseThrow(() -> new EventNotFoundException(command.eventId()));

        // Verificar que el usuario tiene los bloqueos de todos los asientos
        for (UUID seatId : command.seatIds()) {
            if (!seatLockService.isLockedByUser(command.eventId(), seatId, command.userId())) {
                log.warn("Usuario {} no tiene bloqueo del asiento {}", command.userId(), seatId);
                throw new SeatNotAvailableException(seatId, command.eventId());
            }
        }

        // Obtener precio (usar primer tier como default por ahora)
        List<TicketTier> tiers = ticketTierRepository.findByEventId(command.eventId());
        BigDecimal pricePerTicket = tiers.isEmpty()
                ? BigDecimal.ZERO
                : tiers.get(0).getPrice();
        UUID tierId = tiers.isEmpty() ? null : tiers.get(0).getId();

        // Calcular totales
        BigDecimal subtotal = pricePerTicket.multiply(BigDecimal.valueOf(command.seatIds().size()));
        BigDecimal platformFee = subtotal.multiply(PLATFORM_FEE_RATE);
        BigDecimal totalAmount = subtotal.add(platformFee);
        BigDecimal netAmount = subtotal.subtract(platformFee);

        // Crear orden
        Order order = Order.builder()
                .id(UUID.randomUUID())
                .userId(command.userId())
                .eventId(command.eventId())
                .status(OrderStatus.PAID)
                .totalAmount(totalAmount)
                .platformFee(platformFee)
                .netAmount(netAmount)
                .currency(DEFAULT_CURRENCY)
                .createdAt(LocalDateTime.now())
                .build();

        Order savedOrder = orderRepository.save(order);
        log.info("Orden creada: {}", savedOrder.getId());

        // Crear tickets
        List<UUID> ticketIds = new ArrayList<>();
        for (UUID seatId : command.seatIds()) {
            Ticket ticket = ticketService.createTicket(
                    savedOrder.getId(),
                    command.eventId(),
                    tierId,
                    seatId,
                    pricePerTicket,
                    DEFAULT_CURRENCY);
            ticketIds.add(ticket.getId());

            // Liberar bloqueo Redis (ya está vendido)
            seatLockService.unlockSeat(command.eventId(), seatId, command.userId());
        }

        log.info("Checkout completado: {} tickets generados", ticketIds.size());

        return new CheckoutResult(
                savedOrder.getId(),
                ticketIds.size(),
                totalAmount,
                DEFAULT_CURRENCY,
                ticketIds);
    }

    @Override
    @Transactional(readOnly = true)
    public Order getOrder(UUID orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException(orderId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Order> getOrdersByUser(UUID userId) {
        return orderRepository.findByUserId(userId);
    }
}
