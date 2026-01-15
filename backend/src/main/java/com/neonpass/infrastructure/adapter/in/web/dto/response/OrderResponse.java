package com.neonpass.infrastructure.adapter.in.web.dto.response;

import com.neonpass.domain.model.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO para respuesta de orden.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {

    private UUID id;
    private UUID userId;
    private UUID eventId;
    private OrderStatus status;
    private BigDecimal totalAmount;
    private BigDecimal platformFee;
    private BigDecimal netAmount;
    private String currency;
    private LocalDateTime createdAt;

    // Info adicional para admin
    private String userEmail;
    private String eventTitle;
    private Integer ticketCount;
}
