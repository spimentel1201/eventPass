# API Design Conventions

## Overview
This document defines the REST API standards for NeonPass. All backend developers must follow these conventions to ensure consistency, security, and maintainability.

---

## Table of Contents
1. [Endpoint Structure](#endpoint-structure)
2. [HTTP Methods](#http-methods)
3. [Request/Response Format](#requestresponse-format)
4. [Status Codes](#status-codes)
5. [Error Handling](#error-handling)
6. [Authentication](#authentication)
7. [Rate Limiting](#rate-limiting)
8. [Pagination](#pagination)
9. [Filtering & Search](#filtering--search)
10. [Versioning](#versioning)
11. [CORS](#cors)

---

## Endpoint Structure

### Naming Pattern
```
/api/v{version}/{resource}/{id}/{sub-resource}/{sub-id}
```

### Rules
- Use **plural nouns** for resources (`/events`, not `/event`)
- Use **kebab-case** for multi-word resources (`/ticket-tiers`, not `/ticketTiers`)
- Use **UUID path parameters** for IDs (never sequential integers)
- Keep URLs **short and readable** (max 4 levels deep)

---

### Examples

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/events` | List all events |
| `GET` | `/api/v1/events/{eventId}` | Get event details |
| `GET` | `/api/v1/events/{eventId}/sections` | Get sections for an event |
| `GET` | `/api/v1/sections/{sectionId}/seats` | Get seats in a section |
| `POST` | `/api/v1/reservations` | Reserve seats |
| `POST` | `/api/v1/orders` | Create order (checkout) |
| `POST` | `/api/v1/tickets/{ticketId}/validate` | Validate ticket (QR scan) |
| `PUT` | `/api/v1/events/{eventId}` | Update event |
| `DELETE` | `/api/v1/reservations/{reservationId}` | Cancel reservation |

---

### Bad Examples (Do NOT Use)

```
❌ /api/v1/getEvents
❌ /api/v1/event/123
❌ /api/v1/events/search?query=coldplay
❌ /api/v1/validateTicket
❌ /api/v1/createOrder
```

**Why?**
- Mixing verbs in URLs (use HTTP methods instead)
- Using sequential IDs (security risk)
- Query strings for standard operations (use POST /search if needed)

---

## HTTP Methods

### Standard CRUD Operations

| Method | Usage | Idempotent? | Safe? |
|--------|-------|-------------|-------|
| `GET` | Retrieve resource(s) | ✅ | ✅ |
| `POST` | Create new resource | ❌ | ❌ |
| `PUT` | Update entire resource | ✅ | ❌ |
| `PATCH` | Partial update | ❌ | ❌ |
| `DELETE` | Remove resource | ✅ | ❌ |

---

### When to Use What

**POST vs PUT:**
- Use `POST` when the server generates the ID (e.g., creating an order)
- Use `PUT` when the client knows the ID (e.g., updating user profile)

**PUT vs PATCH:**
- Use `PUT` to replace the entire resource
- Use `PATCH` for partial updates (e.g., changing only event status)

**Examples:**
```http
POST /api/v1/orders
{ "eventId": "...", "seats": [...] }
→ Server generates order ID

PUT /api/v1/events/550e8400-...
{ "title": "Updated Title", "description": "...", "startTime": "..." }
→ Replaces entire event

PATCH /api/v1/events/550e8400-...
{ "status": "CANCELLED" }
→ Only updates status field
```

---

## Request/Response Format

### Standard Response Envelope

All API responses MUST use this structure:

```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "meta": {
    "timestamp": "2026-01-15T10:30:00Z",
    "requestId": "req_abc123"
  }
}
```

---

### Success Response (200/201)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Coldplay - Music of the Spheres",
    "startTime": "2026-03-15T20:00:00Z",
    "venue": {
      "id": "abc12345-...",
      "name": "Madison Square Garden"
    }
  },
  "error": null,
  "meta": {
    "timestamp": "2026-01-15T10:30:00Z",
    "requestId": "req_7f3b2c1a"
  }
}
```

---

### Error Response (4xx/5xx)

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "SEAT_NOT_AVAILABLE",
    "message": "The selected seat is no longer available",
    "details": {
      "seatId": "123e4567-...",
      "eventId": "550e8400-...",
      "reason": "Already reserved by another user"
    },
    "timestamp": "2026-01-15T10:30:00Z"
  },
  "meta": {
    "timestamp": "2026-01-15T10:30:00Z",
    "requestId": "req_error_456"
  }
}
```

---

### Java Implementation

```java
@Data
@Builder
public class ApiResponse<T> {
    private boolean success;
    private T data;
    private ErrorDetails error;
    private MetaData meta;
    
    @Data
    @Builder
    public static class ErrorDetails {
        private String code;
        private String message;
        private Map<String, Object> details;
        private String timestamp;
    }
    
    @Data
    @Builder
    public static class MetaData {
        private String timestamp;
        private String requestId;
    }
    
    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
            .success(true)
            .data(data)
            .error(null)
            .meta(MetaData.builder()
                .timestamp(LocalDateTime.now().toString())
                .requestId(UUID.randomUUID().toString())
                .build())
            .build();
    }
    
    public static <T> ApiResponse<T> error(String code, String message, Map<String, Object> details) {
        return ApiResponse.<T>builder()
            .success(false)
            .data(null)
            .error(ErrorDetails.builder()
                .code(code)
                .message(message)
                .details(details)
                .timestamp(LocalDateTime.now().toString())
                .build())
            .meta(MetaData.builder()
                .timestamp(LocalDateTime.now().toString())
                .requestId(UUID.randomUUID().toString())
                .build())
            .build();
    }
}
```

---

### Controller Usage

```java
@RestController
@RequestMapping("/api/v1/events")
public class EventController {
    
    @GetMapping("/{eventId}")
    public ResponseEntity<ApiResponse<EventDTO>> getEvent(@PathVariable UUID eventId) {
        EventDTO event = eventService.findById(eventId);
        return ResponseEntity.ok(ApiResponse.success(event));
    }
    
    @PostMapping
    public ResponseEntity<ApiResponse<EventDTO>> createEvent(@Valid @RequestBody CreateEventRequest request) {
        EventDTO created = eventService.create(request);
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(ApiResponse.success(created));
    }
}
```

---

## Status Codes

### Success Codes (2xx)

| Code | Name | When to Use |
|------|------|-------------|
| `200` | OK | Successful GET, PUT, PATCH |
| `201` | Created | Successful POST (resource created) |
| `204` | No Content | Successful DELETE (no response body) |

---

### Client Error Codes (4xx)

| Code | Name | When to Use | Example |
|------|------|-------------|---------|
| `400` | Bad Request | Invalid request format | Missing required field |
| `401` | Unauthorized | Authentication missing/invalid | No JWT token |
| `403` | Forbidden | Authenticated but not authorized | User trying to delete another user's order |
| `404` | Not Found | Resource doesn't exist | Event ID not found |
| `409` | Conflict | Business rule violation | Seat already reserved |
| `422` | Unprocessable Entity | Valid syntax, invalid semantics | Event start time in the past |
| `429` | Too Many Requests | Rate limit exceeded | 100 requests/minute exceeded |

---

### Server Error Codes (5xx)

| Code | Name | When to Use | Example |
|------|------|-------------|---------|
| `500` | Internal Server Error | Unexpected server error | Database connection failed |
| `502` | Bad Gateway | Upstream service failure | Stripe API down |
| `503` | Service Unavailable | Temporary unavailability | Redis maintenance mode |
| `504` | Gateway Timeout | Upstream timeout | Payment processor timeout |

---

### Status Code Decision Tree

```
Is request valid syntactically?
  ├─ NO → 400 Bad Request
  └─ YES → Is user authenticated?
      ├─ NO → 401 Unauthorized
      └─ YES → Is user authorized for this action?
          ├─ NO → 403 Forbidden
          └─ YES → Does resource exist?
              ├─ NO → 404 Not Found
              └─ YES → Does action violate business rules?
                  ├─ YES → 409 Conflict or 422 Unprocessable Entity
                  └─ NO → Did server error occur?
                      ├─ YES → 500 Internal Server Error
                      └─ NO → 200 OK / 201 Created / 204 No Content
```

---

## Error Handling

### Error Code Standards

**Format:** `SCREAMING_SNAKE_CASE`

**Categories:**

| Prefix | Category | Examples |
|--------|----------|----------|
| `AUTH_*` | Authentication | `AUTH_TOKEN_EXPIRED`, `AUTH_INVALID_CREDENTIALS` |
| `SEAT_*` | Seat operations | `SEAT_NOT_AVAILABLE`, `SEAT_ALREADY_SOLD` |
| `PAYMENT_*` | Payment | `PAYMENT_FAILED`, `PAYMENT_DECLINED` |
| `EVENT_*` | Event | `EVENT_NOT_FOUND`, `EVENT_CANCELLED` |
| `VALIDATION_*` | Input validation | `VALIDATION_REQUIRED_FIELD`, `VALIDATION_INVALID_FORMAT` |

---

### Global Exception Handler

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(SeatNotAvailableException.class)
    public ResponseEntity<ApiResponse<Void>> handleSeatNotAvailable(SeatNotAvailableException ex) {
        Map<String, Object> details = Map.of(
            "seatId", ex.getSeatId(),
            "eventId", ex.getEventId()
        );
        
        ApiResponse<Void> response = ApiResponse.error(
            "SEAT_NOT_AVAILABLE",
            "The selected seat is no longer available",
            details
        );
        
        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidationErrors(MethodArgumentNotValidException ex) {
        Map<String, Object> details = new HashMap<>();
        
        ex.getBindingResult().getFieldErrors().forEach(error -> 
            details.put(error.getField(), error.getDefaultMessage())
        );
        
        ApiResponse<Void> response = ApiResponse.error(
            "VALIDATION_FAILED",
            "Request validation failed",
            details
        );
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGenericException(Exception ex) {
        log.error("Unhandled exception", ex);
        
        ApiResponse<Void> response = ApiResponse.error(
            "INTERNAL_SERVER_ERROR",
            "An unexpected error occurred. Please try again later.",
            Map.of("timestamp", LocalDateTime.now().toString())
        );
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
```

---

### Custom Business Exceptions

```java
@ResponseStatus(HttpStatus.CONFLICT)
public class SeatNotAvailableException extends RuntimeException {
    private final UUID seatId;
    private final UUID eventId;
    
    public SeatNotAvailableException(UUID seatId, UUID eventId) {
        super("Seat " + seatId + " is not available for event " + eventId);
        this.seatId = seatId;
        this.eventId = eventId;
    }
    
    // Getters
}
```

---

## Authentication

### JWT Bearer Token

**Header:**
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### Token Payload

```json
{
  "sub": "user-550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "role": "USER",
  "organizationId": "org-abc12345-...",
  "exp": 1642248600,
  "iat": 1642162200,
  "jti": "token-unique-id"
}
```

**Claims:**
- `sub`: User ID (UUID)
- `role`: User role (USER, ADMIN, STAFF, SUPER_ADMIN)
- `organizationId`: For multi-tenant isolation
- `exp`: Expiration timestamp (Unix epoch)
- `iat`: Issued at timestamp
- `jti`: JWT ID (for revocation)

---

### Token Expiration

| Token Type | Lifetime | Refresh? |
|------------|----------|----------|
| Access Token | 24 hours | ❌ |
| Refresh Token | 30 days | ✅ |
| Mobile App Token | 90 days | ✅ |

---

### Login Endpoint

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "refresh_abc123...",
    "expiresIn": 86400,
    "user": {
      "id": "550e8400-...",
      "email": "user@example.com",
      "fullName": "John Doe",
      "role": "USER"
    }
  }
}
```

---

### Token Refresh

```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "refresh_abc123..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 86400
  }
}
```

---

### Protected Endpoints

```java
@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {
    
    @GetMapping("/me")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<List<OrderDTO>>> getMyOrders(
        @AuthenticationPrincipal JwtUser currentUser
    ) {
        List<OrderDTO> orders = orderService.findByUserId(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(orders));
    }
    
    @DeleteMapping("/{orderId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> cancelOrder(@PathVariable UUID orderId) {
        orderService.cancel(orderId);
        return ResponseEntity.noContent().build();
    }
}
```

---

## Rate Limiting

### Rate Limit Rules

| Endpoint Type | Limit | Window | Identifier |
|--------------|-------|--------|------------|
| Public (GET) | 100 req | 1 minute | IP Address |
| Authenticated (GET) | 300 req | 1 minute | User ID |
| Write (POST/PUT) | 10 req | 1 minute | User ID |
| Payment | 3 req | 5 minutes | User ID |
| Admin | 1000 req | 1 minute | User ID |

---

### Rate Limit Headers

```http
HTTP/1.1 200 OK
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1642248600
```

**When limit exceeded:**
```http
HTTP/1.1 429 Too Many Requests
Retry-After: 60

{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again in 60 seconds.",
    "details": {
      "limit": 100,
      "resetAt": "2026-01-15T10:31:00Z"
    }
  }
}
```

---

### Implementation with Bucket4j

```java
@Component
public class RateLimitInterceptor implements HandlerInterceptor {
    
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String key = getRateLimitKey(request);
        Bucket bucket = buckets.computeIfAbsent(key, k -> createBucket());
        
        ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);
        
        if (probe.isConsumed()) {
            response.addHeader("X-RateLimit-Remaining", String.valueOf(probe.getRemainingTokens()));
            return true;
        }
        
        response.setStatus(429);
        response.addHeader("Retry-After", String.valueOf(probe.getNanosToWaitForRefill() / 1_000_000_000));
        return false;
    }
    
    private Bucket createBucket() {
        Bandwidth limit = Bandwidth.classic(100, Refill.intervally(100, Duration.ofMinutes(1)));
        return Bucket.builder().addLimit(limit).build();
    }
}
```

---

## Pagination

### Request Format

```http
GET /api/v1/events?page=2&size=20&sort=startTime,desc
```

**Parameters:**
- `page`: Page number (0-indexed)
- `size`: Items per page (default: 20, max: 100)
- `sort`: Sort field and direction (e.g., `title,asc`)

---

### Response Format

```json
{
  "success": true,
  "data": {
    "content": [
      { "id": "...", "title": "Event 1" },
      { "id": "...", "title": "Event 2" }
    ],
    "pagination": {
      "page": 2,
      "size": 20,
      "totalElements": 156,
      "totalPages": 8,
      "first": false,
      "last": false
    }
  }
}
```

---

### Spring Data Implementation

```java
@GetMapping
public ResponseEntity<ApiResponse<PagedResponse<EventDTO>>> listEvents(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "20") int size,
    @RequestParam(defaultValue = "startTime,desc") String sort
) {
    Pageable pageable = PageRequest.of(page, size, Sort.by(sort));
    Page<Event> eventsPage = eventRepository.findAll(pageable);
    
    PagedResponse<EventDTO> pagedResponse = PagedResponse.<EventDTO>builder()
        .content(eventsPage.getContent().stream()
            .map(eventMapper::toDTO)
            .collect(Collectors.toList()))
        .pagination(PaginationMeta.builder()
            .page(eventsPage.getNumber())
            .size(eventsPage.getSize())
            .totalElements(eventsPage.getTotalElements())
            .totalPages(eventsPage.getTotalPages())
            .first(eventsPage.isFirst())
            .last(eventsPage.isLast())
            .build())
        .build();
    
    return ResponseEntity.ok(ApiResponse.success(pagedResponse));
}
```

---

### Cursor-Based Pagination (Alternative)

**For high-traffic endpoints:**
```http
GET /api/v1/events?cursor=eyJpZCI6IjU1MGU4NDAwLi4uIn0&size=20
```

**Response:**
```json
{
  "data": {
    "content": [...],
    "nextCursor": "eyJpZCI6ImFiYzEyMzQ1Li4uIn0",
    "hasMore": true
  }
}
```

---

## Filtering & Search

### Query Parameters

```http
GET /api/v1/events?status=PUBLISHED&startDate=2026-01-15&city=New+York&search=coldplay
```

**Rules:**
- Use camelCase for filter parameters
- Use ISO 8601 for dates (`YYYY-MM-DD`)
- Use `search` for full-text search
- Support multiple values: `?status=PUBLISHED,DRAFT`

---

### Implementation

```java
@GetMapping
public ResponseEntity<ApiResponse<List<EventDTO>>> searchEvents(
    @RequestParam(required = false) List<String> status,
    @RequestParam(required = false) @DateTimeFormat(iso = ISO.DATE) LocalDate startDate,
    @RequestParam(required = false) String city,
    @RequestParam(required = false) String search
) {
    EventFilter filter = EventFilter.builder()
        .statuses(status)
        .startDate(startDate)
        .city(city)
        .searchTerm(search)
        .build();
    
    List<EventDTO> events = eventService.search(filter);
    return ResponseEntity.ok(ApiResponse.success(events));
}
```

---

## Versioning

### Strategy: URL Versioning

```
/api/v1/events
/api/v2/events
```

**Why URL versioning?**
- Simple and explicit
- Easy to route and cache
- Client can choose version per request

---

### Version Lifecycle

1. **v1 Released** (Stable)
2. **v2 Beta** (New features, breaking changes)
3. **v1 Deprecated** (6 months notice)
4. **v1 Sunset** (Removed after 1 year)

---

### Breaking vs Non-Breaking Changes

**Breaking Changes (Require New Version):**
- Removing/renaming fields
- Changing field types
- Changing authentication method
- Removing endpoints

**Non-Breaking Changes (Same Version):**
- Adding optional fields
- Adding new endpoints
- Relaxing validation rules

---

## CORS

### Configuration

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins(
                "https://neonpass.com",
                "https://app.neonpass.com"
            )
            .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE")
            .allowedHeaders("*")
            .exposedHeaders("X-RateLimit-Remaining", "X-RateLimit-Reset")
            .allowCredentials(true)
            .maxAge(3600);
    }
}
```

