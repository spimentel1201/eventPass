# Especificación de Implementación: Integración de Cloudinary en NeonPass
**Contexto:** Implementación de gestión de imágenes (banners, thumbnails, galerías) para eventos SaaS usando Spring Boot (Backend) y Cloudinary (Storage), persistiendo metadata en PostgreSQL (JSONB).

---

## 1. Capa de Datos (PostgreSQL)

### Schema Changes
Ejecutar el siguiente script SQL para preparar la tabla `events` para almacenar metadatos JSONB y búsquedas optimizadas.

```sql
-- Verificar que el campo metadata existe en events
ALTER TABLE events ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Crear índices para búsquedas eficientes
CREATE INDEX IF NOT EXISTS idx_events_metadata_gin ON events USING GIN (metadata);

-- Índice específico para URLs de banner (búsquedas frecuentes)
CREATE INDEX IF NOT EXISTS idx_events_banner_url ON events ((metadata->'media'->'images'->'banner'->>'url'))
WHERE metadata->'media'->'images'->'banner' IS NOT NULL;
```

### Configuración del Proyecto
Dependencias (pom.xml)
Agregar las siguientes dependencias para Cloudinary, manejo de tipos JSON en Hibernate y Jackson.

```xml
<dependencies>
    <dependency>
        <groupId>com.cloudinary</groupId>
        <artifactId>cloudinary-http44</artifactId>
        <version>1.36.0</version>
    </dependency>
    
    <dependency>
        <groupId>com.vladmihalcea</groupId>
        <artifactId>hibernate-types-60</artifactId>
        <version>2.21.1</version>
    </dependency>
    
    <dependency>
        <groupId>com.fasterxml.jackson.core</groupId>
        <artifactId>jackson-databind</artifactId>
    </dependency>
</dependencies>
```

### Configuración (application.yml)

```yaml
cloudinary:
  cloud-name: ${CLOUDINARY_CLOUD_NAME}
  api-key: ${CLOUDINARY_API_KEY}
  api-secret: ${CLOUDINARY_API_SECRET}
  secure: true

spring:
  servlet:
    multipart:
      max-file-size: 10MB
      max-request-size: 10MB
```

### Variables de Entorno (.env)

```bash
CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=tu-api-key
CLOUDINARY_API_SECRET=tu-api-secret
``` 

#### Infraestructura y Configuración Java
Archivo: src/main/java/com/neonpass/infrastructure/config/CloudinaryConfig.java
Java

package com.neonpass.infrastructure.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CloudinaryConfig {
    
    @Value("${cloudinary.cloud-name}")
    private String cloudName;
    
    @Value("${cloudinary.api-key}")
    private String apiKey;
    
    @Value("${cloudinary.api-secret}")
    private String apiSecret;
    
    @Bean
    public Cloudinary cloudinary() {
        return new Cloudinary(ObjectUtils.asMap(
            "cloud_name", cloudName,
            "api_key", apiKey,
            "api_secret", apiSecret,
            "secure", true
        ));
    }
}

#### Capa de Dominio
Archivo: src/main/java/com/neonpass/domain/model/Event.java
Entidad actualizada con soporte para JSONB y métodos helper para manipulación de banners.

Java

package com.neonpass.domain.model;

import com.vladmihalcea.hibernate.type.json.JsonBinaryType;
import lombok.Data;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;
import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Data
@Entity
@Table(name = "events")
@SQLDelete(sql = "UPDATE events SET deleted = true WHERE id = ?")
@Where(clause = "deleted = false")
public class Event {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;
    
    @Column(name = "end_time")
    private LocalDateTime endTime;
    
    @Column(length = 20)
    private String status = "DRAFT";
    
