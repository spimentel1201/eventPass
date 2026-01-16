package com.neonpass.domain.port.in;

import com.neonpass.domain.model.Venue;

import java.util.UUID;

/**
 * Use Case para crear venue.
 */
public interface CreateVenueUseCase {

    Venue execute(CreateVenueCommand command);

    record CreateVenueCommand(
            UUID organizationId,
            String name,
            String address,
            String timezone) {
    }
}