**Production:** Restrict to specific domains only  
**Development:** Allow `http://localhost:3000`

---

## API Documentation

### OpenAPI/Swagger

```java
@Configuration
@OpenAPIDefinition(
    info = @Info(
        title = "NeonPass API",
        version = "v1",
        description = "High-performance ticketing platform API",
        contact = @Contact(
            name = "NeonPass Support",
            email = "support@neonpass.com"
        )
    ),
    servers = {
        @Server(url = "https://api.neonpass.com", description = "Production"),
        @Server(url = "https://staging-api.neonpass.com", description = "Staging")
    }
)
public class OpenApiConfig {
    // Auto-generated docs at /swagger-ui.html
}
```

---

## Testing API Endpoints

### Example Test

```java
@SpringBootTest
@AutoConfigureMockMvc
class EventControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Test
    @WithMockUser(roles = "USER")
    void shouldReturnEventById() throws Exception {
        UUID eventId = UUID.randomUUID();
        
        mockMvc.perform(get("/api/v1/events/{eventId}", eventId))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.id").value(eventId.toString()));
    }
    
    @Test
    void shouldReturn401WhenUnauthorized() throws Exception {
        mockMvc.perform(post("/api/v1/orders"))
            .andExpect(status().isUnauthorized());
    }
}
```