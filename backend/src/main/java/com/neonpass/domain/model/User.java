package com.neonpass.domain.model;

import com.neonpass.domain.model.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Modelo de dominio para Usuario.
 * 
 * <p>
 * Representa a un usuario del sistema, puede ser comprador, staff o admin.
 * </p>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    private UUID id;
    private String email;
    private String passwordHash;
    private String fullName;
    private UserRole role;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean deleted;
}
