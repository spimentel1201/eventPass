package com.neonpass.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Modelo de dominio para Recinto (Venue).
 * 
 * <p>
 * Representa un lugar físico donde se realizan eventos (estadio, teatro, etc.).
 * </p>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Venue {

    private UUID id;
    private UUID organizationId;
    private String name;
    private String address;
    private String timezone;
    /** Configuración del layout base en formato JSON */
    private String baseLayoutJson;
    private LocalDateTime createdAt;
    private Boolean deleted;
}
