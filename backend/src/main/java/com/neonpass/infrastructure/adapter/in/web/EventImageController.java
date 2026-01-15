package com.neonpass.infrastructure.adapter.in.web;

import com.neonpass.application.service.EventImageService;
import com.neonpass.infrastructure.adapter.in.web.dto.response.ImageUploadResponse;
import com.neonpass.infrastructure.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

/**
 * Controlador REST para gestión de imágenes de eventos.
 */
@RestController
@RequestMapping("/api/v1/events/{eventId}/images")
@RequiredArgsConstructor
@Tag(name = "Event Images", description = "Gestión de imágenes de eventos")
@SecurityRequirement(name = "bearerAuth")
public class EventImageController {

    private final EventImageService imageService;

    @PostMapping(value = "/banner", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Subir banner", description = "Sube imagen de banner para el evento")
    public ResponseEntity<ApiResponse<ImageUploadResponse>> uploadBanner(
            @PathVariable UUID eventId,
            @RequestParam("file") MultipartFile file) {

        ImageUploadResponse response = imageService.uploadBanner(eventId, file);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping(value = "/thumbnail", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Subir thumbnail", description = "Sube imagen thumbnail para el evento")
    public ResponseEntity<ApiResponse<ImageUploadResponse>> uploadThumbnail(
            @PathVariable UUID eventId,
            @RequestParam("file") MultipartFile file) {

        ImageUploadResponse response = imageService.uploadThumbnail(eventId, file);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping(value = "/gallery", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Añadir a galería", description = "Añade imagen a la galería del evento")
    public ResponseEntity<ApiResponse<ImageUploadResponse>> addGalleryImage(
            @PathVariable UUID eventId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) String altText) {

        ImageUploadResponse response = imageService.addGalleryImage(eventId, file, altText);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/{imageType}")
    @Operation(summary = "Eliminar imagen", description = "Elimina imagen del evento (banner, thumbnail)")
    public ResponseEntity<Void> deleteImage(
            @PathVariable UUID eventId,
            @PathVariable String imageType) {

        imageService.deleteImage(eventId, imageType);
        return ResponseEntity.noContent().build();
    }
}
