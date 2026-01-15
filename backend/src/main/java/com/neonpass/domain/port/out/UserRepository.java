package com.neonpass.domain.port.out;

import com.neonpass.domain.model.User;

import java.util.Optional;
import java.util.UUID;

/**
 * Puerto de salida para operaciones de persistencia de usuarios.
 */
public interface UserRepository {

    Optional<User> findById(UUID id);

    Optional<User> findByEmail(String email);

    User save(User user);

    boolean existsByEmail(String email);
}
