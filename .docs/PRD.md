# Product Requirements Document (PRD): NeonPass

| Metadatos | Detalle |
| :--- | :--- |
| **Proyecto** | NeonPass - High Performance Ticketing SaaS |
| **Versión** | 1.0 (MVP Definition) |
| **Estado** | *Draft / To Do* |
| **Arquitectura** | Modular Monolith / Hexagonal |

---

## 1. Visión y Alcance
**NeonPass** es una plataforma SaaS B2B2C que permite a organizadores gestionar eventos complejos con distribución de asientos numerados, zonas generales y control de acceso.
El objetivo técnico es demostrar el manejo de **alta concurrencia** (venta de entradas masiva), **integridad de datos** (no sobreventa) y **experiencia de usuario inmersiva** (mapas interactivos en modo oscuro/neón).

### 1.1 Alcance del MVP
* Gestión Multi-tenant (SaaS).
* Diseñador visual de escenarios y asientos (Venue Builder) con Canvas.
* Motor de reservas en tiempo real con bloqueo temporal (Redis).
* Pasarela de pagos y distribución de comisiones.
* App Móvil (Flutter) para control de acceso (Scan QR seguro).

---

## 2. Actores y Roles

| Actor | Descripción | Plataforma Principal |
| :--- | :--- | :--- |
| **Super Admin** | Dueño del SaaS. Gestiona tenants y métricas globales. | Web Admin |
| **Tenant (Organizador)** | Cliente del SaaS. Crea eventos, diseña mapas, define precios. | Web Dashboard |
| **End User (Comprador)** | Cliente final. Selecciona asientos, paga y recibe tickets. | Web Public / Mobile Web |
| **Staff (Validator)** | Personal en puerta. Valida la autenticidad de los tickets. | **App Móvil (Flutter)** |

---

## 3. Historias de Usuario (Epics)

### Epic 1: Gestión de Recintos y Zonas (Venue Builder 2.0)
*El organizador no dibuja asientos en el vacío, primero define la estructura física.*

* **US-1.1 (Zones):** Como **Organizador**, quiero dibujar formas geométricas (rectángulos o polígonos) sobre el plano para definir **Secciones/Zonas** (ej. "Tribuna Norte", "Palco VIP").
* **US-1.2 (Seat Matrix):** Como **Organizador**, quiero entrar en una Sección específica y generar una matriz de asientos (filas x columnas) que pertenezcan solo a esa sección.
* **US-1.3 (General Admission):** Como **Organizador**, quiero definir Secciones tipo "Campo" que no tengan asientos numerados, solo una capacidad máxima (Aforo).

### Epic 2: Motor de Reservas y Concurrencia (Core Backend)
* **US-2.1:** Como **Comprador**, quiero ver el estado de los asientos en tiempo real (Libre, Ocupado, En mi carrito) sin recargar la página.
* **US-2.2:** Como **Sistema**, debo bloquear un asiento seleccionado por 10 minutos (TTL) en Redis para impedir la sobreventa (Race Condition).
* **US-2.3:** Como **Comprador**, quiero seleccionar múltiples asientos y proceder al checkout unificado.
* **US-2.4 (Navigation - NUEVA):** Como **Comprador**, quiero una navegación jerárquica: ver primero el mapa general del estadio, hacer clic en una zona, y que el sistema haga zoom para cargar solo los asientos de esa zona (Optimización de renderizado).

### Epic 3: Pagos y Emisión (Fintech & Security)
* **US-3.1:** Como **Comprador**, quiero pagar de forma segura.
* **US-3.2:** Como **Sistema**, solo genero el ticket si el pago es exitoso. Si falla, libero los asientos inmediatamente.
* **US-3.3:** Como **Comprador**, recibo un ticket con QR firmado criptográficamente (HMAC) para evitar falsificaciones.

### Epic 4: Control de Acceso (Mobile)
* **US-4.1:** Como **Staff**, quiero escanear un QR con la App móvil.
* **US-4.2:** Como **Sistema**, valido la firma del QR y que no haya sido usado antes.
* **US-4.3:** Como **Staff**, recibo feedback visual (Verde/Rojo) y sonoro instantáneo.

---

## 4. Reglas de Negocio (Business Rules)

1.  **Atomicidad:** Un asiento solo puede venderse una vez por evento.
2.  **TTL (Time-To-Live):** El bloqueo temporal dura estrictamente 10 minutos.
3.  **Inmutabilidad de Precios:** El precio en el carrito se congela durante la sesión de compra, aunque el organizador lo cambie en el backend.
4.  **Validación Única:** Un ticket QR es válido para un solo ingreso (One-time use).
5.  **Regla de Activación de Zonas:** Un Evento hereda la estructura física del Recinto (Venue), pero puede decidir qué Secciones están "Activas" para la venta. Los asientos de una sección inactiva no se cargan ni se venden.

---

## 5. Especificaciones Técnicas

### 5.1 Arquitectura
* **Patrón:** Hexagonal Architecture (Ports & Adapters).
* **Separación:** Frontend desacoplado del Backend (API REST + WebSockets).

### 5.2 Stack Tecnológico Definido

#### Backend (API)
* **Lenguaje:** Java 17+ (Spring Boot 3).
* **DB:** PostgreSQL (Persistencia) + Redis (Locking/Cache).
* **Security:** Spring Security + JWT + Rate Limiting (Bucket4j).

#### Frontend (Web)
* **Framework:** Next.js 14 (App Router).
* **UI Library:** **DaisyUI** + Tailwind CSS (Theme: NeonPass).
* **Graphics:** `react-konva` para el mapa de asientos.

#### Mobile (Staff App)
* **Framework:** Flutter.
* **Funcionalidad:** Scanner QR nativo y autenticación JWT.

#### Infraestructura
* **Docker:** Compose para orquestación local (DB, Redis, App).

## 6. Requerimientos No Funcionales (NFR)

1.  **Concurrencia:** Soportar picos de tráfico sin inconsistencia de datos.
2.  **Seguridad:** IDs aleatorios (UUID) para evitar enumeración. Protección contra bots en el checkout.
3.  **Performance:** El mapa de asientos debe cargar y ser interactivo en < 2 segundos.
4.  **Optimización de Renderizado:** El mapa no debe renderizar todos los asientos (ej. 50,000) al inicio. Debe usar una estrategia de "Lazy Loading": cargar primero los polígonos de las secciones y solo cargar los nodos de asientos (Canvas) cuando el usuario entra a una sección específica.