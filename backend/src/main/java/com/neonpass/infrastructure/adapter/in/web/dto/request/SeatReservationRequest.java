package com.neonpass.infrastructure.adapter.in.web.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * DTO para solicitud de reserva de asiento.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeatReservationRequest {

    @NotNull(message = "El ID del evento es requerido")
    private UUID eventId;

    @NotNull(message = "El ID del asiento es requerido")
    private UUID seatId;
}
