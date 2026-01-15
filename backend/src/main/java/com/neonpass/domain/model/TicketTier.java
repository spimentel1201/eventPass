package com.neonpass.domain.model;

import com.neonpass.domain.model.enums.TicketTierStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Modelo de dominio para Nivel de Precio (Ticket Tier).
 * 
 * <p>
 * Conecta un evento con una sección y define el precio de los tickets.
 * </p>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketTier {

    private UUID id;
    private UUID eventId;
    private UUID sectionId;
    private String name;
    private BigDecimal price;
    private String currency;
    private Integer capacityAllocated;
    private TicketTierStatus status;
    private LocalDateTime createdAt;
    private Boolean deleted;
}
