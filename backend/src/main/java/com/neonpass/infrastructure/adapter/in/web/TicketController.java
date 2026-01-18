package com.neonpass.infrastructure.adapter.in.web;

import com.neonpass.application.service.TicketPdfService;
import com.neonpass.domain.model.Event;
import com.neonpass.domain.model.Order;
import com.neonpass.domain.model.Seat;
import com.neonpass.domain.model.Section;
import com.neonpass.domain.model.Ticket;
import com.neonpass.domain.model.TicketTier;
import com.neonpass.domain.model.Venue;
import com.neonpass.domain.port.in.ValidateTicketUseCase;
import com.neonpass.domain.port.out.EventRepository;
import com.neonpass.domain.port.out.OrderRepository;
import com.neonpass.domain.port.out.SeatRepository;
import com.neonpass.domain.port.out.SectionRepository;
import com.neonpass.domain.port.out.TicketRepository;
import com.neonpass.domain.port.out.TicketTierRepository;
import com.neonpass.domain.port.out.VenueRepository;
import com.neonpass.infrastructure.adapter.in.web.dto.request.TicketValidationRequest;
import com.neonpass.infrastructure.adapter.in.web.dto.response.MyTicketResponse;
import com.neonpass.infrastructure.adapter.in.web.dto.response.TicketValidationResponse;
import com.neonpass.infrastructure.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Controlador REST para gestión y validación de tickets.
 */
@RestController
@RequestMapping("/api/v1/tickets")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Tickets", description = "Gestión y validación de tickets")
@SecurityRequirement(name = "bearerAuth")
public class TicketController {

        private final ValidateTicketUseCase validateTicketUseCase;
        private final TicketPdfService ticketPdfService;
        private final OrderRepository orderRepository;
        private final TicketRepository ticketRepository;
        private final EventRepository eventRepository;
        private final VenueRepository venueRepository;
        private final SeatRepository seatRepository;
        private final SectionRepository sectionRepository;
        private final TicketTierRepository ticketTierRepository;

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

        @GetMapping("/my-tickets")
        @Operation(summary = "Mis tickets", description = "Obtiene los tickets del usuario autenticado")
        public ResponseEntity<ApiResponse<List<MyTicketResponse>>> getMyTickets(
                        @AuthenticationPrincipal UUID userId) {

                log.info("Obteniendo tickets para usuario: {}", userId);

                // Get user's orders
                List<Order> orders = orderRepository.findByUserId(userId);

                List<MyTicketResponse> myTickets = new ArrayList<>();

                for (Order order : orders) {
                        List<Ticket> tickets = ticketRepository.findByOrderId(order.getId());

                        for (Ticket ticket : tickets) {
                                MyTicketResponse.MyTicketResponseBuilder responseBuilder = MyTicketResponse.builder()
                                                .id(ticket.getId())
                                                .eventId(ticket.getEventId())
                                                .price(ticket.getPriceSnapshot())
                                                .currency(ticket.getCurrencySnapshot())
                                                .qrCodeHash(ticket.getQrCodeHash())
                                                .status(ticket.getStatus())
                                                .scannedAt(ticket.getScannedAt())
                                                .purchasedAt(ticket.getCreatedAt());

                                // Get event info
                                eventRepository.findById(ticket.getEventId()).ifPresent(event -> {
                                        responseBuilder.eventTitle(event.getTitle());
                                        responseBuilder.eventDate(event.getStartTime());

                                        // Get venue info
                                        if (event.getVenueId() != null) {
                                                venueRepository.findById(event.getVenueId()).ifPresent(venue -> {
                                                        responseBuilder.venueName(venue.getName());
                                                        responseBuilder.venueAddress(venue.getAddress());
                                                });
                                        }
                                });

                                // Get seat info
                                if (ticket.getSeatId() != null) {
                                        seatRepository.findById(ticket.getSeatId()).ifPresent(seat -> {
                                                responseBuilder.row(seat.getRowLabel());
                                                responseBuilder.seatNumber(seat.getNumberLabel());

                                                // Get section info
                                                if (seat.getSectionId() != null) {
                                                        sectionRepository.findById(seat.getSectionId())
                                                                        .ifPresent(section -> responseBuilder
                                                                                        .sectionName(section
                                                                                                        .getName()));
                                                }
                                        });
                                } else {
                                        responseBuilder.sectionName("General Admission");
                                }

                                // Get tier info
                                if (ticket.getTicketTierId() != null) {
                                        ticketTierRepository.findById(ticket.getTicketTierId())
                                                        .ifPresent(tier -> responseBuilder.tierName(tier.getName()));
                                }

                                myTickets.add(responseBuilder.build());
                        }
                }

                log.info("Retornando {} tickets para usuario {}", myTickets.size(), userId);
                return ResponseEntity.ok(ApiResponse.success(myTickets));
        }

