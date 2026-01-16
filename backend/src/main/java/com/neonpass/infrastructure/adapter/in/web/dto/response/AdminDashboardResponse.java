package com.neonpass.infrastructure.adapter.in.web.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO para el dashboard de administración.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardResponse {

    // Contadores
    private Long totalUsers;
    private Long totalEvents;
    private Long totalOrganizations;
    private Long totalVenues;
    private Long totalOrders;
    private Long totalTickets;

    // Estadísticas de eventos
    private Long publishedEvents;
    private Long draftEvents;

    // Estadísticas de ventas
    private BigDecimal totalRevenue;
    private BigDecimal platformFees;

    // Usuarios por rol
    private Long adminCount;
    private Long staffCount;
    private Long userCount;
}
