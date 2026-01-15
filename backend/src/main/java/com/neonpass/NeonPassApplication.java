package com.neonpass;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Clase principal de la aplicación NeonPass API.
 * 
 * <p>NeonPass es una plataforma SaaS B2B2C de ticketing de alta concurrencia
 * que permite a organizadores gestionar eventos complejos con distribución
 * de asientos numerados, zonas generales y control de acceso.</p>
 * 
 * @author NeonPass Team
 * @version 1.0
 */
@SpringBootApplication
public class NeonPassApplication {

    /**
     * Punto de entrada de la aplicación.
     * 
     * @param args argumentos de línea de comandos
     */
    public static void main(String[] args) {
        SpringApplication.run(NeonPassApplication.class, args);
    }
}
