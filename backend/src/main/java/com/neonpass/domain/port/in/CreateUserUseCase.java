package com.neonpass.domain.port.in;

import com.neonpass.domain.model.User;

/**
 * Use Case para registro de usuarios.
 */
public interface CreateUserUseCase {

    /**
     * Registra un nuevo usuario en el sistema.
     *
     * @param command Datos del usuario a crear
     * @return Usuario creado
     */
    User execute(CreateUserCommand command);

    /**
     * Comando con los datos necesarios para crear un usuario.
     */
    record CreateUserCommand(
            String email,
            String password,
            String fullName) {
    }
}
