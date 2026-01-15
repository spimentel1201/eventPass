package com.neonpass.infrastructure.adapter.in.web.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * DTO para respuesta de reserva de asiento.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeatReservationResponse {

    private UUID eventId;
    private UUID seatId;
    private boolean success;
    private String message;
    private int expiresInSeconds;
}
