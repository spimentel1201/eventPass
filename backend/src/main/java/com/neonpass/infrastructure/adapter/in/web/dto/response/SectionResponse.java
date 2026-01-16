package com.neonpass.infrastructure.adapter.in.web.dto.response;

import com.neonpass.domain.model.enums.SectionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

/**
 * DTO para respuesta de sección.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SectionResponse {

    private UUID id;
    private UUID venueId;
    private String name;
    private SectionType type;
    private Integer capacity;
    private Map<String, Object> layoutConfig;
    private LocalDateTime createdAt;
}