    // JSONB para multimedia y metadata
    @Type(JsonBinaryType.class)
    @Column(columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> metadata = new HashMap<>();
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    @Column(nullable = false)
    private Boolean deleted = false;
    
    // Helper methods para acceso a imágenes
    @SuppressWarnings("unchecked")
    public String getBannerUrl() {
        if (metadata == null) return null;
        
        Map<String, Object> media = (Map<String, Object>) metadata.get("media");
        if (media == null) return null;
        
        Map<String, Object> images = (Map<String, Object>) media.get("images");
        if (images == null) return null;
        
        Map<String, Object> banner = (Map<String, Object>) images.get("banner");
        if (banner == null) return null;
        
        return (String) banner.get("url");
    }
    
    @SuppressWarnings("unchecked")
    public void setBannerData(Map<String, Object> bannerData) {
        if (metadata == null) {
            metadata = new HashMap<>();
        }
        
        metadata.putIfAbsent("media", new HashMap<String, Object>());
        Map<String, Object> media = (Map<String, Object>) metadata.get("media");
        
        media.putIfAbsent("images", new HashMap<String, Object>());
        Map<String, Object> images = (Map<String, Object>) media.get("images");
        
        images.put("banner", bannerData);
    }
}
#### Capa de Aplicación (DTOs y Servicio)
Archivo: src/main/java/com/neonpass/application/dto/ImageUploadResponse.java
Java

package com.neonpass.application.dto;

import lombok.Builder;
import lombok.Data;
import java.util.Map;

@Data
@Builder
public class ImageUploadResponse {
    private String url;
    private String publicId;
    private Integer width;
    private Integer height;
    private String format;
    private Map<String, String> transformations;
}
Archivo: src/main/java/com/neonpass/application/service/EventImageService.java
Lógica de negocio para subir, transformar y eliminar imágenes en Cloudinary y actualizar metadata JSONB.

Java

package com.neonpass.application.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.neonpass.domain.model.Event;
import com.neonpass.domain.repository.EventRepository;
import com.neonpass.application.dto.ImageUploadResponse;
import com.neonpass.application.exception.EventNotFoundException;
import com.neonpass.application.exception.InvalidImageException;
import com.neonpass.application.exception.ImageUploadException;
import com.neonpass.application.exception.ImageDeletionException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class EventImageService {
    
    private final Cloudinary cloudinary;
    private final EventRepository eventRepository;
    
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final List<String> ALLOWED_TYPES = List.of(
        "image/jpeg", 
        "image/png", 
        "image/webp"
    );
    
    @Transactional
    public ImageUploadResponse uploadBanner(UUID eventId, MultipartFile file) {
        Event event = eventRepository.findById(eventId)
            .orElseThrow(() -> new EventNotFoundException(eventId));
            
        validateImage(file);
        
        try {
            Map<String, Object> uploadParams = ObjectUtils.asMap(
                "folder", String.format("neonpass/events/%s", eventId),
                "public_id", "banner",
                "overwrite", true,
                "resource_type", "image",
                "transformation", new Object[] {
                    ObjectUtils.asMap("width", 1920, "height", 600, "crop", "limit"),
                    ObjectUtils.asMap("quality", "auto:good"),
                    ObjectUtils.asMap("fetch_format", "auto")
                }
            );
            
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), uploadParams);
            Map<String, Object> bannerData = buildImageMetadata(uploadResult);
            
            String baseUrl = (String) uploadResult.get("secure_url");
            Map<String, String> transformations = generateTransformations(baseUrl);
            bannerData.put("transformations", transformations);
            
            event.setBannerData(bannerData);
            eventRepository.save(event);
            
            log.info("Banner uploaded successfully for event {}: {}", eventId, uploadResult.get("secure_url"));
            
            return ImageUploadResponse.builder()
                .url((String) uploadResult.get("secure_url"))
                .publicId((String) uploadResult.get("public_id"))
                .width((Integer) uploadResult.get("width"))
                .height((Integer) uploadResult.get("height"))
                .format((String) uploadResult.get("format"))
                .transformations(transformations)
                .build();
                
        } catch (IOException e) {
            log.error("Error uploading banner for event {}", eventId, e);
            throw new ImageUploadException("Failed to upload banner", e);
        }
    }
    
    @Transactional
    public ImageUploadResponse uploadThumbnail(UUID eventId, MultipartFile file) {
        Event event = eventRepository.findById(eventId)
            .orElseThrow(() -> new EventNotFoundException(eventId));
            
        validateImage(file);
        
        try {
            Map<String, Object> uploadParams = ObjectUtils.asMap(
                "folder", String.format("neonpass/events/%s", eventId),
                "public_id", "thumbnail",
                "overwrite", true,
                "transformation", new Object[] {
                    ObjectUtils.asMap("width", 400, "height", 400, "crop", "fill", "gravity", "auto"),
                    ObjectUtils.asMap("quality", "auto:good")
                }
            );
            
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), uploadParams);
            Map<String, Object> thumbnailData = buildImageMetadata(uploadResult);
            
            updateMetadataPath(event, "media.images.thumbnail", thumbnailData);
            eventRepository.save(event);
            
            return ImageUploadResponse.builder()
                .url((String) uploadResult.get("secure_url"))
                .publicId((String) uploadResult.get("public_id"))
                .width((Integer) uploadResult.get("width"))
                .height((Integer) uploadResult.get("height"))
                .format((String) uploadResult.get("format"))
                .build();
                
        } catch (IOException e) {
            throw new ImageUploadException("Failed to upload thumbnail", e);
        }
    }
    
    @Transactional
    public ImageUploadResponse addGalleryImage(UUID eventId, MultipartFile file, String altText) {
        Event event = eventRepository.findById(eventId)
            .orElseThrow(() -> new EventNotFoundException(eventId));
            
        validateImage(file);
        
        try {
            String imageId = UUID.randomUUID().toString();
            Map<String, Object> uploadParams = ObjectUtils.asMap(
                "folder", String.format("neonpass/events/%s/gallery", eventId),
                "public_id", imageId,
                "transformation", new Object[] {
                    ObjectUtils.asMap("width", 1200, "height", 800, "crop", "limit"),
                    ObjectUtils.asMap("quality", "auto:good")
                }
            );
            
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), uploadParams);
            Map<String, Object> imageData = buildImageMetadata(uploadResult);
            imageData.put("altText", altText != null ? altText : "Event gallery image");
            
            addToGallery(event, imageData);
            eventRepository.save(event);
            
            return ImageUploadResponse.builder()
                .url((String) uploadResult.get("secure_url"))
                .publicId((String) uploadResult.get("public_id"))
                .width((Integer) uploadResult.get("width"))
                .height((Integer) uploadResult.get("height"))
                .build();
                
        } catch (IOException e) {
            throw new ImageUploadException("Failed to add gallery image", e);
        }
    }
    
    @Transactional
    public void deleteImage(UUID eventId, String imageType) {
        Event event = eventRepository.findById(eventId)
            .orElseThrow(() -> new EventNotFoundException(eventId));
            
        String publicId = getPublicIdFromMetadata(event, imageType);
        
        if (publicId != null) {
            try {
                cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
                removeFromMetadata(event, imageType);
                eventRepository.save(event);
                log.info("Deleted image {} for event {}", imageType, eventId);
            } catch (IOException e) {
                log.error("Error deleting image from Cloudinary", e);
                throw new ImageDeletionException("Failed to delete image", e);
            }
        }
    }
    
    // Private Helpers (Validation, Metadata Building, Transformations) omitted for brevity but included in full impl
    private void validateImage(MultipartFile file) {
        if (file.isEmpty()) throw new InvalidImageException("File is empty");
        if (file.getSize() > MAX_FILE_SIZE) throw new InvalidImageException(String.format("File too large. Max: %d MB", MAX_FILE_SIZE / (1024 * 1024)));
        if (!ALLOWED_TYPES.contains(file.getContentType())) throw new InvalidImageException("Invalid format. Allowed: JPEG, PNG, WebP");
    }

    private Map<String, Object> buildImageMetadata(Map uploadResult) {
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("url", uploadResult.get("secure_url"));
        metadata.put("provider", "cloudinary");
        metadata.put("publicId", uploadResult.get("public_id"));
        metadata.put("width", uploadResult.get("width"));
        metadata.put("height", uploadResult.get("height"));
        metadata.put("format", uploadResult.get("format"));
        metadata.put("bytes", uploadResult.get("bytes"));
        return metadata;
    }

    private Map<String, String> generateTransformations(String baseUrl) {
        Map<String, String> transformations = new HashMap<>();
        transformations.put("thumbnail", transformUrl(baseUrl, "c_thumb,w_400,h_400,g_auto"));
        transformations.put("mobile", transformUrl(baseUrl, "c_scale,w_800,q_auto"));
        transformations.put("webp", transformUrl(baseUrl, "f_webp,q_auto"));
        transformations.put("preview", transformUrl(baseUrl, "c_scale,w_100,q_auto,e_blur:300"));
        return transformations;
    }

    private String transformUrl(String baseUrl, String transformation) {
        return baseUrl.replace("/upload/", "/upload/" + transformation + "/");
    }

    @SuppressWarnings("unchecked")
    private void updateMetadataPath(Event event, String path, Object value) {
        Map<String, Object> metadata = event.getMetadata();
        if (metadata == null) { metadata = new HashMap<>(); event.setMetadata(metadata); }
        String[] parts = path.split("\\.");
        Map<String, Object> current = metadata;
        for (int i = 0; i < parts.length - 1; i++) {
            String part = parts[i];
            if (!current.containsKey(part)) current.put(part, new HashMap<String, Object>());
            current = (Map<String, Object>) current.get(part);
        }
        current.put(parts[parts.length - 1], value);
    }

    @SuppressWarnings("unchecked")
    private void addToGallery(Event event, Map<String, Object> imageData) {
        Map<String, Object> metadata = event.getMetadata();
        if (metadata == null) { metadata = new HashMap<>(); event.setMetadata(metadata); }
        metadata.putIfAbsent("media", new HashMap<String, Object>());
        Map<String, Object> media = (Map<String, Object>) metadata.get("media");
        media.putIfAbsent("images", new HashMap<String, Object>());
        Map<String, Object> images = (Map<String, Object>) media.get("images");
        images.putIfAbsent("gallery", new ArrayList<Map<String, Object>>());
        List<Map<String, Object>> gallery = (List<Map<String, Object>>) images.get("gallery");
        imageData.put("displayOrder", gallery.size());
        gallery.add(imageData);
    }

    @SuppressWarnings("unchecked")
    private String getPublicIdFromMetadata(Event event, String imageType) {
        Map<String, Object> metadata = event.getMetadata();
        if (metadata == null) return null;
        Map<String, Object> media = (Map<String, Object>) metadata.get("media");
        if (media == null) return null;
        Map<String, Object> images = (Map<String, Object>) media.get("images");
        if (images == null) return null;
        if ("banner".equals(imageType) || "thumbnail".equals(imageType)) {
            Map<String, Object> image = (Map<String, Object>) images.get(imageType);
            return image != null ? (String) image.get("publicId") : null;
        }
        return null;
    }

    @SuppressWarnings("unchecked")
    private void removeFromMetadata(Event event, String imageType) {
        Map<String, Object> metadata = event.getMetadata();
        if (metadata == null) return;
        Map<String, Object> media = (Map<String, Object>) metadata.get("media");
        if (media == null) return;
        Map<String, Object> images = (Map<String, Object>) media.get("images");
        if (images == null) return;
        images.remove(imageType);
    }
}
#### Capa de Presentación (REST)
Archivo: src/main/java/com/neonpass/presentation/rest/EventImageController.java
EndPoints para subir banner, thumbnail y galería.

