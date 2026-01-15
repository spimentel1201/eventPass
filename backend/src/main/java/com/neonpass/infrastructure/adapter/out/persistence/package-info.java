/**
 * Capa de Infraestructura - Adaptadores de Persistencia.
 * 
 * <p>
 * Este paquete contiene los repositorios JPA y las entidades {@code @Entity}
 * que implementan los puertos de salida del dominio.
 * </p>
 * 
 * <p>
 * <strong>Importante:</strong> Las entidades JPA nunca deben entrar en la capa
 * de Dominio. Se deben usar Mappers para transformar entre entidades y modelos.
 * </p>
 * 
 * @see com.neonpass.domain.port.out Puertos de salida que implementan los
 *      repositorios
 */
package com.neonpass.infrastructure.adapter.out.persistence;
