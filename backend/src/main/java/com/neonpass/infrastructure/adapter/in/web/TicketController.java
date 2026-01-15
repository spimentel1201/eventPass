package com.neonpass.infrastructure.adapter.in.web;

import com.neonpass.domain.port.in.ValidateTicketUseCase;
import com.neonpass.infrastructure.adapter.in.web.dto.request.TicketValidationRequest;
import com.neonpass.infrastructure.adapter.in.web.dto.response.TicketValidationResponse;
import com.neonpass.infrastructure.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Controlador REST para validación de tickets.
 */
@RestController
@RequestMapping("/api/v1/tickets")
@RequiredArgsConstructor
@Tag(name = "Tickets", description = "Validación de tickets en puerta")
@SecurityRequirement(name = "bearerAuth")
public class TicketController {

    private final ValidateTicketUseCase validateTicketUseCase;

    @PostMapping("/validate")
    @Operation(summary = "Validar ticket", description = "Escanea y valida un QR de ticket")
    public ResponseEntity<ApiResponse<TicketValidationResponse>> validateTicket(
            @Valid @RequestBody TicketValidationRequest request,
            @AuthenticationPrincipal UUID staffId) {

        var command = new ValidateTicketUseCase.ValidateTicketCommand(
                request.getQrCodeHash(),
                staffId);

        var result = validateTicketUseCase.execute(command);

        var response = TicketValidationResponse.builder()
                .ticketId(result.ticketId())
                .eventId(result.eventId())
                .seatId(result.seatId())
                .status(result.status())
                .message(result.message())
                .build();

        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
