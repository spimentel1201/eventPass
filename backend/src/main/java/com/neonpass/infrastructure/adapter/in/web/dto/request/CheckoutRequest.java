package com.neonpass.infrastructure.adapter.in.web.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

/**
 * DTO para solicitud de checkout.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutRequest {

    @NotNull(message = "El ID del evento es requerido")
    private UUID eventId;

    @NotEmpty(message = "Debe incluir al menos un asiento")
    private List<UUID> seatIds;
}
