package com.neonpass.domain.model;

import com.neonpass.domain.model.enums.TicketStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Modelo de dominio para Ticket.
 * 
 * <p>
 * Representa un ticket individual de entrada a un evento.
 * </p>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Ticket {

    private UUID id;
    private UUID orderId;
    private UUID eventId;
    private UUID ticketTierId;
    /** Nullable para General Admission */
    private UUID seatId;
    /** Precio congelado al momento de la compra */
    private BigDecimal priceSnapshot;
    /** Moneda congelada al momento de la compra */
    private String currencySnapshot;
    /** Hash del código QR firmado (HMAC-SHA256) */
    private String qrCodeHash;
    private TicketStatus status;
    /** Timestamp cuando fue escaneado */
    private LocalDateTime scannedAt;
    private LocalDateTime createdAt;
}