        @GetMapping("/{ticketId}")
        @Operation(summary = "Obtener ticket", description = "Obtiene un ticket específico por ID")
        public ResponseEntity<ApiResponse<MyTicketResponse>> getTicket(
                        @PathVariable UUID ticketId,
                        @AuthenticationPrincipal UUID userId) {

                log.info("Obteniendo ticket {} para usuario {}", ticketId, userId);

                Ticket ticket = ticketRepository.findById(ticketId)
                                .orElseThrow(() -> new RuntimeException("Ticket not found"));

                // Verify ownership through order
                Order order = orderRepository.findById(ticket.getOrderId())
                                .orElseThrow(() -> new RuntimeException("Order not found"));

                if (!order.getUserId().equals(userId)) {
                        throw new RuntimeException("Access denied");
                }

                MyTicketResponse.MyTicketResponseBuilder responseBuilder = MyTicketResponse.builder()
                                .id(ticket.getId())
                                .eventId(ticket.getEventId())
                                .price(ticket.getPriceSnapshot())
                                .currency(ticket.getCurrencySnapshot())
                                .qrCodeHash(ticket.getQrCodeHash())
                                .status(ticket.getStatus())
                                .scannedAt(ticket.getScannedAt())
                                .purchasedAt(ticket.getCreatedAt());

                // Get event info
                eventRepository.findById(ticket.getEventId()).ifPresent(event -> {
                        responseBuilder.eventTitle(event.getTitle());
                        responseBuilder.eventDate(event.getStartTime());

                        if (event.getVenueId() != null) {
                                venueRepository.findById(event.getVenueId()).ifPresent(venue -> {
                                        responseBuilder.venueName(venue.getName());
                                        responseBuilder.venueAddress(venue.getAddress());
                                });
                        }
                });

                // Get seat info
                if (ticket.getSeatId() != null) {
                        seatRepository.findById(ticket.getSeatId()).ifPresent(seat -> {
                                responseBuilder.row(seat.getRowLabel());
                                responseBuilder.seatNumber(seat.getNumberLabel());

                                if (seat.getSectionId() != null) {
                                        sectionRepository.findById(seat.getSectionId())
                                                        .ifPresent(section -> responseBuilder
                                                                        .sectionName(section.getName()));
                                }
                        });
                } else {
                        responseBuilder.sectionName("General Admission");
                }

                // Get tier info
                if (ticket.getTicketTierId() != null) {
                        ticketTierRepository.findById(ticket.getTicketTierId())
                                        .ifPresent(tier -> responseBuilder.tierName(tier.getName()));
                }

                return ResponseEntity.ok(ApiResponse.success(responseBuilder.build()));
        }

        @GetMapping("/{ticketId}/download")
        @Operation(summary = "Descargar ticket PDF", description = "Descarga el ticket en formato PDF con código QR")
        public ResponseEntity<byte[]> downloadTicketPdf(
                        @PathVariable UUID ticketId,
                        @AuthenticationPrincipal UUID userId) {

                log.info("Descargando PDF para ticket {} por usuario {}", ticketId, userId);

                // Verify ticket exists
                Ticket ticket = ticketRepository.findById(ticketId)
                                .orElseThrow(() -> new RuntimeException("Ticket not found"));

                // Verify ownership through order
                Order order = orderRepository.findById(ticket.getOrderId())
                                .orElseThrow(() -> new RuntimeException("Order not found"));

                if (!order.getUserId().equals(userId)) {
                        throw new RuntimeException("Access denied");
                }

                // Generate PDF
                byte[] pdfBytes = ticketPdfService.generateTicketPdf(ticketId);

                // Get event name for filename
                String filename = "ticket_" + ticketId.toString().substring(0, 8) + ".pdf";
                eventRepository.findById(ticket.getEventId()).ifPresent(event -> {
                        // Use event title for better filename
                });

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_PDF);
                headers.setContentDispositionFormData("attachment", filename);
                headers.setContentLength(pdfBytes.length);

                log.info("PDF generado exitosamente: {} bytes", pdfBytes.length);
                return ResponseEntity.ok().headers(headers).body(pdfBytes);
        }
}
