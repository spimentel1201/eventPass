package com.neonpass.application.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.neonpass.domain.exception.EventNotFoundException;
import com.neonpass.domain.exception.ImageDeletionException;
import com.neonpass.domain.exception.ImageUploadException;
import com.neonpass.domain.exception.InvalidImageException;
import com.neonpass.domain.model.Event;
import com.neonpass.domain.port.out.EventRepository;
import com.neonpass.infrastructure.adapter.in.web.dto.response.ImageUploadResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;

/**
 * Servicio para gestión de imágenes de eventos con Cloudinary.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EventImageService {

    private final Cloudinary cloudinary;
    private final EventRepository eventRepository;
    private final ObjectMapper objectMapper;

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final List<String> ALLOWED_TYPES = List.of(
            "image/jpeg",
            "image/png",
            "image/webp");

    @Transactional
    public ImageUploadResponse uploadBanner(UUID eventId, MultipartFile file) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException(eventId));

        validateImage(file);

        try {
            // Upload sin transformaciones - las aplicamos después via URL
            Map<String, Object> uploadParams = ObjectUtils.asMap(
                    "folder", String.format("neonpass/events/%s", eventId),
                    "public_id", "banner",
                    "overwrite", true,
                    "resource_type", "image");

            @SuppressWarnings("rawtypes")
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), uploadParams);
            Map<String, Object> bannerData = buildImageMetadata(uploadResult);

            String baseUrl = (String) uploadResult.get("secure_url");
            Map<String, String> transformations = generateTransformations(baseUrl);
            bannerData.put("transformations", transformations);

            // Actualizar metadata del evento
            updateEventImageMetadata(event, "banner", bannerData);
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
            // Upload sin transformaciones
            Map<String, Object> uploadParams = ObjectUtils.asMap(
                    "folder", String.format("neonpass/events/%s", eventId),
                    "public_id", "thumbnail",
                    "overwrite", true,
                    "resource_type", "image");

            @SuppressWarnings("rawtypes")
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), uploadParams);
            Map<String, Object> thumbnailData = buildImageMetadata(uploadResult);

            updateEventImageMetadata(event, "thumbnail", thumbnailData);
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
            // Upload sin transformaciones
            Map<String, Object> uploadParams = ObjectUtils.asMap(
                    "folder", String.format("neonpass/events/%s/gallery", eventId),
                    "public_id", imageId,
                    "resource_type", "image");

            @SuppressWarnings("rawtypes")
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

    // Private helpers
    private void validateImage(MultipartFile file) {
        if (file.isEmpty()) {
            throw new InvalidImageException("File is empty");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new InvalidImageException(
                    String.format("File too large. Max: %d MB", MAX_FILE_SIZE / (1024 * 1024)));
        }
        if (!ALLOWED_TYPES.contains(file.getContentType())) {
            throw new InvalidImageException("Invalid format. Allowed: JPEG, PNG, WebP");
        }
    }

    @SuppressWarnings("rawtypes")
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

    private Map<String, Object> parseMetadata(String metadataJson) {
        if (metadataJson == null || metadataJson.isBlank()) {
            return new HashMap<>();
        }
        try {
            return objectMapper.readValue(metadataJson, new TypeReference<>() {
            });
        } catch (JsonProcessingException e) {
            log.warn("Error parsing metadata JSON", e);
            return new HashMap<>();
        }
    }

    private String serializeMetadata(Map<String, Object> metadata) {
        try {
            return objectMapper.writeValueAsString(metadata);
        } catch (JsonProcessingException e) {
            log.error("Error serializing metadata", e);
            return "{}";
        }
    }

    @SuppressWarnings("unchecked")
    private void updateEventImageMetadata(Event event, String imageType, Map<String, Object> imageData) {
        Map<String, Object> metadata = parseMetadata(event.getMetadata());

        metadata.putIfAbsent("media", new HashMap<String, Object>());
        Map<String, Object> media = (Map<String, Object>) metadata.get("media");

        media.putIfAbsent("images", new HashMap<String, Object>());
        Map<String, Object> images = (Map<String, Object>) media.get("images");

        images.put(imageType, imageData);

        event.setMetadata(serializeMetadata(metadata));
    }

    @SuppressWarnings("unchecked")
    private void addToGallery(Event event, Map<String, Object> imageData) {
        Map<String, Object> metadata = parseMetadata(event.getMetadata());

        metadata.putIfAbsent("media", new HashMap<String, Object>());
        Map<String, Object> media = (Map<String, Object>) metadata.get("media");

        media.putIfAbsent("images", new HashMap<String, Object>());
        Map<String, Object> images = (Map<String, Object>) media.get("images");

        images.putIfAbsent("gallery", new ArrayList<Map<String, Object>>());
        @SuppressWarnings("rawtypes")
        List<Map<String, Object>> gallery = (List) images.get("gallery");

        imageData.put("displayOrder", gallery.size());
        gallery.add(imageData);

        event.setMetadata(serializeMetadata(metadata));
    }

    @SuppressWarnings("unchecked")
    private String getPublicIdFromMetadata(Event event, String imageType) {
        Map<String, Object> metadata = parseMetadata(event.getMetadata());

        Map<String, Object> media = (Map<String, Object>) metadata.get("media");
        if (media == null)
            return null;

        Map<String, Object> images = (Map<String, Object>) media.get("images");
        if (images == null)
            return null;

        if ("banner".equals(imageType) || "thumbnail".equals(imageType)) {
            Map<String, Object> image = (Map<String, Object>) images.get(imageType);
            return image != null ? (String) image.get("publicId") : null;
        }
        return null;
    }

    @SuppressWarnings("unchecked")
    private void removeFromMetadata(Event event, String imageType) {
        Map<String, Object> metadata = parseMetadata(event.getMetadata());

        Map<String, Object> media = (Map<String, Object>) metadata.get("media");
        if (media == null)
            return;

        Map<String, Object> images = (Map<String, Object>) media.get("images");
        if (images == null)
            return;

        images.remove(imageType);

        event.setMetadata(serializeMetadata(metadata));
    }
}
