package com.neonpass.infrastructure.adapter.in.web.dto.response;

import com.neonpass.domain.model.enums.TicketStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO de respuesta para tickets del usuario.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MyTicketResponse {

    private UUID id;
    private UUID eventId;
    private String eventTitle;
    private LocalDateTime eventDate;
    private String venueName;
    private String venueAddress;

    // Seat info
    private String sectionName;
    private String row;
    private String seatNumber;

    // Tier info
    private String tierName;

    // Price
    private BigDecimal price;
    private String currency;

    // QR
    private String qrCodeHash;

    // Status
    private TicketStatus status;
    private LocalDateTime scannedAt;
    private LocalDateTime purchasedAt;
}
