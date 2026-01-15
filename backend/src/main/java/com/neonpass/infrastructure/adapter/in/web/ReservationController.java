package com.neonpass.infrastructure.adapter.in.web;

import com.neonpass.domain.port.in.ReleaseSeatUseCase;
import com.neonpass.domain.port.in.ReserveSeatUseCase;
import com.neonpass.infrastructure.adapter.in.web.dto.request.SeatReservationRequest;
import com.neonpass.infrastructure.adapter.in.web.dto.response.SeatReservationResponse;
import com.neonpass.infrastructure.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Controlador REST para reserva de asientos.
 */
@RestController
@RequestMapping("/api/v1/reservations")
@RequiredArgsConstructor
@Tag(name = "Reservas", description = "Bloqueo temporal de asientos")
@SecurityRequirement(name = "bearerAuth")
public class ReservationController {

    private final ReserveSeatUseCase reserveSeatUseCase;
    private final ReleaseSeatUseCase releaseSeatUseCase;

    @PostMapping("/seats")
    @Operation(summary = "Reservar asiento", description = "Bloquea un asiento por 10 minutos")
    public ResponseEntity<ApiResponse<SeatReservationResponse>> reserveSeat(
            @Valid @RequestBody SeatReservationRequest request,
            @AuthenticationPrincipal UUID userId) {

        var command = new ReserveSeatUseCase.ReserveSeatCommand(
                request.getEventId(),
                request.getSeatId(),
                userId);

        var result = reserveSeatUseCase.execute(command);

        var response = SeatReservationResponse.builder()
                .eventId(result.eventId())
                .seatId(result.seatId())
                .success(result.success())
                .message(result.message())
                .expiresInSeconds(result.expiresInSeconds())
                .build();

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/seats/{eventId}/{seatId}")
    @Operation(summary = "Liberar asiento", description = "Libera el bloqueo de un asiento")
    public ResponseEntity<ApiResponse<Void>> releaseSeat(
            @PathVariable UUID eventId,
            @PathVariable UUID seatId,
            @AuthenticationPrincipal UUID userId) {

        var command = new ReleaseSeatUseCase.ReleaseSeatCommand(eventId, seatId, userId);
        releaseSeatUseCase.execute(command);

        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
