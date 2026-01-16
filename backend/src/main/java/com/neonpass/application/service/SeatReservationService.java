package com.neonpass.application.service;

import com.neonpass.domain.exception.EventNotFoundException;
import com.neonpass.domain.exception.SeatNotAvailableException;
import com.neonpass.domain.exception.SeatNotFoundException;
import com.neonpass.domain.model.enums.TicketStatus;
import com.neonpass.domain.port.in.ReleaseSeatUseCase;
import com.neonpass.domain.port.in.ReserveSeatUseCase;
import com.neonpass.domain.port.out.EventRepository;
import com.neonpass.domain.port.out.SeatRepository;
import com.neonpass.domain.port.out.TicketRepository;
import com.neonpass.infrastructure.adapter.out.redis.SeatLockService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

/**
 * Servicio para reserva de asientos con bloqueo distribuido.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SeatReservationService implements ReserveSeatUseCase, ReleaseSeatUseCase {

    private final SeatLockService seatLockService;
    private final SeatRepository seatRepository;
    private final EventRepository eventRepository;
    private final TicketRepository ticketRepository;

    private static final int LOCK_EXPIRES_SECONDS = 600; // 10 minutos

    @Override
    public ReservationResult execute(ReserveSeatCommand command) {
        log.info("Intentando reservar asiento {} para evento {} por usuario {}",
                command.seatId(), command.eventId(), command.userId());

        // Verificar que el evento existe
        eventRepository.findById(command.eventId())
                .orElseThrow(() -> new EventNotFoundException(command.eventId()));

        // Verificar que el asiento existe
        seatRepository.findById(command.seatId())
                .orElseThrow(() -> new SeatNotFoundException(command.seatId()));

        // Verificar que no esté ya vendido
        boolean alreadySold = ticketRepository.existsByEventIdAndSeatIdAndStatusIn(
                command.eventId(),
                command.seatId(),
                List.of(TicketStatus.VALID, TicketStatus.USED));

        if (alreadySold) {
            log.warn("Asiento {} ya vendido para evento {}", command.seatId(), command.eventId());
            throw new SeatNotAvailableException(command.seatId(), command.eventId());
        }

        // Intentar bloquear en Redis
        boolean locked = seatLockService.lockSeat(
                command.eventId(),
                command.seatId(),
                command.userId());

        if (!locked) {
            // Ver quién lo tiene bloqueado
            UUID lockedBy = seatLockService.getLockedBy(command.eventId(), command.seatId());

            // Si el mismo usuario ya lo tiene, es exitoso
            if (command.userId().equals(lockedBy)) {
                return new ReservationResult(
                        command.eventId(),
                        command.seatId(),
                        command.userId(),
                        true,
                        "Asiento ya reservado por ti",
                        LOCK_EXPIRES_SECONDS);
            }

            throw new SeatNotAvailableException(command.seatId(), command.eventId());
        }

        return new ReservationResult(
                command.eventId(),
                command.seatId(),
                command.userId(),
                true,
                "Asiento reservado exitosamente",
                LOCK_EXPIRES_SECONDS);
    }

    @Override
    public boolean execute(ReleaseSeatCommand command) {
        log.info("Liberando reserva de asiento {} para evento {} por usuario {}",
                command.seatId(), command.eventId(), command.userId());

        return seatLockService.unlockSeat(
                command.eventId(),
                command.seatId(),
                command.userId());
    }
}
