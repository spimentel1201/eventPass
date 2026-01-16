package com.neonpass.application.service;

import com.neonpass.domain.exception.TicketAlreadyUsedException;
import com.neonpass.domain.model.Ticket;
import com.neonpass.domain.model.TicketValidation;
import com.neonpass.domain.model.enums.TicketStatus;
import com.neonpass.domain.model.enums.ValidationStatus;
import com.neonpass.domain.port.in.ValidateTicketUseCase;
import com.neonpass.domain.port.out.TicketRepository;
import com.neonpass.domain.port.out.TicketValidationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.UUID;

/**
 * Servicio de validación de tickets en puerta.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class TicketValidationService implements ValidateTicketUseCase {

    private final TicketRepository ticketRepository;
    private final TicketValidationRepository validationRepository;

    @Value("${ticket.signing.secret}")
    private String signingSecret;

    private static final String HMAC_ALGO = "HmacSHA256";

    @Override
    public ValidationResult execute(ValidateTicketCommand command) {
        log.info("Validando ticket con QR hash");

        // 1. Verificar firma del QR
        String[] parts = command.qrCodeHash().split("\\.");
        if (parts.length != 2) {
            log.warn("QR hash formato inválido");
            return failedResult("QR_INVALID_FORMAT", "Formato de QR inválido");
        }

        String payloadBase64 = parts[0];
        String signature = parts[1];

        // Decodificar payload
        String payload;
        try {
            payload = new String(Base64.getUrlDecoder().decode(payloadBase64));
        } catch (Exception e) {
            log.warn("Error decodificando payload");
            return failedResult("QR_DECODE_ERROR", "Error decodificando QR");
        }

        // Verificar firma
        if (!verifySignature(payloadBase64, signature)) {
            log.warn("Firma inválida");
            return failedResult("SIGNATURE_INVALID", "Firma de ticket inválida");
        }

        // Extraer ticketId del payload (formato: ticketId:eventId:seatId:timestamp)
        String[] payloadParts = payload.split(":");
        if (payloadParts.length < 2) {
            return failedResult("PAYLOAD_INVALID", "Payload de ticket inválido");
        }

        UUID ticketId;
        try {
            ticketId = UUID.fromString(payloadParts[0]);
        } catch (Exception e) {
            return failedResult("TICKET_ID_INVALID", "ID de ticket inválido");
        }

        // 2. Buscar ticket en BD
        Ticket ticket = ticketRepository.findById(ticketId).orElse(null);
        if (ticket == null) {
            return failedResult("TICKET_NOT_FOUND", "Ticket no encontrado");
        }

        // 3. Verificar estado
        if (ticket.getStatus() == TicketStatus.USED) {
            log.warn("Ticket ya usado: {}", ticketId);
            throw new TicketAlreadyUsedException(ticketId);
        }

        if (ticket.getStatus() != TicketStatus.VALID) {
            return failedResult("TICKET_INVALID_STATUS",
                    "El ticket tiene estado: " + ticket.getStatus());
        }

        // 4. Marcar como usado
        ticket.setStatus(TicketStatus.USED);
        ticket.setScannedAt(LocalDateTime.now());
        ticketRepository.save(ticket);

        // 5. Registrar validación
        TicketValidation validation = TicketValidation.builder()
                .id(UUID.randomUUID())
                .ticketId(ticketId)
                .validatedAt(LocalDateTime.now())
                .status(ValidationStatus.SUCCESS)
                .validatedBy(command.validatedBy())
                .build();
        validationRepository.save(validation);

        log.info("Ticket validado exitosamente: {}", ticketId);

        return new ValidationResult(
                ticketId,
                ticket.getEventId(),
                ticket.getSeatId(),
                ValidationStatus.SUCCESS,
                "Ticket válido - Bienvenido!");
    }

    private boolean verifySignature(String payloadBase64, String signature) {
        try {
            Mac mac = Mac.getInstance(HMAC_ALGO);
            SecretKeySpec secretKey = new SecretKeySpec(
                    signingSecret.getBytes(StandardCharsets.UTF_8),
                    HMAC_ALGO);
            mac.init(secretKey);

            // Decodificar payload antes de firmar
            String payload = new String(Base64.getUrlDecoder().decode(payloadBase64));
            byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            String expectedSignature = Base64.getUrlEncoder().encodeToString(hash);

            return expectedSignature.equals(signature);
        } catch (Exception e) {
            log.error("Error verificando firma", e);
            return false;
        }
    }

    private ValidationResult failedResult(String code, String message) {
        return new ValidationResult(null, null, null, ValidationStatus.REJECTED, message);
    }
}
