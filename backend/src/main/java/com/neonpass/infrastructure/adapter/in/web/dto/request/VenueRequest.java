package com.neonpass.infrastructure.adapter.in.web.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * DTO para crear venue.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VenueRequest {

    @NotNull(message = "El ID de la organización es requerido")
    private UUID organizationId;

    @NotBlank(message = "El nombre es requerido")
    private String name;

    private String address;
    private String timezone;
}
