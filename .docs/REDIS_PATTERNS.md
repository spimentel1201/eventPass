# Redis Patterns & Data Structures

## Purpose
Redis serves as the **concurrency control layer** to prevent race conditions during high-traffic ticket sales. It acts as a distributed lock manager and temporary state store.

---

## Table of Contents
1. [Key Naming Conventions](#key-naming-conventions)
2. [Pattern 1: Seat Locking](#pattern-1-seat-locking-atomic-reservation)
3. [Pattern 2: General Admission Counter](#pattern-2-general-admission-counter)
4. [Pattern 3: Shopping Cart](#pattern-3-shopping-cart-session-storage)
5. [Pattern 4: Event Cache](#pattern-4-event-metadata-cache)
6. [Monitoring & Cleanup](#monitoring--cleanup)
7. [Error Handling](#error-handling)
8. [Testing Redis Patterns](#testing-redis-patterns)

---

## Key Naming Conventions

### Format
```
{domain}:{action}:{identifier1}:{identifier2}
```

### Standards
- Use **lowercase** for consistency
- Use **colons** (`:`) as separators (not dots or underscores)
- Include **entity type** first, then **action**, then **identifiers**
- UUIDs should be in full format (no hyphens removal)

---

### Examples

| Pattern | Key Format | Example |
|---------|-----------|---------|
| Seat Lock | `seat:lock:{eventId}:{seatId}` | `seat:lock:550e8400-e29b-41d4-a716-446655440000:123e4567-e89b-12d3-a456-426614174000` |
| General Counter | `section:counter:{eventId}:{sectionId}` | `section:counter:550e8400-...:abc12345-...` |
| User Cart | `cart:{userId}` | `cart:user123e4567-...` |
| Event Cache | `event:cache:{eventId}` | `event:cache:550e8400-...` |
| User Session | `session:{sessionId}` | `session:sess_a1b2c3d4e5` |

---

## Pattern 1: Seat Locking (Atomic Reservation)

### Business Requirement
When a user selects a seat, it must be **locked exclusively** for 10 minutes to prevent other users from purchasing it. If the user doesn't complete payment within this time, the lock expires automatically.

---

### Data Structure

```
Key:   seat:lock:{eventId}:{seatId}
Value: {"userId": "abc-123", "expiresAt": "2026-01-15T10:30:00Z", "cartId": "cart-456"}
TTL:   600 seconds (10 minutes)
```

**Example:**
```
Key:   seat:lock:550e8400-e29b-41d4-a716-446655440000:123e4567-e89b-12d3-a456-426614174000
Value: {"userId":"user-789","expiresAt":"2026-01-15T10:40:00Z","cartId":"cart-abc"}
TTL:   600
```

---

### Java Implementation

#### Acquire Lock (Reserve Seat)
```java
@Service
public class RedisSeatLockService {
    
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;
    
    private static final long LOCK_TTL_SECONDS = 600; // 10 minutes
    
    public boolean acquireSeatLock(UUID eventId, UUID seatId, UUID userId, UUID cartId) {
        String key = buildLockKey(eventId, seatId);
        String value = buildLockValue(userId, cartId);
        
        // SETNX with TTL (atomic operation)
        Boolean success = redisTemplate.opsForValue().setIfAbsent(
            key, 
            value, 
            Duration.ofSeconds(LOCK_TTL_SECONDS)
        );
        
        if (Boolean.TRUE.equals(success)) {
            log.info("Lock acquired: {} by user {}", key, userId);
            return true;
        }
        
        log.warn("Lock acquisition failed: {} (already locked)", key);
        return false;
    }
    
    private String buildLockKey(UUID eventId, UUID seatId) {
        return String.format("seat:lock:%s:%s", eventId, seatId);
    }
    
    private String buildLockValue(UUID userId, UUID cartId) {
        try {
            Map<String, String> lockData = Map.of(
                "userId", userId.toString(),
                "cartId", cartId.toString(),
                "expiresAt", LocalDateTime.now().plusSeconds(LOCK_TTL_SECONDS).toString()
            );
            return objectMapper.writeValueAsString(lockData);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize lock value", e);
        }
    }
}
```

---

#### Release Lock (After Payment or Cancellation)
```java
public void releaseSeatLock(UUID eventId, UUID seatId, UUID userId) {
    String key = buildLockKey(eventId, seatId);
    
    // Verify ownership before deleting
    String currentValue = redisTemplate.opsForValue().get(key);
    
    if (currentValue != null) {
        try {
            Map<String, String> lockData = objectMapper.readValue(currentValue, Map.class);
            
            if (userId.toString().equals(lockData.get("userId"))) {
                redisTemplate.delete(key);
                log.info("Lock released: {} by user {}", key, userId);
            } else {
                log.warn("Lock release denied: {} (owner mismatch)", key);
            }
        } catch (JsonProcessingException e) {
            log.error("Failed to parse lock value", e);
        }
    }
}
```

---

#### Extend Lock (If User Requests More Time)
```java
public boolean extendSeatLock(UUID eventId, UUID seatId, UUID userId) {
    String key = buildLockKey(eventId, seatId);
    
    String currentValue = redisTemplate.opsForValue().get(key);
    if (currentValue == null) {
        return false; // Lock expired
    }
    
    // Verify ownership
    try {
        Map<String, String> lockData = objectMapper.readValue(currentValue, Map.class);
        
        if (!userId.toString().equals(lockData.get("userId"))) {
            return false; // Not the owner
        }
        
        // Reset TTL
        return Boolean.TRUE.equals(
            redisTemplate.expire(key, Duration.ofSeconds(LOCK_TTL_SECONDS))
        );
        
    } catch (JsonProcessingException e) {
        return false;
    }
}
```

---

### Critical Rules

1. **ALWAYS use SETNX (`setIfAbsent`)** for atomic lock acquisition
2. **ALWAYS set TTL** when creating locks to prevent orphaned locks
3. **Verify ownership** before releasing locks
4. **Release locks on payment failure** to free seats immediately
5. **Never delete locks without verification** (could release someone else's lock)

---

### Use Case Flow

```
1. User selects seat A1
   → POST /api/v1/reservations
   → Try Redis: SETNX seat:lock:{eventId}:A1 {userId} EX 600
   
2a. If SUCCESS (lock acquired):
   → Return 200 OK with expiresAt timestamp
   → User proceeds to payment
   
2b. If FAILURE (already locked):
   → Return 409 Conflict "Seat not available"
   → User selects different seat

3. User completes payment:
   → POST /api/v1/orders
   → Verify lock still exists and belongs to this user
   → Create ticket in PostgreSQL
   → DEL seat:lock:{eventId}:A1 (release lock)

4. User abandons cart:
   → After 10 minutes, Redis auto-expires the lock
   → Seat becomes available again
```

---

## Pattern 2: General Admission Counter

### Business Requirement
For standing/general admission areas (no specific seats), track how many spots are reserved to prevent overbooking.

---

### Data Structure

```
Key:   section:counter:{eventId}:{sectionId}
Value: 47  (integer - current reserved count)
TTL:   24 hours (or event end time)
```

---

### Java Implementation

#### Reserve Spot
```java
public boolean reserveGeneralAdmissionSpot(UUID eventId, UUID sectionId, int maxCapacity) {
    String key = String.format("section:counter:%s:%s", eventId, sectionId);
    
    // Atomic increment
    Long currentCount = redisTemplate.opsForValue().increment(key, 1);
    
    if (currentCount == null || currentCount > maxCapacity) {
        // Rollback the increment
        redisTemplate.opsForValue().decrement(key, 1);
        log.warn("General admission full: {} (capacity: {})", key, maxCapacity);
        return false;
    }
    
    // Set expiration on first reservation
    if (currentCount == 1) {
        redisTemplate.expire(key, Duration.ofHours(24));
    }
    
    log.info("General admission reserved: {} (count: {}/{})", key, currentCount, maxCapacity);
    return true;
}
```

---

#### Release Spot (After Payment Failure)
```java
public void releaseGeneralAdmissionSpot(UUID eventId, UUID sectionId) {
    String key = String.format("section:counter:%s:%s", eventId, sectionId);
    
    Long newCount = redisTemplate.opsForValue().decrement(key, 1);
    
    // Prevent negative counts
    if (newCount != null && newCount < 0) {
        redisTemplate.opsForValue().set(key, "0");
    }
}
```

---

#### Get Available Spots
```java
public int getAvailableSpots(UUID eventId, UUID sectionId, int maxCapacity) {
    String key = String.format("section:counter:%s:%s", eventId, sectionId);
    
    String value = redisTemplate.opsForValue().get(key);
    int reserved = (value != null) ? Integer.parseInt(value) : 0;
    
    return Math.max(0, maxCapacity - reserved);
}
```

---

### Critical Rules

1. **Use INCR/DECR** for atomic operations (thread-safe)
2. **Always check capacity** after incrementing (race condition prevention)
3. **Rollback on overflow** (decrement if capacity exceeded)
4. **Set TTL on first use** to prevent stale counters
5. **Never allow negative counts** (add safeguard in decrement)

---

## Pattern 3: Shopping Cart (Session Storage)

### Business Requirement
Store user's cart temporarily (selected seats, prices) with automatic expiration if abandoned.

---

### Data Structure

```
Key:   cart:{userId}
Value: {
  "items": [
    {
      "seatId": "123e4567-...",
      "sectionId": "abc12345-...",
      "price": 50.00,
      "lockedUntil": "2026-01-15T10:40:00Z"
    }
  ],
  "total": 150.00,
  "currency": "USD"
}
TTL:   600 seconds (10 minutes)
```

---

### Java Implementation

#### Add to Cart
```java
public void addToCart(UUID userId, CartItemDTO item) {
    String key = "cart:" + userId;
    
    String currentCartJson = redisTemplate.opsForValue().get(key);
    Cart cart = (currentCartJson != null) 
        ? objectMapper.readValue(currentCartJson, Cart.class)
        : new Cart();
    
    cart.addItem(item);
    cart.recalculateTotal();
    
    String updatedCartJson = objectMapper.writeValueAsString(cart);
    
    redisTemplate.opsForValue().set(
        key,
        updatedCartJson,
        Duration.ofSeconds(600)
    );
    
    log.info("Cart updated for user {}: {} items", userId, cart.getItems().size());
}
```

---

#### Get Cart
```java
public Cart getCart(UUID userId) {
    String key = "cart:" + userId;
    String cartJson = redisTemplate.opsForValue().get(key);
    
    if (cartJson == null) {
        return new Cart(); // Empty cart
    }
    
    try {
        return objectMapper.readValue(cartJson, Cart.class);
    } catch (JsonProcessingException e) {
        log.error("Failed to deserialize cart for user {}", userId, e);
        return new Cart();
    }
}
```

---

#### Clear Cart (After Purchase)
```java
public void clearCart(UUID userId) {
    String key = "cart:" + userId;
    redisTemplate.delete(key);
    log.info("Cart cleared for user {}", userId);
}
```

---

### Critical Rules

1. **Always reset TTL** when cart is modified
2. **Validate prices** against current tier prices before checkout
3. **Clear cart immediately** after successful payment
4. **Store frozen prices** in cart (not live prices)

---

## Pattern 4: Event Metadata Cache

### Business Requirement
Cache frequently accessed event data (title, venue, sections) to reduce database load.

---

### Data Structure

```
Key:   event:cache:{eventId}
Value: {JSON serialized Event entity}
TTL:   3600 seconds (1 hour)
```

---

### Java Implementation

#### Cache-Aside Pattern
```java
public Event getEventById(UUID eventId) {
    String key = "event:cache:" + eventId;
    
    // Try cache first
    String cachedJson = redisTemplate.opsForValue().get(key);
    if (cachedJson != null) {
        log.debug("Cache HIT: {}", key);
        return objectMapper.readValue(cachedJson, Event.class);
    }
    
    // Cache MISS - load from database
    log.debug("Cache MISS: {}", key);
    Event event = eventRepository.findById(eventId)
        .orElseThrow(() -> new EventNotFoundException(eventId));
    
    // Write to cache
    String eventJson = objectMapper.writeValueAsString(event);
    redisTemplate.opsForValue().set(key, eventJson, Duration.ofHours(1));
    
    return event;
}
```

---

#### Invalidate Cache (On Update)
```java
public void updateEvent(Event event) {
    eventRepository.save(event);
    
    // Invalidate cache
    String key = "event:cache:" + event.getId();
    redisTemplate.delete(key);
    
    log.info("Event updated and cache invalidated: {}", event.getId());
}
```

---

### Cache Strategy

| Strategy | When to Use | Pros | Cons |
|----------|------------|------|------|
| **Cache-Aside** | Read-heavy, infrequent updates | Simple, consistent | Cache misses impact latency |
| **Write-Through** | Consistent reads required | Always fresh | Write latency increases |
| **Write-Behind** | High write throughput | Fast writes | Risk of data loss |

**NeonPass uses Cache-Aside** because event metadata changes infrequently.

---

## Monitoring & Cleanup

### Key Metrics to Track

```java
@Scheduled(fixedRate = 60000) // Every minute
public void reportRedisMetrics() {
    // Lock count
    Set<String> seatLocks = redisTemplate.keys("seat:lock:*");
    log.info("Active seat locks: {}", seatLocks.size());
    
    // Cart count
    Set<String> carts = redisTemplate.keys("cart:*");
    log.info("Active shopping carts: {}", carts.size());
    
    // Memory usage
    Properties info = redisTemplate.getConnectionFactory()
        .getConnection()
        .info("memory");
    log.info("Redis memory: {}", info.getProperty("used_memory_human"));
}
```

---

### Cleanup Orphaned Locks

```java
@Scheduled(fixedRate = 300000) // Every 5 minutes
public void cleanupOrphanedLocks() {
    Set<String> keys = redisTemplate.keys("seat:lock:*");
    int orphanedCount = 0;
    
    for (String key : keys) {
        Long ttl = redisTemplate.getExpire(key, TimeUnit.SECONDS);
        
        // Keys without TTL are orphaned (shouldn't happen, but safety net)
        if (ttl == null || ttl == -1) {
            redisTemplate.delete(key);
            orphanedCount++;
            log.warn("Deleted orphaned lock: {}", key);
        }
    }
    
    if (orphanedCount > 0) {
        log.warn("Cleaned up {} orphaned locks", orphanedCount);
    }
}
```

---

### Alerts to Configure

- **High lock contention:** > 50% lock acquisition failures
- **Memory usage:** > 80% of max memory
- **Slow operations:** Any Redis command taking > 100ms
- **Connection pool exhaustion:** All connections in use
- **Orphaned keys:** Keys without TTL detected

---

## Error Handling

### Connection Failures

```java
@Retryable(
    value = RedisConnectionException.class,
    maxAttempts = 3,
    backoff = @Backoff(delay = 100, multiplier = 2)
)
public boolean acquireLock(UUID eventId, UUID seatId, UUID userId) {
    // Implementation...
}

@Recover
public boolean recoverFromRedisFailure(RedisConnectionException e, UUID eventId, UUID seatId, UUID userId) {
    log.error("Redis unavailable after retries, failing gracefully", e);
    // Send alert to ops team
    alertService.sendCritical("Redis connection failed for seat reservation");
    return false; // Deny reservation
}
```

---

### Fallback Strategy

**If Redis is completely down:**

1. **Log critical error** (alert ops team immediately)
2. **Return HTTP 503** (Service Unavailable)
3. **Do NOT allow reservations** without locks
4. **Display maintenance message** to users

**Why not fallback to database locks?**
- Database locks are slower (contention issues)
- Risk of race conditions if transitioning mid-transaction
- Better to fail safe than risk double-booking

---

### Circuit Breaker Pattern

```java
@Configuration
public class RedisCircuitBreakerConfig {
    
    @Bean
    public Customizer<Resilience4JCircuitBreakerFactory> circuitBreakerCustomizer() {
        return factory -> factory.configureDefault(id -> new Resilience4JConfigBuilder(id)
            .circuitBreakerConfig(CircuitBreakerConfig.custom()
                .failureRateThreshold(50) // Open if 50% failures
                .waitDurationInOpenState(Duration.ofSeconds(30))
                .permittedNumberOfCallsInHalfOpenState(3)
                .slidingWindowSize(10)
                .build())
            .build());
    }
}
```

---

## Testing Redis Patterns

### Unit Tests with Embedded Redis

```java
@SpringBootTest
@TestPropertySource(properties = {
    "spring.redis.host=localhost",
    "spring.redis.port=6370" // Different port for tests
})
class RedisSeatLockServiceTest {
    
    @Autowired
    private RedisSeatLockService lockService;
    
    @Autowired
    private RedisTemplate<String, String> redisTemplate;
    
    @BeforeEach
    void clearRedis() {
        redisTemplate.getConnectionFactory().getConnection().flushAll();
    }
    
    @Test
    void shouldAcquireLockSuccessfully() {
        // Given
        UUID eventId = UUID.randomUUID();
        UUID seatId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        
        // When
        boolean acquired = lockService.acquireSeatLock(eventId, seatId, userId, UUID.randomUUID());
        
        // Then
        assertThat(acquired).isTrue();
        
        String key = String.format("seat:lock:%s:%s", eventId, seatId);
        String value = redisTemplate.opsForValue().get(key);
        assertThat(value).isNotNull();
        assertThat(value).contains(userId.toString());
    }
    
    @Test
    void shouldPreventDoubleLockAcquisition() {
        // Given
        UUID eventId = UUID.randomUUID();
        UUID seatId = UUID.randomUUID();
        UUID user1 = UUID.randomUUID();
        UUID user2 = UUID.randomUUID();
        
        // When
        boolean lock1 = lockService.acquireSeatLock(eventId, seatId, user1, UUID.randomUUID());
        boolean lock2 = lockService.acquireSeatLock(eventId, seatId, user2, UUID.randomUUID());
        
        // Then
        assertThat(lock1).isTrue();
        assertThat(lock2).isFalse(); // Second user denied
    }
    
    @Test
    void shouldAutoExpireLockAfterTTL() throws InterruptedException {
        // Given
        UUID eventId = UUID.randomUUID();
        UUID seatId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        
        lockService.acquireSeatLock(eventId, seatId, userId, UUID.randomUUID());
        
        // When
        Thread.sleep(11000); // Wait 11 seconds (TTL is 10 seconds in test config)
        
        // Then
        String key = String.format("seat:lock:%s:%s", eventId, seatId);
        String value = redisTemplate.opsForValue().get(key);
        assertThat(value).isNull(); // Lock expired
    }
}
```

---

### Integration Tests with Testcontainers

```java
@SpringBootTest
@Testcontainers
class RedisIntegrationTest {
    
    @Container
    private static final GenericContainer<?> redis = 
        new GenericContainer<>("redis:7-alpine")
            .withExposedPorts(6379);
    
    @DynamicPropertySource
    static void redisProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.redis.host", redis::getHost);
        registry.add("spring.redis.port", redis::getFirstMappedPort);
    }
    
    @Test
    void shouldHandleConcurrentLockAttempts() throws InterruptedException {
        // Simulate 100 users trying to buy the same seat
        UUID eventId = UUID.randomUUID();
        UUID seatId = UUID.randomUUID();
        
        CountDownLatch latch = new CountDownLatch(100);
        AtomicInteger successCount = new AtomicInteger(0);
        
        ExecutorService executor = Executors.newFixedThreadPool(100);
        
        for (int i = 0; i < 100; i++) {
            executor.submit(() -> {
                try {
                    boolean acquired = lockService.acquireSeatLock(
                        eventId, 
                        seatId, 
                        UUID.randomUUID(),
                        UUID.randomUUID()
                    );
                    
                    if (acquired) {
                        successCount.incrementAndGet();
                    }
                } finally {
                    latch.countDown();
                }
            });
        }
        
        latch.await(10, TimeUnit.SECONDS);
        
        // Only 1 should succeed
        assertThat(successCount.get()).isEqualTo(1);
    }
}
```

---

## Redis Configuration (application.yml)

```yaml
spring:
  redis:
    host: ${REDIS_HOST:localhost}
    port: ${REDIS_PORT:6379}
    password: ${REDIS_PASSWORD:}
    timeout: 2000ms
    
    lettuce:
      pool:
        max-active: 20
        max-idle: 10
        min-idle: 5
        max-wait: 2000ms
      
    # Cluster configuration (production)
    cluster:
      nodes:
        - ${REDIS_NODE_1}
        - ${REDIS_NODE_2}
        - ${REDIS_NODE_3}
      max-redirects: 3
```

---

## Production Checklist

- [ ] Redis persistence enabled (AOF + RDB)
- [ ] Connection pooling configured (Lettuce)
- [ ] Monitoring alerts set up (memory, latency, connections)
- [ ] Backup strategy in place (daily snapshots)
- [ ] Cluster mode for high availability (3+ nodes)
- [ ] Circuit breaker configured for failures
- [ ] Cleanup jobs scheduled (orphaned keys)
- [ ] TTL set on ALL temporary data
- [ ] Key naming conventions documented
- [ ] Load testing completed (10K concurrent locks)
