package com.neonpass.infrastructure.adapter.in.web.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * DTO para guardar el layout completo del venue desde el editor visual.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VenueLayoutRequest {

    /**
     * Layout completo del venue en formato JSON.
     * Contiene: canvas size, secciones con polígonos, coordenadas, colores, etc.
     */
    private Map<String, Object> layout;
}
