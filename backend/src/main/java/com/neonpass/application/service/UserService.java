package com.neonpass.application.service;

import com.neonpass.domain.exception.EmailAlreadyExistsException;
import com.neonpass.domain.exception.InvalidCredentialsException;
import com.neonpass.domain.model.User;
import com.neonpass.domain.model.enums.UserRole;
import com.neonpass.domain.port.in.AuthenticateUserUseCase;
import com.neonpass.domain.port.in.CreateUserUseCase;
import com.neonpass.domain.port.out.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Servicio de aplicación para gestión de usuarios y autenticación.
 * 
 * <p>
 * Implementa los Use Cases de registro y login.
 * </p>
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserService implements CreateUserUseCase, AuthenticateUserUseCase {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // Temporal: en producción usar JWT real
    private static final long TOKEN_EXPIRATION_MS = 86400000L; // 24 horas

    @Override
    public User execute(CreateUserCommand command) {
        log.info("Registrando nuevo usuario: {}", command.email());

        // Verificar si el email ya existe
        if (userRepository.existsByEmail(command.email())) {
            throw new EmailAlreadyExistsException(command.email());
        }

        // Crear usuario con contraseña hasheada
        User user = User.builder()
                .id(UUID.randomUUID())
                .email(command.email())
                .passwordHash(passwordEncoder.encode(command.password()))
                .fullName(command.fullName())
                .role(UserRole.USER)
                .createdAt(LocalDateTime.now())
                .deleted(false)
                .build();

        User savedUser = userRepository.save(user);
        log.info("Usuario registrado exitosamente: {}", savedUser.getId());

        return savedUser;
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResult execute(AuthCommand command) {
        log.info("Intentando autenticar usuario: {}", command.email());

        // Buscar usuario por email
        User user = userRepository.findByEmail(command.email())
                .orElseThrow(InvalidCredentialsException::new);

        // Verificar contraseña
        if (!passwordEncoder.matches(command.password(), user.getPasswordHash())) {
            log.warn("Contraseña incorrecta para usuario: {}", command.email());
            throw new InvalidCredentialsException();
        }

        // TODO: Implementar JWT real en fase de seguridad
        String accessToken = generateTemporaryToken(user);
        String refreshToken = generateTemporaryToken(user);

        log.info("Usuario autenticado exitosamente: {}", user.getId());

        return new AuthResult(
                user,
                accessToken,
                refreshToken,
                TOKEN_EXPIRATION_MS);
    }

    /**
     * Genera un token temporal (placeholder para JWT).
     * TODO: Implementar JWT real con io.jsonwebtoken
     */
    private String generateTemporaryToken(User user) {
        // Placeholder - será reemplazado por JWT real
        return "temp_token_" + user.getId() + "_" + System.currentTimeMillis();
    }
}
