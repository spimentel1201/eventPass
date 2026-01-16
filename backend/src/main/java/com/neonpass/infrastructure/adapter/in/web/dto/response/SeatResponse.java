package com.neonpass.infrastructure.adapter.in.web.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * DTO para respuesta de asiento.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeatResponse {

    private UUID id;
    private UUID sectionId;
    private String rowLabel;
    private String numberLabel;
    private Integer xPosition;
    private Integer yPosition;
    private Boolean isAccessible;

    // Estado para el mapa de compra
    private String status; // AVAILABLE, RESERVED, SOLD
}
