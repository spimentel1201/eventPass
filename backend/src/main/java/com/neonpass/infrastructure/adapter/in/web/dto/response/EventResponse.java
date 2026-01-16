package com.neonpass.infrastructure.adapter.in.web.dto.response;

import com.neonpass.domain.model.enums.EventStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

/**
 * DTO para respuesta de evento con información completa.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventResponse {

    private UUID id;
    private UUID organizationId;
    private UUID venueId;
    private String title;
    private String description;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private EventStatus status;
    private LocalDateTime createdAt;

    // Imágenes del evento
    private EventImagesResponse images;

    // Metadata adicional
    private Map<String, Object> metadata;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EventImagesResponse {
        private ImageInfo banner;
        private ImageInfo thumbnail;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ImageInfo {
        private String url;
        private Integer width;
        private Integer height;
        private Map<String, String> transformations;
    }
}
