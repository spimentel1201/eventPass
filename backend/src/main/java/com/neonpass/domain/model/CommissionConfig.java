package com.neonpass.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Modelo de dominio para Configuración de Comisiones.
 * 
 * <p>
 * Define las comisiones aplicables a una organización.
 * </p>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommissionConfig {

    private UUID id;
    private UUID organizationId;
    /** Porcentaje de comisión de la plataforma (ej: 5.00%) */
    private BigDecimal platformFeePercentage;
    /** Porcentaje de comisión del procesador de pago (ej: 2.90%) */
    private BigDecimal paymentProcessorFee;
    /** Comisión fija por ticket (ej: $0.30) */
    private BigDecimal flatFeePerTicket;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
