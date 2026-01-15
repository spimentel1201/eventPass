package com.neonpass.infrastructure.adapter.in.web.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * DTO para el mapa de asientos de un evento.
 * Usado por el frontend para renderizar el selector de asientos.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeatingMapResponse {

    private UUID eventId;
    private UUID venueId;
    private String venueName;

    /**
     * Layout base del venue (canvas size, background, etc.)
     */
    private Map<String, Object> venueLayout;

    /**
     * Lista de secciones con sus asientos y disponibilidad.
     */
    private List<SectionWithSeatsResponse> sections;

    /**
     * Resumen de disponibilidad.
     */
    private AvailabilitySummary summary;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SectionWithSeatsResponse {
        private UUID id;
        private String name;
        private String type;
        private Integer capacity;
        private Map<String, Object> layoutConfig;

        // Para secciones GENERAL_ADMISSION
        private Integer availableCount;
        private Integer soldCount;

        // Para secciones SEATED
        private List<SeatResponse> seats;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AvailabilitySummary {
        private Integer totalCapacity;
        private Integer totalAvailable;
        private Integer totalSold;
        private Integer totalReserved;
    }
}
