package com.neonpass.application.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.itextpdf.io.image.ImageData;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.HorizontalAlignment;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.neonpass.domain.model.Event;
import com.neonpass.domain.model.Seat;
import com.neonpass.domain.model.Section;
import com.neonpass.domain.model.Ticket;
import com.neonpass.domain.model.TicketTier;
import com.neonpass.domain.model.Venue;
import com.neonpass.domain.port.out.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

/**
 * Servicio para generación de tickets en formato PDF con código QR.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TicketPdfService {

    private final TicketRepository ticketRepository;
    private final EventRepository eventRepository;
    private final VenueRepository venueRepository;
    private final SeatRepository seatRepository;
    private final SectionRepository sectionRepository;
    private final TicketTierRepository ticketTierRepository;

    private static final int QR_SIZE = 200;
    private static final DeviceRgb NEON_PRIMARY = new DeviceRgb(139, 92, 246); // Purple
    private static final DeviceRgb NEON_DARK = new DeviceRgb(30, 30, 46);

    /**
     * Genera un PDF de ticket con código QR.
     *
     * @param ticketId ID del ticket
     * @return bytes del PDF generado
     */
    public byte[] generateTicketPdf(UUID ticketId) {
        log.info("Generando PDF para ticket: {}", ticketId);

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found: " + ticketId));

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf, PageSize.A5);
            document.setMargins(20, 20, 20, 20);

            // Get related entities
            Event event = eventRepository.findById(ticket.getEventId()).orElse(null);
            Venue venue = event != null && event.getVenueId() != null
                    ? venueRepository.findById(event.getVenueId()).orElse(null)
                    : null;
            Seat seat = ticket.getSeatId() != null
                    ? seatRepository.findById(ticket.getSeatId()).orElse(null)
                    : null;
            Section section = seat != null && seat.getSectionId() != null
                    ? sectionRepository.findById(seat.getSectionId()).orElse(null)
                    : null;
            TicketTier tier = ticket.getTicketTierId() != null
                    ? ticketTierRepository.findById(ticket.getTicketTierId()).orElse(null)
                    : null;

            // Header - NeonPass Logo/Title
            Paragraph header = new Paragraph("NEONPASS")
                    .setFontSize(24)
                    .setBold()
                    .setFontColor(NEON_PRIMARY)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(5);
            document.add(header);

            Paragraph subtitle = new Paragraph("ENTRADA ELECTRÓNICA")
                    .setFontSize(10)
                    .setFontColor(ColorConstants.GRAY)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(20);
            document.add(subtitle);

            // Event Title
            String eventTitle = event != null ? event.getTitle() : "Evento";
            Paragraph eventName = new Paragraph(eventTitle)
                    .setFontSize(18)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(15);
            document.add(eventName);

            // QR Code
            byte[] qrCodeBytes = generateQrCode(ticket.getQrCodeHash());
            ImageData qrImageData = ImageDataFactory.create(qrCodeBytes);
            Image qrImage = new Image(qrImageData)
                    .setWidth(QR_SIZE)
                    .setHeight(QR_SIZE)
                    .setHorizontalAlignment(HorizontalAlignment.CENTER);
            document.add(qrImage);

            // Scan instruction
            Paragraph scanNote = new Paragraph("Presenta este código QR en la entrada")
                    .setFontSize(9)
                    .setFontColor(ColorConstants.GRAY)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginTop(5)
                    .setMarginBottom(20);
            document.add(scanNote);

            // Event Details Table
            Table detailsTable = new Table(UnitValue.createPercentArray(new float[] { 1, 1 }))
                    .useAllAvailableWidth()
                    .setMarginBottom(15);

            // Date & Time
            if (event != null && event.getStartTime() != null) {
                DateTimeFormatter dateFormat = DateTimeFormatter.ofPattern("EEEE, dd MMMM yyyy");
                DateTimeFormatter timeFormat = DateTimeFormatter.ofPattern("HH:mm");

                addDetailRow(detailsTable, "FECHA", event.getStartTime().format(dateFormat));
                addDetailRow(detailsTable, "HORA", event.getStartTime().format(timeFormat) + " hrs");
            }

            // Venue
            if (venue != null) {
                addDetailRow(detailsTable, "LUGAR", venue.getName());
                if (venue.getAddress() != null) {
                    addDetailRow(detailsTable, "DIRECCIÓN", venue.getAddress());
                }
            }

            document.add(detailsTable);

            // Seat Info Table
            Table seatTable = new Table(UnitValue.createPercentArray(new float[] { 1, 1, 1 }))
                    .useAllAvailableWidth()
                    .setMarginBottom(15);

            // Section
            Cell sectionCell = createInfoCell("SECCIÓN",
                    section != null ? section.getName() : (tier != null ? tier.getName() : "General"));
            seatTable.addCell(sectionCell);

            // Row
            Cell rowCell = createInfoCell("FILA",
                    seat != null ? seat.getRowLabel() : "-");
            seatTable.addCell(rowCell);

            // Seat
            Cell seatCell = createInfoCell("ASIENTO",
                    seat != null ? seat.getNumberLabel() : "GA");
            seatTable.addCell(seatCell);

            document.add(seatTable);

            // Price
            Paragraph priceInfo = new Paragraph(
                    String.format("%s %s", ticket.getCurrencySnapshot(), ticket.getPriceSnapshot()))
                    .setFontSize(16)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(15);
            document.add(priceInfo);

            // Ticket ID
            Paragraph ticketIdPara = new Paragraph("Ticket ID: " + ticket.getId().toString().substring(0, 8))
                    .setFontSize(8)
                    .setFontColor(ColorConstants.GRAY)
                    .setTextAlignment(TextAlignment.CENTER);
            document.add(ticketIdPara);

            // Footer
            Paragraph footer = new Paragraph("Este ticket es personal e intransferible. No se permiten reembolsos.")
                    .setFontSize(7)
                    .setFontColor(ColorConstants.GRAY)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginTop(20);
            document.add(footer);

            document.close();

            log.info("PDF generado exitosamente para ticket: {}", ticketId);
            return baos.toByteArray();

        } catch (IOException e) {
            log.error("Error generando PDF para ticket: {}", ticketId, e);
            throw new RuntimeException("Error generando PDF", e);
        }
    }

    /**
     * Genera una imagen QR a partir del hash del ticket.
     */
    private byte[] generateQrCode(String content) {
        try {
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(content, BarcodeFormat.QR_CODE, QR_SIZE, QR_SIZE);

            BufferedImage bufferedImage = MatrixToImageWriter.toBufferedImage(bitMatrix);

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(bufferedImage, "PNG", baos);

            return baos.toByteArray();
        } catch (WriterException | IOException e) {
            log.error("Error generando código QR", e);
            throw new RuntimeException("Error generando QR", e);
        }
    }

    /**
     * Agrega una fila de detalle a la tabla.
     */
    private void addDetailRow(Table table, String label, String value) {
        Cell labelCell = new Cell()
                .add(new Paragraph(label).setFontSize(8).setFontColor(ColorConstants.GRAY))
                .setBorder(Border.NO_BORDER)
                .setPadding(3);

        Cell valueCell = new Cell()
                .add(new Paragraph(value).setFontSize(10).setBold())
                .setBorder(Border.NO_BORDER)
                .setPadding(3);

        table.addCell(labelCell);
        table.addCell(valueCell);
    }

    /**
     * Crea una celda de información centrada.
     */
    private Cell createInfoCell(String label, String value) {
        Paragraph labelPara = new Paragraph(label)
                .setFontSize(8)
                .setFontColor(ColorConstants.GRAY)
                .setTextAlignment(TextAlignment.CENTER);

        Paragraph valuePara = new Paragraph(value)
                .setFontSize(14)
                .setBold()
                .setTextAlignment(TextAlignment.CENTER);

        return new Cell()
                .add(labelPara)
                .add(valuePara)
                .setBorder(Border.NO_BORDER)
                .setTextAlignment(TextAlignment.CENTER)
                .setPadding(10);
    }
}
