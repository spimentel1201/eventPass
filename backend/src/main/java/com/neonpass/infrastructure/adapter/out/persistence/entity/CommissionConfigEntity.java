package com.neonpass.infrastructure.adapter.out.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entidad JPA para la tabla commission_configs.
 * Configuración de comisiones por organización.
 */
@Entity
@Table(name = "commission_configs")
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommissionConfigEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "organization_id")
    private UUID organizationId;

    /** Porcentaje de comisión de la plataforma */
    @Column(name = "platform_fee_percentage", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal platformFeePercentage = new BigDecimal("5.00");

    /** Porcentaje de comisión del procesador de pago */
    @Column(name = "payment_processor_fee", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal paymentProcessorFee = new BigDecimal("2.90");

    /** Comisión fija por ticket */
    @Column(name = "flat_fee_per_ticket", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal flatFeePerTicket = new BigDecimal("0.30");

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
