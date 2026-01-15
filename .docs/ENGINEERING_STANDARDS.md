# Engineering Standards & Best Practices

## 1. Clean Code Guidelines

### General Principles (Frontend & Backend)
- **SOLID:** Aplicar principios SOLID rigurosamente.
- **DRY (Don't Repeat Yourself):** Extraer lógica repetida a utilidades o hooks/servicios.
- **Naming Conventions:** Variables y clases en **Inglés** (ej. `SeatRepository`), pero Comentarios y Javadoc en **Español**.
- **Small Functions:** Las funciones no deben exceder las 20-30 líneas.

### Backend: Arquitectura Hexagonal (Estructura de Paquetes)
El código debe organizarse en 3 círculos concéntricos. **Prohibido** usar la estructura plana clásica.

1.  **`domain` (El Núcleo):**
    * Contenido: Entidades (POJOs puros), Value Objects, Excepciones de Negocio y **Puertos (Interfaces)**.
    * Regla: **Cero dependencias de Spring Boot**. Solo Java estándar.
    * Sub-paquetes: `/model`, `/port/in`, `/port/out`.

2.  **`application` (La Orquestación):**
    * Contenido: Implementación de los casos de uso (`Service`).
    * Responsabilidad: Orquestar el flujo y llamar a los puertos.
    * Sub-paquetes: `/service`.

3.  **`infrastructure` (Los Adaptadores):**
    * Contenido: Todo lo que toca frameworks o I/O externo.
    * Sub-paquetes:
        * `/adapter/in/web`: RestControllers (API).
        * `/adapter/out/persistence`: Repositorios JPA y Entidades `@Entity`.
        * `/adapter/out/storage`: Implementación de MinIO/S3.
        * `/config`: Beans de Spring.

**Regla de Dependencia:** `Infrastructure` -> `Application` -> `Domain`. El Dominio nunca conoce el exterior.

### Frontend (Next.js / React)
- **Functional Components:** Solo usar componentes funcionales y Hooks.
- **Custom Hooks:** Extraer lógica compleja (ej. cálculo de carrito) a hooks personalizados.
- **Component Atomic Design:** Separar componentes en `atoms`, `molecules` y `organisms`.

## 2. Infrastructure & Docker Strategy

### Containerization
- **Multi-stage Builds:** Separar compilación de ejecución en el Dockerfile.
- **Environment Variables:** Inyección estricta de credenciales (DB, Redis, MinIO) vía `.env`.

### Docker Compose Services
El proyecto debe correr con `docker-compose up`. Servicios requeridos:
1.  **db:** PostgreSQL 15+.
2.  **cache:** Redis (Alpine).
3.  **backend:** Spring Boot App.
4.  **frontend:** Next.js.
5.  **minio:** Object Storage (ver configuración abajo).
6.  **createbuckets:** Job de inicialización (ver configuración abajo).

### Reference Snippet for MinIO (Copy this to docker-compose.yml)
La IA debe usar este bloque exacto para configurar el almacenamiento local:

```yaml
  minio:
    image: minio/minio:latest
    container_name: neonpass-minio
    ports:
      - "9000:9000" # API S3
      - "9001:9001" # Web Console
    environment:
      MINIO_ROOT_USER: "admin"
      MINIO_ROOT_PASSWORD: "password123"
    command: server /data --console-address ":9001"
    volumes:
      - ./docker/minio_data:/data
    networks:
      - neonpass-network

  # Job para crear el bucket automáticamente
  createbuckets:
    image: minio/mc
    depends_on:
      - minio
    entrypoint: >
      /bin/sh -c "
      /usr/bin/mc config host add myminio http://minio:9000 admin password123;
      /usr/bin/mc mb myminio/neonpass-images;
      /usr/bin/mc anonymous set public myminio/neonpass-images;
      exit 0;
      "
    networks:
      - neonpass-network