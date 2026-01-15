package com.neonpass.domain.port.in;

import com.neonpass.domain.model.Event;
import com.neonpass.domain.model.enums.EventStatus;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Use Case para creación de eventos.
 */
public interface CreateEventUseCase {

    Event execute(CreateEventCommand command);

    record CreateEventCommand(
            UUID organizationId,
            UUID venueId,
            String title,
            String description,
            LocalDateTime startTime,
            LocalDateTime endTime,
            EventStatus status) {
    }
}
