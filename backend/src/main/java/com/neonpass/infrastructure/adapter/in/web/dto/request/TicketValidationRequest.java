package com.neonpass.infrastructure.adapter.in.web.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para validación de ticket.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketValidationRequest {

    @NotBlank(message = "El QR code hash es requerido")
    private String qrCodeHash;
}
