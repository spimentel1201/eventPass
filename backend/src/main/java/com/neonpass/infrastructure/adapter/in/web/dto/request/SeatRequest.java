package com.neonpass.infrastructure.adapter.in.web.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para crear asientos en bulk.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeatRequest {

    @NotBlank(message = "La fila es requerida")
    private String rowLabel;

    @NotBlank(message = "El número es requerido")
    private String numberLabel;

    private Integer xPosition;
    private Integer yPosition;
    private Boolean isAccessible;
}
