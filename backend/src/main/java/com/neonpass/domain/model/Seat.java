package com.neonpass.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Modelo de dominio para Asiento.
 * 
 * <p>
 * Representa un asiento individual numerado dentro de una sección.
 * </p>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Seat {

    private UUID id;
    private UUID sectionId;
    private String rowLabel;
    private String numberLabel;
    private Integer xPosition;
    private Integer yPosition;
    private Boolean isAccessible;
    private Boolean deleted;
}