Java

package com.neonpass.presentation.rest;

import com.neonpass.application.dto.ApiResponse;
import com.neonpass.application.dto.ImageUploadResponse;
import com.neonpass.application.service.EventImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/events/{eventId}/images")
@RequiredArgsConstructor
public class EventImageController {
    
    private final EventImageService imageService;
    
    @PostMapping(value = "/banner", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<ApiResponse<ImageUploadResponse>> uploadBanner(
        @PathVariable UUID eventId,
        @RequestParam("file") MultipartFile file
    ) {
        ImageUploadResponse response = imageService.uploadBanner(eventId, file);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @PostMapping(value = "/thumbnail", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<ApiResponse<ImageUploadResponse>> uploadThumbnail(
        @PathVariable UUID eventId,
        @RequestParam("file") MultipartFile file
    ) {
        ImageUploadResponse response = imageService.uploadThumbnail(eventId, file);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @PostMapping(value = "/gallery", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<ApiResponse<ImageUploadResponse>> addGalleryImage(
        @PathVariable UUID eventId,
        @RequestParam("file") MultipartFile file,
        @RequestParam(required = false) String altText
    ) {
        ImageUploadResponse response = imageService.addGalleryImage(eventId, file, altText);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @DeleteMapping("/{imageType}")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<Void> deleteImage(
        @PathVariable UUID eventId,
        @PathVariable String imageType
    ) {
        imageService.deleteImage(eventId, imageType);
        return ResponseEntity.noContent().build();
    }
}