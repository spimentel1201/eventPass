package com.neonpass.infrastructure.adapter.in.web.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para crear organización.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrganizationRequest {

    @NotBlank(message = "El nombre es requerido")
    private String name;

    @NotBlank(message = "El slug es requerido")
    private String slug;
}
