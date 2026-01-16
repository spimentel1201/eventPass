package com.neonpass.infrastructure.adapter.out.persistence.entity;

import com.neonpass.domain.model.enums.ValidationStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entidad JPA para la tabla ticket_validations.
 * Registro de auditoría para validaciones de tickets en puerta.
 */
@Entity
@Table(name = "ticket_validations")
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketValidationEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "ticket_id")
    private UUID ticketId;

    /** ID del staff que realizó la validación */
    @Column(name = "validated_by")
    private UUID validatedBy;

    @CreatedDate
    @Column(name = "validated_at", nullable = false, updatable = false)
    private LocalDateTime validatedAt;

    /** Metadata de ubicación (GPS, dispositivo, puerta) */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "location_metadata", columnDefinition = "jsonb")
    private String locationMetadata;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ValidationStatus status = ValidationStatus.SUCCESS;

    @Column(name = "rejection_reason")
    private String rejectionReason;
}
