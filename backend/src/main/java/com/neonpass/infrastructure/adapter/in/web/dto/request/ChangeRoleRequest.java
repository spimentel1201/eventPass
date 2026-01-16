package com.neonpass.infrastructure.adapter.in.web.dto.request;

import com.neonpass.domain.model.enums.UserRole;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para cambiar rol de usuario.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChangeRoleRequest {

    @NotNull(message = "El rol es requerido")
    private UserRole role;
}
