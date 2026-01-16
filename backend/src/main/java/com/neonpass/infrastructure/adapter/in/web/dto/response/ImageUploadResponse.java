package com.neonpass.infrastructure.adapter.in.web.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * DTO para respuesta de subida de imagen.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImageUploadResponse {

    private String url;
    private String publicId;
    private Integer width;
    private Integer height;
    private String format;
    private Map<String, String> transformations;
}
