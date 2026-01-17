package com.neonpass.infrastructure.adapter.in.web.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * DTO para checkout basado en secciones.
 * Usado cuando el usuario selecciona cantidad de entradas por sección,
 * sin selección de asientos individuales.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SectionCheckoutRequest {

    @NotNull(message = "El ID del evento es requerido")
    private UUID eventId;

    @NotEmpty(message = "Debe incluir al menos un item")
    private List<SectionItem> items;

    private BigDecimal totalAmount;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SectionItem {
        @NotNull(message = "El ID de la sección es requerido")
        private UUID sectionId;

        @Min(value = 1, message = "La cantidad debe ser al menos 1")
        private int quantity;

        @NotNull(message = "El precio por ticket es requerido")
        private BigDecimal pricePerTicket;
    }
}
