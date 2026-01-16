package com.neonpass.domain.model;

import com.neonpass.domain.model.enums.SectionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Modelo de dominio para Sección.
 * 
 * <p>
 * Representa una zona dentro de un recinto (tribuna, palco, campo, etc.).
 * </p>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Section {

    private UUID id;
    private UUID venueId;
    private String name;
    private SectionType type;
    private Integer capacity;
    /** Configuración del layout de la sección en formato JSON */
    private String layoutConfig;
    private LocalDateTime createdAt;
    private Boolean deleted;
}
