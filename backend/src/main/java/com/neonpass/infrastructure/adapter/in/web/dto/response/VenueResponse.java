package com.neonpass.infrastructure.adapter.in.web.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO de respuesta para venue.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VenueResponse {

    private UUID id;
    private UUID organizationId;
    private String name;
    private String address;
    private String timezone;
    private LocalDateTime createdAt;
}
