package com.neonpass.infrastructure.adapter.in.web;

import com.neonpass.domain.model.User;
import com.neonpass.domain.port.in.AuthenticateUserUseCase;
import com.neonpass.domain.port.in.CreateUserUseCase;
import com.neonpass.infrastructure.adapter.in.web.dto.request.LoginRequest;
import com.neonpass.infrastructure.adapter.in.web.dto.request.UserRegistrationRequest;
import com.neonpass.infrastructure.adapter.in.web.dto.response.LoginResponse;
import com.neonpass.infrastructure.adapter.in.web.dto.response.UserResponse;
import com.neonpass.infrastructure.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controlador REST para autenticación de usuarios.
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Autenticación", description = "Endpoints de registro y login")
public class AuthController {

    private final CreateUserUseCase createUserUseCase;
    private final AuthenticateUserUseCase authenticateUserUseCase;

    @PostMapping("/register")
    @Operation(summary = "Registrar nuevo usuario", description = "Crea una nueva cuenta de usuario")
    public ResponseEntity<ApiResponse<UserResponse>> register(
            @Valid @RequestBody UserRegistrationRequest request) {

        var command = new CreateUserUseCase.CreateUserCommand(
                request.getEmail(),
                request.getPassword(),
                request.getFullName());

        User user = createUserUseCase.execute(command);

        UserResponse response = UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .build();

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response));
    }

    @PostMapping("/login")
    @Operation(summary = "Iniciar sesión", description = "Autentica un usuario y retorna tokens JWT")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @Valid @RequestBody LoginRequest request) {

        var command = new AuthenticateUserUseCase.AuthCommand(
                request.getEmail(),
                request.getPassword());

        var authResult = authenticateUserUseCase.execute(command);

        UserResponse userResponse = UserResponse.builder()
                .id(authResult.user().getId())
                .email(authResult.user().getEmail())
                .fullName(authResult.user().getFullName())
                .role(authResult.user().getRole().name())
                .build();

        LoginResponse response = LoginResponse.builder()
                .user(userResponse)
                .accessToken(authResult.accessToken())
                .refreshToken(authResult.refreshToken())
                .tokenType("Bearer")
                .expiresIn(authResult.expiresIn())
                .build();

        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
