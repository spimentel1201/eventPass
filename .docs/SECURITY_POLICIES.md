# Cybersecurity & Compliance Policies

## 1. Ticket Integrity Strategy (Anti-Fraud)
El sistema de generación de QRs debe ser criptográficamente seguro.

- **QR Payload:** El código QR NO debe contener texto plano. Debe contener un **Token Firmado** (JWT o HMAC-SHA256 string).
- **Signing Key:** Usar una clave secreta rotativa (`TICKET_SIGNING_SECRET`) inyectada vía variables de entorno.
- **Validation:** La App Móvil (Scanner) envía el string del QR al Backend. El Backend verifica la firma antes de marcar el ticket como "USED". **Nunca validar la firma en el frontend/móvil.**

## 2. Anti-Bot & Rate Limiting (Backend)
Implementar `Bucket4j` o `Spring Cloud Gateway RateLimiter` para proteger endpoints críticos:

- **Login:** Máx 5 intentos fallidos por minuto.
- **Seat Reservation (Hold):** Máx 10 asientos bloqueados por usuario en una ventana de 10 minutos.
- **Public API:** Máx 100 requests/minuto por IP genérica.

## 3. Data Protection & IDOR Prevention
- **Primary Keys:** Todas las entidades expuestas (Events, Tickets, Orders) deben usar **UUID v4**. Nunca exponer IDs numéricos secuenciales (Database IDs) en la URL.
- **Ownership Checks:** En cada `@GetMapping("/orders/{id}")`, validar explícitamente:
  `if (!order.getUserId().equals(currentUser.getId())) throw new AccessDeniedException();`

## 4. Payment Security
- **PCI Scope:** El backend NUNCA recibe ni procesa números de tarjeta (PAN) crudos.
- **Handling:** El Frontend usa SDKs (Stripe Elements) para enviar la tarjeta directamente al proveedor y recibe un `payment_method_id`. El Backend solo guarda ese ID.

## 5. Secure Headers & Transport
- **HTTPS:** Obligatorio en producción.
- **CORS:** Configuración estricta. Permitir solo el origen del Frontend (ej. `app.neonpass.com`), no `*`.
- **Content Security Policy (CSP):** Configurar headers para prevenir XSS.