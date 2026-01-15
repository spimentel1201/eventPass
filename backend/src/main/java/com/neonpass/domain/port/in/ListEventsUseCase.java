package com.neonpass.domain.port.in;

import com.neonpass.domain.model.Event;

import java.util.List;

/**
 * Use Case para listar eventos publicados.
 */
public interface ListEventsUseCase {

    List<Event> execute();
}
