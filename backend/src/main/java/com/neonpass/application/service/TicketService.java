package com.neonpass.application.service;

import com.neonpass.domain.model.Ticket;
import com.neonpass.domain.model.enums.TicketStatus;
import com.neonpass.domain.port.out.TicketRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.UUID;

/**
 * Servicio para generación de tickets con QR hash firmado.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TicketService {

    private final TicketRepository ticketRepository;

    @Value("${ticket.signing.secret}")
    private String signingSecret;

    private static final String HMAC_ALGO = "HmacSHA256";

    /**
     * Crea un ticket con QR hash firmado.
     */
    public Ticket createTicket(
            UUID orderId,
            UUID eventId,
            UUID ticketTierId,
            UUID seatId,
            BigDecimal price,
            String currency) {

        UUID ticketId = UUID.randomUUID();

        // Generar QR hash firmado (anti-fraude)
        String qrPayload = buildQrPayload(ticketId, eventId, seatId);
        String qrCodeHash = signPayload(qrPayload);

        Ticket ticket = Ticket.builder()
                .id(ticketId)
                .orderId(orderId)
                .eventId(eventId)
                .ticketTierId(ticketTierId)
                .seatId(seatId)
                .priceSnapshot(price)
                .currencySnapshot(currency)
                .qrCodeHash(qrCodeHash)
                .status(TicketStatus.VALID)
                .createdAt(LocalDateTime.now())
                .build();

        Ticket saved = ticketRepository.save(ticket);
        log.info("Ticket creado: {} con QR hash: {}", saved.getId(), qrCodeHash.substring(0, 20) + "...");

        return saved;
    }

    /**
     * Construye el payload para el QR.
     */
    private String buildQrPayload(UUID ticketId, UUID eventId, UUID seatId) {
        return String.format("%s:%s:%s:%d",
                ticketId,
                eventId,
                seatId != null ? seatId : "GA",
                System.currentTimeMillis());
    }

    /**
     * Firma el payload con HMAC-SHA256.
     */
    private String signPayload(String payload) {
        try {
            Mac mac = Mac.getInstance(HMAC_ALGO);
            SecretKeySpec secretKey = new SecretKeySpec(
                    signingSecret.getBytes(StandardCharsets.UTF_8),
                    HMAC_ALGO);
            mac.init(secretKey);
            byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));

            // Payload + signature
            String signature = Base64.getUrlEncoder().encodeToString(hash);
            return Base64.getUrlEncoder().encodeToString(payload.getBytes()) + "." + signature;
        } catch (Exception e) {
            log.error("Error firmando payload", e);
            throw new RuntimeException("Error generando QR hash", e);
        }
    }
}
