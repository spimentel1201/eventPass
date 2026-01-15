package com.neonpass.domain.port.in;

import com.neonpass.domain.model.User;

/**
 * Use Case para autenticación de usuarios.
 */
public interface AuthenticateUserUseCase {

    /**
     * Autentica un usuario con email y contraseña.
     *
     * @param command Credenciales del usuario
     * @return Resultado de autenticación con token JWT
     */
    AuthResult execute(AuthCommand command);

    /**
     * Comando con credenciales de autenticación.
     */
    record AuthCommand(
            String email,
            String password) {
    }

    /**
     * Resultado de autenticación exitosa.
     */
    record AuthResult(
            User user,
            String accessToken,
            String refreshToken,
            long expiresIn) {
    }
}
