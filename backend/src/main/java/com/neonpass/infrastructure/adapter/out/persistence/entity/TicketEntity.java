package com.neonpass.infrastructure.adapter.out.persistence.entity;

import com.neonpass.domain.model.enums.TicketStatus;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entidad JPA para la tabla tickets.
 */
@Entity
@Table(name = "tickets", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "event_id", "seat_id" })
})
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "order_id")
    private UUID orderId;

    @Column(name = "event_id")
    private UUID eventId;

    @Column(name = "ticket_tier_id")
    private UUID ticketTierId;

    /** Nullable para General Admission */
    @Column(name = "seat_id")
    private UUID seatId;

    /** Precio congelado al momento de la compra */
    @Column(name = "price_snapshot", nullable = false, precision = 10, scale = 2)
    private BigDecimal priceSnapshot;

    /** Moneda congelada al momento de la compra */
    @Column(name = "currency_snapshot")
    @Builder.Default
    private String currencySnapshot = "USD";

    /** Hash del código QR firmado (HMAC-SHA256) */
    @Column(name = "qr_code_hash", nullable = false, length = 512)
    private String qrCodeHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private TicketStatus status = TicketStatus.VALID;

    @Column(name = "scanned_at")
    private LocalDateTime scannedAt;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
