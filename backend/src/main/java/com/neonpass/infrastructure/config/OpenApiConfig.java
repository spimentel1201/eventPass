package com.neonpass.infrastructure.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.License;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.context.annotation.Configuration;

/**
 * Configuración de OpenAPI/Swagger con seguridad JWT.
 */
@Configuration
@OpenAPIDefinition(info = @Info(title = "NeonPass API", version = "1.0.0", description = "API REST para gestión de eventos y tickets - Sistema SaaS de ticketing", contact = @Contact(name = "NeonPass Team", email = "support@neonpass.com"), license = @License(name = "MIT License", url = "https://opensource.org/licenses/MIT")), servers = {
        @Server(url = "http://localhost:8080", description = "Development Server")
})
@SecurityScheme(name = "bearerAuth", description = "JWT Bearer Token Authentication. Login first at /api/v1/auth/login and use the accessToken here.", scheme = "bearer", type = SecuritySchemeType.HTTP, bearerFormat = "JWT", in = SecuritySchemeIn.HEADER)
public class OpenApiConfig {
}
