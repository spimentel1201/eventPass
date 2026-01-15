# Backend Engineering Standards

## Overview
This document defines mandatory coding standards, architectural patterns, and best practices for the NeonPass backend. All Java code must comply with these standards.

---

## Table of Contents
1. [Hexagonal Architecture](#hexagonal-architecture)
2. [Code Patterns](#mandatory-code-patterns)
3. [Concurrency Rules](#concurrency-rules)
4. [Testing Requirements](#testing-requirements)
5. [Security Standards](#security-standards)
6. [Performance Guidelines](#performance-guidelines)

---

## Hexagonal Architecture

### Overview
NeonPass follows **Hexagonal Architecture** (Ports & Adapters) to separate business logic from external dependencies.

---

### Project Structure

```
src/main/java/com/neonpass/
├── application/              # Use Cases (Application Layer)
│   ├── usecases/
│   │   ├── ReserveSeatUseCase.java
│   │   ├── ProcessPaymentUseCase.java
│   │   └── ValidateTicketUseCase.java
│   └── dto/
│       ├── request/
│       │   ├── ReserveSeatRequest.java
│       │   └── CreateOrderRequest.java
│       └── response/
│           ├── ReservationResponse.java
│           └── TicketResponse.java
│
├── domain/                   # Business Logic (Domain Layer)
│   ├── model/
│   │   ├── Ticket.java
│   │   ├── Seat.java
│   │   ├── Event.java
│   │   └── Order.java
│   ├── repository/           # Ports (Interfaces)
│   │   ├── TicketRepository.java
│   │   ├── SeatRepository.java
│   │   └── EventRepository.java
│   ├── service/              # Domain Services
│   │   ├── PricingService.java
│   │   └── TicketValidationService.java
│   └── exception/
│       ├── SeatNotAvailableException.java
│       └── PaymentFailedException.java
│
├── infrastructure/           # Adapters (Infrastructure Layer)
│   ├── persistence/
│   │   ├── JpaTicketRepository.java
│   │   └── JpaSeatRepository.java
│   ├── cache/
│   │   └── RedisSeatLockService.java
│   ├── payment/
│   │   └── StripePaymentAdapter.java
│   └── security/
│       ├── JwtTokenProvider.java
│       └── QRCodeService.java
│
└── presentation/             # Controllers (Presentation Layer)
    └── rest/
        ├── EventController.java
        ├── OrderController.java
        └── TicketController.java
```

---

### Dependency Rules

**Critical:** Dependencies flow INWARD only

```
Presentation → Application → Domain ← Infrastructure
```

- **Domain Layer:** NO external dependencies (pure Java)
- **Application Layer:** Depends on Domain only
- **Infrastructure Layer:** Implements Domain interfaces
- **Presentation Layer:** Depends on Application layer

---

### Example: Repository Port & Adapter

**Port (Domain Layer):**
```java
package com.neonpass.domain.repository;

public interface SeatRepository {
    Optional<Seat> findById(UUID id);
    List<Seat> findAvailableSeats(UUID sectionId, UUID eventId);
    Seat save(Seat seat);
}
```

**Adapter (Infrastructure Layer):**
```java
package com.neonpass.infrastructure.persistence;

@Repository
public class JpaSeatRepository implements SeatRepository {
    
    private final SpringDataSeatRepository springRepo;
    
    @Override
    public List<Seat> findAvailableSeats(UUID sectionId, UUID eventId) {
        return springRepo.findAvailableSeats(sectionId, eventId);
    }
}

interface SpringDataSeatRepository extends JpaRepository<Seat, UUID> {
    @Query("...")
    List<Seat> findAvailableSeats(UUID sectionId, UUID eventId);
}
```

---

## Mandatory Code Patterns

### 1. Entity Design (JPA)

**All entities MUST follow this structure:**

```java
@Entity
@Table(name = "table_name")
@SQLDelete(sql = "UPDATE table_name SET deleted = true WHERE id = ?")
@Where(clause = "deleted = false")
@EntityListeners(AuditingEntityListener.class)
public class EntityName {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
    
    @CreatedBy
    @Column(updatable = false)
    private String createdBy;
    
    @LastModifiedBy
    private String lastModifiedBy;
    
    @Column(nullable = false)
    private Boolean deleted = false;
    
    // Business fields...
    
    // Getters, setters, equals, hashCode
}
```

**Rules:**
- Always use `UUID` for primary keys
- Include audit fields: `createdAt`, `updatedAt`, `createdBy`, `lastModifiedBy`
- Implement soft-delete with `@SQLDelete` + `@Where`
- Use `@Column(nullable = false)` for required fields
- Override `equals()` and `hashCode()` based on business key (not ID)

---

### 2. Reservation Service (CRITICAL)

**This pattern prevents race conditions during seat reservation:**

```java
@Service
@Transactional
public class ReserveSeatUseCase {
    
    private final SeatRepository seatRepository;
    private final RedisSeatLockService lockService;
    private final EventRepository eventRepository;
    
    private static final long LOCK_TTL_SECONDS = 600;
    
    public ReservationDTO execute(ReserveSeatCommand command) {
        // STEP 1: Validate event exists and is active
        Event event = eventRepository.findById(command.eventId())
            .orElseThrow(() -> new EventNotFoundException(command.eventId()));
        
        if (!event.isPublished()) {
            throw new EventNotAvailableException("Event is not published");
        }
        
        // STEP 2: Validate seat exists
        Seat seat = seatRepository.findById(command.seatId())
            .orElseThrow(() -> new SeatNotFoundException(command.seatId()));
        
        // STEP 3: Try to acquire Redis lock (ATOMIC)
        boolean lockAcquired = lockService.acquireSeatLock(
            command.eventId(),
            command.seatId(),
            command.userId(),
            command.cartId()
        );
        
        if (!lockAcquired) {
            throw new SeatNotAvailableException(command.seatId(), command.eventId());
        }
        
        // STEP 4: Double-check seat is not sold in database
        if (isSeatSold(command.eventId(), command.seatId())) {
            lockService.releaseSeatLock(command.eventId(), command.seatId(), command.userId());
            throw new SeatAlreadySoldException(command.seatId());
        }
        
        // STEP 5: Return reservation with expiration
        LocalDateTime expiresAt = LocalDateTime.now().plusSeconds(LOCK_TTL_SECONDS);
        
        log.info("Seat reserved: eventId={}, seatId={}, userId={}", 
            command.eventId(), command.seatId(), command.userId());
        
        return ReservationDTO.builder()
            .seatId(command.seatId())
            .eventId(command.eventId())
            .userId(command.userId())
            .expiresAt(expiresAt)
            .build();
    }
    
    private boolean isSeatSold(UUID eventId, UUID seatId) {
        return seatRepository.existsBySeatIdAndEventIdAndStatusIn(
            seatId, 
            eventId, 
            List.of(TicketStatus.VALID, TicketStatus.USED)
        );
    }
}
```

**Critical Rules:**
- ALWAYS check Redis lock BEFORE writing to PostgreSQL
- ALWAYS set TTL when creating locks (prevent orphaned locks)
- ALWAYS release locks on errors using try-finally or transaction rollback hooks
- NEVER skip the double-check in database (defense in depth)

---

### 3. Payment Processing (Idempotent)

**Use SERIALIZABLE isolation to prevent race conditions:**

```java
@Service
public class ProcessPaymentUseCase {
    
    private final OrderRepository orderRepository;
    private final TicketRepository ticketRepository;
    private final RedisSeatLockService lockService;
    private final StripePaymentAdapter stripeAdapter;
    private final QRCodeService qrCodeService;
    
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public TicketDTO execute(PaymentCommand command) {
        // STEP 1: Verify locks still exist and belong to this user
        validateReservationOwnership(command);
        
        // STEP 2: Create order in PENDING state
        Order order = Order.builder()
            .userId(command.userId())
            .eventId(command.eventId())
            .totalAmount(command.totalAmount())
            .status(OrderStatus.PENDING)
            .build();
        
        order = orderRepository.save(order);
        
        try {
            // STEP 3: Create Stripe Payment Intent
            PaymentIntent intent = stripeAdapter.createPaymentIntent(
                command.totalAmount(),
                command.currency(),
                order.getId()
            );
            
            order.setPaymentIntentId(intent.getId());
            orderRepository.save(order);
            
            // STEP 4: Confirm payment
            PaymentIntent confirmed = stripeAdapter.confirmPayment(intent.getId());
            
            if (!"succeeded".equals(confirmed.getStatus())) {
                order.setStatus(OrderStatus.FAILED);
                orderRepository.save(order);
                releaseAllLocks(command.seatIds(), command.userId());
                throw new PaymentFailedException("Payment declined");
            }
            
            // STEP 5: Generate tickets with signed QR codes
            List<Ticket> tickets = createTickets(order, command.seatIds());
            
            // STEP 6: Update order status
            order.setStatus(OrderStatus.PAID);
            orderRepository.save(order);
            
            // STEP 7: Release Redis locks (seats are now sold)
            releaseAllLocks(command.seatIds(), command.userId());
            
            log.info("Payment processed successfully: orderId={}", order.getId());
            
            return mapToDTO(tickets.get(0)); // Return first ticket
            
        } catch (StripeException e) {
            // CRITICAL: Release locks if payment fails
            order.setStatus(OrderStatus.FAILED);
            orderRepository.save(order);
            releaseAllLocks(command.seatIds(), command.userId());
            throw new PaymentFailedException("Payment processing failed", e);
        }
    }
    
    private List<Ticket> createTickets(Order order, List<UUID> seatIds) {
        return seatIds.stream()
            .map(seatId -> {
                Ticket ticket = Ticket.builder()
                    .orderId(order.getId())
                    .eventId(order.getEventId())
                    .seatId(seatId)
                    .status(TicketStatus.VALID)
                    .build();
                
                // Generate signed QR code
                String qrHash = qrCodeService.generateQRCode(ticket);
                ticket.setQrCodeHash(qrHash);
                
                return ticketRepository.save(ticket);
            })
            .collect(Collectors.toList());
    }
    
    private void validateReservationOwnership(PaymentCommand command) {
        for (UUID seatId : command.seatIds()) {
            if (!lockService.isLockedByUser(command.eventId(), seatId, command.userId())) {
                throw new ReservationExpiredException(seatId);
            }
        }
    }
    
    private void releaseAllLocks(List<UUID> seatIds, UUID userId) {
        seatIds.forEach(seatId -> 
            lockService.releaseSeatLock(command.eventId(), seatId, userId)
        );
    }
}
```

**Critical Rules:**
- Use `@Transactional(isolation = SERIALIZABLE)` to prevent race conditions
- ALWAYS release Redis locks after successful payment OR on error
- Generate QR codes ONLY after payment confirmation
- Store `price_snapshot` from frozen cart price, not current tier price
- Make payment processing idempotent (check for duplicate orders)

---

### 4. QR Code Security (HMAC-SHA256)

**NEVER use plain ticket IDs in QR codes:**

```java
@Component
public class QRCodeService {
    
    @Value("${neonpass.qr.secret}")
    private String secretKey;
    
    @Value("${neonpass.qr.secret.version:v1}")
    private String secretVersion;
    
    public String generateQRCode(Ticket ticket) {
        String payload = buildPayload(ticket);
        String signature = sign(payload);
        
        String qrData = String.format("%s.%s.%s", secretVersion, payload, signature);
        return Base64.getEncoder().encodeToString(qrData.getBytes());
    }
    
    public boolean validateQRCode(String qrCode, UUID ticketId) {
        try {
            String decoded = new String(Base64.getDecoder().decode(qrCode));
            String[] parts = decoded.split("\\.");
            
            if (parts.length != 3) {
                log.warn("Invalid QR code format");
                return false;
            }
            
            String version = parts[0];
            String payload = parts[1];
            String providedSignature = parts[2];
            
            // Verify signature
            String expectedSignature = sign(payload);
            
            // Timing-safe comparison to prevent timing attacks
            if (!MessageDigest.isEqual(
                    providedSignature.getBytes(),
                    expectedSignature.getBytes())) {
                log.warn("QR signature mismatch");
                return false;
            }
            
            // Verify payload contains correct ticket ID
            return payloadContainsTicketId(payload, ticketId);
            
        } catch (Exception e) {
            log.error("QR validation error", e);
            return false;
        }
    }
    
    private String sign(String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secretKey.getBytes(), "HmacSHA256"));
            byte[] hash = mac.doFinal(data.getBytes());
            return Hex.encodeHexString(hash);
        } catch (Exception e) {
            throw new QRGenerationException("Failed to sign QR code", e);
        }
    }
    
    private String buildPayload(Ticket ticket) {
        return String.format("%s:%s:%s:%d",
            ticket.getId(),
            ticket.getEventId(),
            ticket.getOrder().getUserId(),
            Instant.now().getEpochSecond()
        );
    }
    
    private boolean payloadContainsTicketId(String payload, UUID ticketId) {
        return payload.startsWith(ticketId.toString());
    }
}
```

**Critical Rules:**
- ALWAYS sign with HMAC-SHA256 (never plain hashes)
- Use timing-safe comparison (`MessageDigest.isEqual`)
- Include version prefix for key rotation
- Store signature secret in environment variables
- Rotate secrets periodically (quarterly)

---

### 5. API Rate Limiting

**Prevent abuse with token bucket algorithm:**

```java
@Configuration
public class RateLimitConfig {
    
    @Bean
    public Bucket readBucket() {
        Bandwidth limit = Bandwidth.classic(
            100, // capacity: 100 requests
            Refill.intervally(100, Duration.ofMinutes(1))
        );
        return Bucket.builder().addLimit(limit).build();
    }
    
    @Bean
    public Bucket writeBucket() {
        Bandwidth limit = Bandwidth.classic(
            10, // capacity: 10 requests
            Refill.intervally(10, Duration.ofMinutes(1))
        );
        return Bucket.builder().addLimit(limit).build();
    }
    
    @Bean
    public Bucket paymentBucket() {
        Bandwidth limit = Bandwidth.classic(
            3, // capacity: 3 requests
            Refill.intervally(3, Duration.ofMinutes(5))
        );
        return Bucket.builder().addLimit(limit).build();
    }
}

@RestController
@RequestMapping("/api/v1")
public class TicketController {
    
    private final Bucket readBucket;
    private final Bucket writeBucket;
    
    @GetMapping("/events/{id}/seats")
    public ResponseEntity<?> getSeats(@PathVariable UUID id) {
        if (!readBucket.tryConsume(1)) {
            throw new RateLimitExceededException();
        }
        // ... implementation
    }
    
    @PostMapping("/reservations")
    public ResponseEntity<?> reserve(@RequestBody ReserveCommand cmd) {
        if (!writeBucket.tryConsume(1)) {
            throw new RateLimitExceededException();
        }
        // ... implementation
    }
}
```

**Rules:**
- GET endpoints: 100 requests/minute per IP
- POST/PUT/DELETE: 10 requests/minute per user
- Payment endpoints: 3 requests/5 minutes per user
- Use Bucket4j for token bucket algorithm
- Return HTTP 429 with `Retry-After` header

---

## Concurrency Rules

### 1. Redis Lock Pattern (MANDATORY)

**ALWAYS acquire Redis lock before writing to database:**

```java
// CORRECT
boolean locked = redisLock.acquire(key, ttl);
if (locked) {
    try {
        // Write to database
        repository.save(entity);
    } finally {
        redisLock.release(key);
    }
}

// WRONG - Never write to DB without lock
repository.save(entity); // ❌ Race condition!
```

---

### 2. Transaction Isolation Levels

| Operation | Isolation Level | Why |
|-----------|----------------|-----|
| Read seats | `READ_COMMITTED` | Prevent dirty reads |
| Reserve seat | `REPEATABLE_READ` | Prevent non-repeatable reads |
| Payment processing | `SERIALIZABLE` | Prevent phantom reads |
| Reporting | `READ_UNCOMMITTED` | Performance (stale data OK) |

```java
@Transactional(isolation = Isolation.SERIALIZABLE)
public void processPayment() { ... }
```

---

### 3. Optimistic Locking (JPA)

**Use `@Version` for update conflicts:**

```java
@Entity
public class Ticket {
    @Id
    private UUID id;
    
    @Version
    private Long version; // JPA auto-manages this
    
    // If two threads try to update, second will get OptimisticLockException
}
```

---

## Testing Requirements

### 1. Coverage Minimums

- **Domain Layer:** 80% coverage (mandatory)
- **Application Layer:** 70% coverage
- **Infrastructure Layer:** 50% coverage (focus on critical paths)

---

### 2. Unit Tests

**Example: Reservation Logic**
```java
@ExtendWith(MockitoExtension.class)
class ReserveSeatUseCaseTest {
    
    @Mock private SeatRepository seatRepository;
    @Mock private RedisSeatLockService lockService;
    @Mock private EventRepository eventRepository;
    
    @InjectMocks
    private ReserveSeatUseCase useCase;
    
    @Test
    void shouldThrowExceptionWhenSeatAlreadyLocked() {
        // Given
        UUID eventId = UUID.randomUUID();
        UUID seatId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        
        when(eventRepository.findById(eventId))
            .thenReturn(Optional.of(createPublishedEvent()));
        when(seatRepository.findById(seatId))
            .thenReturn(Optional.of(createSeat()));
        when(lockService.acquireSeatLock(any(), any(), any(), any()))
            .thenReturn(false); // Lock acquisition fails
        
        ReserveSeatCommand command = new ReserveSeatCommand(eventId, seatId, userId, UUID.randomUUID());
        
        // When & Then
        assertThrows(
            SeatNotAvailableException.class,
            () -> useCase.execute(command)
        );
        
        verify(lockService).acquireSeatLock(eventId, seatId, userId, any());
        verifyNoInteractions(seatRepository); // Should not write to DB
    }
}
```

---

### 3. Concurrency Tests

**Test race conditions:**
```java
@SpringBootTest
@Testcontainers
class ConcurrencyTest {
    
    @Container
    private static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:14");
    
    @Container
    private static GenericContainer<?> redis = new GenericContainer<>("redis:7-alpine")
        .withExposedPorts(6379);
    
    @Test
    void shouldPreventDoubleSaleUnderConcurrentRequests() throws Exception {
        // Given: 100 users trying to buy the same seat
        UUID eventId = createEvent();
        UUID seatId = createSeat();
        
        CountDownLatch startSignal = new CountDownLatch(1);
        CountDownLatch doneSignal = new CountDownLatch(100);
        AtomicInteger successCount = new AtomicInteger(0);
        
        ExecutorService executor = Executors.newFixedThreadPool(100);
        
        // When: Simulate 100 concurrent reservation attempts
        for (int i = 0; i < 100; i++) {
            UUID userId = UUID.randomUUID();
            executor.submit(() -> {
                try {
                    startSignal.await(); // All threads start at once
                    reserveSeatService.reserve(eventId, seatId, userId);
                    successCount.incrementAndGet();
                } catch (SeatNotAvailableException e) {
                    // Expected for 99 users
                } finally {
                    doneSignal.countDown();
                }
            });
        }
        
        startSignal.countDown(); // Start all threads
        doneSignal.await(30, TimeUnit.SECONDS); // Wait for completion
        
        // Then: Only 1 should succeed
        assertThat(successCount.get()).isEqualTo(1);
        
        // Verify database state
        long soldCount = ticketRepository.countByEventIdAndSeatId(eventId, seatId);
        assertThat(soldCount).isEqualTo(1);
    }
}
```

---

### 4. Integration Tests (Testcontainers)

```java
@SpringBootTest
@Testcontainers
class OrderIntegrationTest {
    
    @Container
    private static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:14");
    
    @DynamicPropertySource
    static void properties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }
    
    @Autowired
    private ProcessPaymentUseCase paymentUseCase;
    
    @Test
    @Transactional
    void shouldCreateTicketAfterSuccessfulPayment() {
        // Test full payment flow with real database
        PaymentCommand command = createPaymentCommand();
        TicketDTO ticket = paymentUseCase.execute(command);
        
        assertThat(ticket).isNotNull();
        assertThat(ticket.qrCode()).isNotBlank();
        assertThat(ticket.status()).isEqualTo(TicketStatus.VALID);
    }
}
```

---

## Security Standards

### 1. Input Validation

**ALWAYS validate user input:**
```java
@PostMapping("/orders")
public ResponseEntity<?> createOrder(@Valid @RequestBody CreateOrderRequest request) {
    // @Valid triggers Bean Validation
}

public class CreateOrderRequest {
    @NotNull(message = "Event ID is required")
    private UUID eventId;
    
    @NotEmpty(message = "At least one seat must be selected")
    @Size(max = 10, message = "Maximum 10 seats per order")
    private List<UUID> seatIds;
    
    @Positive(message = "Total amount must be positive")
    private BigDecimal totalAmount;
}
```

---

### 2. SQL Injection Prevention

**NEVER use string concatenation in queries:**
```java
// WRONG ❌
String query = "SELECT * FROM seats WHERE id = '" + seatId + "'";

// CORRECT ✅
@Query("SELECT s FROM Seat s WHERE s.id = :seatId")
Seat findBySeatId(@Param("seatId") UUID seatId);
```

---

### 3. Secrets Management

**Never hardcode secrets:**
```java
// WRONG ❌
String apiKey = "sk_live_abc123";

// CORRECT ✅
@Value("${stripe.api.key}")
private String stripeApiKey;
```

**Use environment variables or secret managers (AWS Secrets Manager, Vault).**

---

## Performance Guidelines

### 1. N+1 Query Prevention

**Use `@EntityGraph` or JOIN FETCH:**
```java
// WRONG ❌ - Triggers N+1 queries
List<Order> orders = orderRepository.findAll();
orders.forEach(order -> order.getTickets().size()); // Lazy load per order

// CORRECT ✅
@EntityGraph(attributePaths = {"tickets"})
List<Order> findAllWithTickets();
```

---

### 2. Pagination for Large Results

**ALWAYS paginate large datasets:**
```java
// WRONG ❌
List<Event> events = eventRepository.findAll(); // 10,000 events

// CORRECT ✅
Pageable pageable = PageRequest.of(0, 20);
Page<Event> events = eventRepository.findAll(pageable);
```

---

### 3. Database Connection Pooling

**Configure HikariCP:**
```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 30000
      idle-timeout: 600000
```

---

## Code Quality Checklist

- [ ] All entities use UUID primary keys
- [ ] Soft deletes implemented (no hard deletes)
- [ ] Audit fields present (createdAt, updatedAt, createdBy)
- [ ] Redis locks acquired before DB writes
- [ ] Transaction isolation appropriate for operation
- [ ] Input validation with Bean Validation
- [ ] SQL injection prevention (no string concatenation)
- [ ] Secrets externalized (environment variables)
- [ ] Unit tests with 80% domain coverage
- [ ] Concurrency tests for critical paths
- [ ] N+1 queries prevented
- [ ] Large results paginated
- [ ] Rate limiting configured
- [ ] Error handling with custom exceptions
- [ ] Logging at appropriate levels
