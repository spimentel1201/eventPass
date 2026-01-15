# NeonPass 🎫

![NeonPass Banner](https://via.placeholder.com/1200x400/050505/00f3ff?text=NeonPass+Architecture)
[![Spring Boot](https://img.shields.io/badge/Backend-Spring%20Boot-6DB33F?logo=springboot)](https://spring.io/)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js-000000?logo=nextdotjs)](https://nextjs.org/)
[![Flutter](https://img.shields.io/badge/Mobile-Flutter-02569B?logo=flutter)](https://flutter.dev/)
[![Docker](https://img.shields.io/badge/Infrastructure-Docker-2496ED?logo=docker)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**NeonPass** es una plataforma SaaS de venta de entradas y gestión de eventos diseñada para manejar **alta concurrencia** y **reservas en tiempo real**.

Este proyecto no es solo un CRUD; es una implementación robusta de patrones de arquitectura para resolver problemas complejos de negocio como la sobreventa de asientos (double-booking) y la gestión visual de recintos masivos.

## 🚀 Características Principales

- **Atomic Seat Locking:** Motor de reservas basado en **Redis** que implementa un patrón de bloqueo temporal (TTL) para garantizar consistencia de datos durante picos de tráfico.
- **Interactive Venue Builder:** Editor visual de mapas de asientos utilizando **React-Konva**, permitiendo renderizar miles de nodos sin perder rendimiento.
- **SaaS Multi-tenant:** Arquitectura preparada para alojar múltiples organizaciones con aislamiento lógico de datos.
- **Cross-Platform Access:**
  - **Web:** Dashboard para organizadores y tienda pública (Next.js + DaisyUI).
  - **Mobile:** App para staff de control de acceso y escaneo QR (Flutter).

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Propósito |
| :--- | :--- | :--- |
| **Backend** | Java 17, Spring Boot 3 | API REST, Lógica de Negocio, Seguridad |
| **Database** | PostgreSQL 15 | Persistencia Relacional (ACID) |
| **Caching/Lock** | Redis | Gestión de sesiones y Bloqueo optimista de asientos |
| **Frontend** | Next.js 14, Tailwind, DaisyUI | SSR, UI/UX, Neon Theme |
| **Mobile** | Flutter | App nativa para Android/iOS (Scanner) |
| **Infra** | Docker Compose | Orquestación de contenedores para desarrollo local |

## 🏗️ Arquitectura & Desafíos

El núcleo de NeonPass resuelve el problema de la **"Race Condition"** en la compra de tickets:

1. El usuario selecciona un asiento en el mapa visual.
2. El backend verifica la disponibilidad en Redis (operación atómica).
3. Si está libre, se establece un **TTL (Time-to-Live)** de 10 minutos.
4. WebSocket notifica a otros clientes conectados para bloquear visualmente el asiento en tiempo real.
5. La transacción final en PostgreSQL solo ocurre tras la confirmación del pago.

## 📸 Screenshots
## 📦 Instalación

```bash
# Clonar el repositorio
git clone [https://github.com/spimentel1201/neonpass.git](https://github.com/spimentel1201/neonpass.git)

# Levantar infraestructura (DB + Redis + App)
docker-compose up -d