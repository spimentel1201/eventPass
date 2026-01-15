package com.neonpass.domain.port.in;

import com.neonpass.domain.model.Organization;

import java.util.UUID;

/**
 * Use Case para crear organización.
 */
public interface CreateOrganizationUseCase {

    Organization execute(CreateOrganizationCommand command);

    record CreateOrganizationCommand(
            UUID ownerId,
            String name,
            String slug) {
    }
}
