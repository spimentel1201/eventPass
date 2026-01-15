# Technical Stack & Architecture Rules

## 1. Project Structure (Monorepo-style or Separate Repos)
- `/apps/web`: Next.js 14+ (App Router).
- `/apps/api`: Spring Boot.
- `/apps/mobile`: Flutter.
- `/docker`: Infrastructure configuration (Compose).

## 2. Frontend Rules (Web)
- **Framework:** Next.js 14 (App Router).
- **Language:** TypeScript (Strict Mode).
- **Styling Strategy:**
  - **CSS Framework:** Tailwind CSS.
  - **Component Library:** **DaisyUI**.
  - **Rule:** Utilizar clases de componentes de DaisyUI (`btn`, `card`, `input`) para toda la UI estándar. No construir botones o inputs desde cero con utilidades de Tailwind a menos que sea estrictamente necesario.
- **State Management:** - `Zustand` (Global Client State).
  - `TanStack Query` (Server State / API Caching).
- **Graphic Engine (Venue Map):** - **Library:** `react-konva`.
  - **Rendering:** Canvas HTML5 (No DOM elements for seats).
- **Forms:** React Hook Form + Zod (Validation).

## 3. Backend Rules (API - Spring Boot)
- **Framework:** Spring Boot 3.x (Java 17+).
- **Build Tool:** Maven o Gradle.
- **API Style:** - RESTful para CRUD estándar.
  - WebSockets (STOMP) para actualizaciones de asientos en tiempo real.
- **Database:** - **Primary:** PostgreSQL (Relational Data).
  - **Cache/Lock:** Redis (Distributed Locking for Seats).
- **Arquitectura:** **Hexagonal (Ports & Adapters) Estricta**.
  - **Prohibido:** No usar la estructura plana `controller`, `service`, `repository`.
  - **Objetivo:** El Dominio debe ser agnóstico al framework (Java puro). Spring Boot solo debe vivir en la capa de Infraestructura.
  - **Manejo de Datos:** Uso estricto de Mappers. Las entidades de JPA nunca deben entrar en la capa de Dominio, y los modelos de Dominio nunca deben salir a la API.
- **Auth:** Spring Security + JWT (Stateless).
- **Storage Strategy:**
  - **Development:** **MinIO** (Dockerized S3-compatible object storage).
  - **Production Ready:** El código debe usar `AWS SDK for Java 2.x`.
  - **Pattern:** Configurar el `S3Client` para aceptar un `endpointOverride` que apunte al contenedor de MinIO en desarrollo.
- **API Documentation:**
  - **Standard:** OpenAPI 3.0.
  - **Library:** `springdoc-openapi-starter-webmvc-ui` (Latest version).
  - **Requirement:** Todos los endpoints públicos y privados deben estar documentados y probables desde Swagger UI.
- **Logging:**
  - **Standard:** SLF4J + Logback.
  - **Requirement:** Todos los logs deben ser estructurados y rotados correctamente.
- **Security:**
  - **Standard:** JWT + Spring Security.
- **Performance:**
  - **Standard:** Caching + Pagination + Indexing.
- **Testing:**
  - **Standard:** JUnit + Mockito + Mockito Inline.

## 4. Mobile Rules (App - Flutter)
- **Framework:** Flutter (Latest Stable).
- **State Management:** Riverpod o BLoC.
- **Architecture:** Clean Architecture (Domain, Data, Presentation layers).
- **Dependencies:** `mobile_scanner` (QR Scanning), `dio` (HTTP), `flutter_secure_storage`.

## 5. General Code Quality
- **Linter:** ESLint (Frontend), Checkstyle/SonarLint (Backend).
- **Formatting:** Prettier (Frontend), Google Java Format (Backend).