package com.neonpass.domain.port.in;

import com.neonpass.domain.model.Event;

import java.util.UUID;

/**
 * Use Case para obtener un evento por ID.
 */
public interface GetEventUseCase {

    Event execute(UUID eventId);
}
