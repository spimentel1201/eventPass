package com.neonpass.infrastructure.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * Configuración de JPA Auditing para campos @CreatedDate y @LastModifiedDate.
 */
@Configuration
@EnableJpaAuditing
public class JpaConfig {
}
