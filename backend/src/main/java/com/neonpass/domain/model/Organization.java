package com.neonpass.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Modelo de dominio para Organización (Tenant).
 * 
 * <p>
 * Representa una organización/empresa que organiza eventos en el sistema SaaS.
 * </p>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Organization {

    private UUID id;
    private UUID ownerId;
    private String name;
    private String slug;
    private String stripeAccountId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean deleted;
}
