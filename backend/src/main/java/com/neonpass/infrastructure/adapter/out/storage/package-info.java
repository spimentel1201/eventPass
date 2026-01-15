/**
 * Capa de Infraestructura - Adaptadores de Almacenamiento.
 * 
 * <p>
 * Este paquete contiene la implementación del almacenamiento de objetos
 * usando AWS SDK v2 (compatible con MinIO en desarrollo y S3 en producción).
 * </p>
 * 
 * <p>
 * <strong>Configuración:</strong> El S3Client acepta un
 * {@code endpointOverride}
 * que apunta al contenedor de MinIO en desarrollo.
 * </p>
 * 
 * @see com.neonpass.domain.port.out Puertos de salida de almacenamiento
 */
package com.neonpass.infrastructure.adapter.out.storage;
