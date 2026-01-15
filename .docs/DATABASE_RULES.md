# Database Design Rules & Patterns

## Schema Version: 2.1
**Last Updated:** January 2026  
**Database:** PostgreSQL 14+  
**Extensions Required:** uuid-ossp

---

## Table of Contents
1. [Core Principles](#core-principles)
2. [Table Relationships](#table-relationships)
3. [Critical Queries](#critical-queries)
4. [Index Strategy](#index-strategy)
5. [Materialized Views](#materialized-views)
6. [Migration Rules](#migration-rules)
7. [Performance Targets](#performance-targets)

---

## Core Principles

### 1. UUID Primary Keys
**Rule:** All entities use UUID v4 to prevent enumeration attacks and simplify distributed systems.

```sql
CREATE TABLE example (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- other fields
);
```

**Why?**
- Sequential IDs expose business metrics (total users, order volume)
- UUIDs allow client-side ID generation for offline-first apps
- No coordination needed across multiple database instances

---

### 2. Soft Deletes
**Rule:** Use `deleted` boolean flag instead of hard deletes for user-facing data.

```sql
CREATE TABLE seats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- business fields
    deleted BOOLEAN DEFAULT FALSE
);

-- Always filter in queries
SELECT * FROM seats WHERE deleted = FALSE;
```

**Exceptions:** Log tables, cache tables, truly ephemeral data can use hard deletes.

---

### 3. Audit Trails
**Rule:** All tables include temporal metadata.

```sql
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

**For JPA/Hibernate:**
```java
@CreatedDate
@Column(nullable = false, updatable = false)
private LocalDateTime createdAt;

@LastModifiedDate
private LocalDateTime updatedAt;
```

---

### 4. Unique Constraints at DB Level
**Rule:** Enforce critical business rules with database constraints, not just application logic.

```sql
-- Prevent double-booking
UNIQUE(event_id, seat_id) ON tickets

-- Prevent duplicate section names in same venue
UNIQUE(venue_id, name) ON sections

-- Physical constraint
UNIQUE(section_id, row_label, number_label) ON seats
```

**Why?** Application bugs or race conditions can't violate these rules.

---

## Table Relationships

### Hierarchical Structure (Physical Layer)

```
Organization (Tenant/Client)
  └── Venue (Stadium/Theater)
       └── Section (Zone/Area)
            └── Seat (Individual Numbered Seat)
```

**Key Points:**
- A **Venue** belongs to one **Organization** (multi-tenant isolation)
- A **Section** belongs to one **Venue** (e.g., "North Stand", "VIP Box")
- A **Seat** belongs to one **Section** (numbered seats only, not general admission)

---

### Event Layer (Temporal Instance)

```
Event (Concert on specific date)
  ├── Event_Section (Which sections are active for this event)
  ├── Ticket_Tier (Pricing per section: Early Bird, Regular, VIP)
  └── Order (User's purchase)
       └── Ticket (Individual entry pass with QR code)
```

**Key Points:**
- An **Event** references a **Venue** but can selectively activate sections
- A **Ticket_Tier** connects an Event to a Section with a price
- A **Ticket** links to either a **Seat** (numbered) or just a **Ticket_Tier** (general admission)

---

### Commerce Flow

```
User → Order → Ticket(s)
             ↓
          Payment Intent (Stripe)
```

**Status Flow:**
1. Order created with `status = PENDING`
2. Payment Intent created in Stripe
3. If payment succeeds: `status = PAID`, tickets generated
4. If payment fails: `status = FAILED`, Redis locks released

---

## Critical Queries

### 1. Get Available Seats in a Section

**Purpose:** Display seat map with real-time availability

```sql
SELECT 
    s.id,
    s.row_label,
    s.number_label,
    s.x_position,
    s.y_position,
    s.is_accessible
FROM seats s
WHERE s.section_id = :sectionId
  AND s.deleted = false
  AND NOT EXISTS (
      SELECT 1 
      FROM tickets t 
      WHERE t.seat_id = s.id 
        AND t.event_id = :eventId 
        AND t.status IN ('VALID', 'USED')
  )
ORDER BY s.row_label, s.number_label;
```

**Performance:**
- Uses `NOT EXISTS` (more efficient than `LEFT JOIN` for large datasets)
- Index on `(section_id, row_label, number_label)` speeds up ordering
- Index on `(event_id, seat_id, status)` on tickets table

**Expected Time:** < 100ms for 1,000 seats

---

### 2. Check General Admission Availability

**Purpose:** Display remaining capacity for standing areas

```sql
SELECT 
    s.id AS section_id,
    s.name AS section_name,
    s.capacity AS total_capacity,
    COALESCE(COUNT(t.id), 0) AS tickets_sold,
    (s.capacity - COALESCE(COUNT(t.id), 0)) AS available
FROM sections s
LEFT JOIN ticket_tiers tt ON tt.section_id = s.id AND tt.event_id = :eventId
LEFT JOIN tickets t ON t.ticket_tier_id = tt.id AND t.status = 'VALID'
WHERE s.id = :sectionId 
  AND s.type = 'GENERAL'
  AND s.deleted = false
GROUP BY s.id, s.name, s.capacity;
```

**Performance:**
- Consider using a materialized view (see below) for high-traffic events
- Refresh materialized view after each ticket purchase

---

### 3. Get Event with Active Sections

**Purpose:** Load event page with only activated sections

```sql
SELECT 
    e.id AS event_id,
    e.title,
    e.start_time,
    s.id AS section_id,
    s.name AS section_name,
    s.type AS section_type,
    es.is_active,
    COALESCE(es.custom_capacity, s.capacity) AS effective_capacity
FROM events e
INNER JOIN event_sections es ON es.event_id = e.id
INNER JOIN sections s ON s.id = es.section_id
WHERE e.id = :eventId
  AND es.is_active = true
  AND e.status = 'PUBLISHED'
  AND s.deleted = false;
```

**Why event_sections table?**
- Allows organizers to close specific sections (e.g., construction, VIP-only)
- Enables capacity overrides per event (e.g., reduce from 1000 to 500 for safety)

---

### 4. Validate Ticket at Gate (Mobile App)

**Purpose:** Staff app scans QR code and validates in real-time

```sql
SELECT 
    t.id,
    t.status,
    t.scanned_at,
    e.title AS event_name,
    e.start_time,
    u.full_name AS attendee_name,
    s.row_label,
    s.number_label
FROM tickets t
INNER JOIN events e ON e.id = t.event_id
INNER JOIN orders o ON o.id = t.order_id
INNER JOIN users u ON u.id = o.user_id
LEFT JOIN seats s ON s.id = t.seat_id
WHERE t.qr_code_hash = :qrHash
  AND t.status IN ('VALID', 'USED')
FOR UPDATE; -- Lock row during validation
```

**Critical:**
- `FOR UPDATE` prevents race condition (two staff scanning same ticket)
- Update `status = 'USED'` and `scanned_at = NOW()` in same transaction
- If already `USED`, reject with "Ticket already scanned"

---

### 5. Get User's Order History

**Purpose:** "My Tickets" page in user dashboard

```sql
SELECT 
    o.id AS order_id,
    o.created_at AS purchase_date,
    o.total_amount,
    o.status AS order_status,
    e.title AS event_name,
    e.start_time,
    COUNT(t.id) AS ticket_count
FROM orders o
INNER JOIN events e ON e.id = o.event_id
INNER JOIN tickets t ON t.order_id = o.id
WHERE o.user_id = :userId
  AND o.status IN ('PAID', 'PENDING')
GROUP BY o.id, o.created_at, o.total_amount, o.status, e.title, e.start_time
ORDER BY o.created_at DESC
LIMIT 20 OFFSET :offset;
```

**Pagination:** Use `LIMIT`/`OFFSET` or cursor-based pagination for large histories.

---

## Index Strategy

### High-Concurrency Indexes

```sql
-- 1. Seat map rendering (spatial queries)
CREATE INDEX idx_seats_position 
ON seats(section_id, x_position, y_position)
WHERE deleted = false;

-- 2. Availability checks (most frequent query)
CREATE INDEX idx_tickets_status_event 
ON tickets(event_id, status)
WHERE status IN ('VALID', 'USED');

-- 3. User order lookups
CREATE INDEX idx_orders_user_status 
ON orders(user_id, status, created_at DESC);

-- 4. Event filtering (admin dashboard)
CREATE INDEX idx_events_org_status 
ON events(organization_id, status, start_time)
WHERE deleted = false;

-- 5. Section activation mapping
CREATE INDEX idx_event_sections_event 
ON event_sections(event_id, is_active);

-- 6. QR code validation (critical path)
CREATE INDEX idx_tickets_qr_hash 
ON tickets(qr_code_hash);

-- 7. Audit trail lookups
CREATE INDEX idx_ticket_validations_ticket 
ON ticket_validations(ticket_id, validated_at DESC);
```

---

### Index Maintenance

**Rule:** Monitor index bloat monthly
```sql
-- Check index size
SELECT 
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
ORDER BY pg_relation_size(indexrelid) DESC;

-- Rebuild bloated indexes
REINDEX INDEX CONCURRENTLY idx_tickets_status_event;
```

---

## Materialized Views

### Section Availability (for General Admission)

**Purpose:** Pre-compute availability for fast dashboard loading

```sql
CREATE MATERIALIZED VIEW section_availability AS
SELECT 
    s.id AS section_id,
    s.name AS section_name,
    s.venue_id,
    s.type AS section_type,
    s.capacity AS total_capacity,
    COALESCE(COUNT(t.id) FILTER (WHERE t.status = 'VALID'), 0) AS tickets_sold,
    (s.capacity - COALESCE(COUNT(t.id) FILTER (WHERE t.status = 'VALID'), 0)) AS available
FROM sections s
LEFT JOIN ticket_tiers tt ON tt.section_id = s.id
LEFT JOIN tickets t ON t.ticket_tier_id = tt.id
WHERE s.type = 'GENERAL' 
  AND s.deleted = false
GROUP BY s.id, s.name, s.venue_id, s.type, s.capacity;

-- Create unique index for faster refresh
CREATE UNIQUE INDEX idx_section_availability_section 
ON section_availability(section_id);
```

**Refresh Strategy:**
```sql
-- After ticket purchase/cancellation
REFRESH MATERIALIZED VIEW CONCURRENTLY section_availability;
```

**When to refresh:**
- After every order with `status = PAID`
- After ticket cancellation
- Scheduled job every 5 minutes as fallback

---

### Event Statistics (for Admin Dashboard)

```sql
CREATE MATERIALIZED VIEW event_stats AS
SELECT 
    e.id AS event_id,
    e.title,
    e.start_time,
    COUNT(DISTINCT o.id) AS total_orders,
    COUNT(t.id) AS tickets_sold,
    SUM(o.total_amount) AS gross_revenue,
    SUM(o.platform_fee) AS platform_fees,
    SUM(o.net_amount) AS net_revenue
FROM events e
LEFT JOIN orders o ON o.event_id = e.id AND o.status = 'PAID'
LEFT JOIN tickets t ON t.order_id = o.id
WHERE e.deleted = false
GROUP BY e.id, e.title, e.start_time;

-- Refresh daily or on-demand
REFRESH MATERIALIZED VIEW event_stats;
```

---

## Migration Rules

### 1. Never Drop Columns in Production
**Instead:** Mark as deprecated, remove in next major version

```sql
-- BAD
ALTER TABLE users DROP COLUMN phone_number;

-- GOOD
ALTER TABLE users RENAME COLUMN phone_number TO phone_number_deprecated;
COMMENT ON COLUMN users.phone_number_deprecated IS 'Deprecated 2026-01-15, remove in v3.0';
```

---

### 2. Always Add Columns as Nullable First
**Then:** Backfill data, add NOT NULL constraint

```sql
-- Step 1: Add nullable column
ALTER TABLE tickets ADD COLUMN price_snapshot DECIMAL(10, 2);

-- Step 2: Backfill existing data
UPDATE tickets 
SET price_snapshot = tt.price
FROM ticket_tiers tt
WHERE tickets.ticket_tier_id = tt.id
  AND tickets.price_snapshot IS NULL;

-- Step 3: Add NOT NULL constraint (after verifying no nulls remain)
ALTER TABLE tickets ALTER COLUMN price_snapshot SET NOT NULL;
```

---

### 3. Use Transactions for Schema Changes

```sql
BEGIN;

ALTER TABLE sections ADD COLUMN display_order INT;
UPDATE sections SET display_order = ROW_NUMBER() OVER (PARTITION BY venue_id ORDER BY name);
ALTER TABLE sections ALTER COLUMN display_order SET NOT NULL;

COMMIT;
```

---

### 4. Test Migrations on Staging with Production Data Volume

**Before production deployment:**
1. Restore latest production backup to staging
2. Run migration script
3. Measure execution time
4. Verify no data loss with checksums
5. Test application against migrated schema

---

### 5. Keep Rollback Scripts Ready

**For every migration:**
```sql
-- UP migration (deploy.sql)
ALTER TABLE tickets ADD COLUMN price_snapshot DECIMAL(10, 2) NOT NULL;

-- DOWN migration (rollback.sql)
ALTER TABLE tickets DROP COLUMN price_snapshot;
```

Store in version control: `db/migrations/v2.1/001_add_price_snapshot_up.sql`

---

## Performance Targets

| Operation | Target | Notes |
|-----------|--------|-------|
| Seat availability query | < 100ms | For 1,000 seats |
| Ticket creation | < 200ms | Including DB write + Redis lock |
| Complex aggregations | < 500ms | Event stats, revenue reports |
| Materialized view refresh | < 5s | For 50,000 tickets |
| QR code validation | < 50ms | Critical path, includes row lock |

---

## Monitoring Queries

### Slow Queries (Enable pg_stat_statements)
```sql
SELECT 
    query,
    calls,
    mean_exec_time,
    max_exec_time
FROM pg_stat_statements
WHERE mean_exec_time > 100 -- ms
ORDER BY mean_exec_time DESC
LIMIT 10;
```

---

### Table Bloat
```sql
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
    n_dead_tup AS dead_tuples
FROM pg_stat_user_tables
WHERE n_dead_tup > 1000
ORDER BY n_dead_tup DESC;
```

**Solution:** `VACUUM ANALYZE table_name;`

---

### Connection Pool Health
```sql
SELECT 
    datname,
    count(*) AS connections,
    sum(CASE WHEN state = 'active' THEN 1 ELSE 0 END) AS active,
    sum(CASE WHEN state = 'idle' THEN 1 ELSE 0 END) AS idle
FROM pg_stat_activity
GROUP BY datname;
```

**Alert:** If `active/total > 0.8`, increase pool size.

---

## Backup & Recovery

### Daily Backup Schedule
```bash
# Full backup (retain 30 days)
pg_dump -h localhost -U neonpass_admin -Fc neonpass_prod > backup_$(date +%Y%m%d).dump

# Incremental WAL archiving
archive_command = 'cp %p /backups/wal/%f'
```

### Point-in-Time Recovery
```bash
# Restore to specific timestamp
pg_restore -d neonpass_prod -t 2026-01-15T10:30:00 backup_20260115.dump
```

---

## Security Checklist

- [ ] All sensitive fields encrypted at rest (use pgcrypto)
- [ ] Row-Level Security (RLS) enabled for multi-tenant isolation
- [ ] Connection pooling with SSL/TLS
- [ ] Database user has minimal privileges (no SUPERUSER)
- [ ] Audit logging enabled for DDL changes
- [ ] Regular pg_dump backups tested for restoration
- [ ] Password rotation policy enforced
- [ ] No plaintext passwords in connection strings (use secrets manager)

---

## Additional Resources

- **PostgreSQL Documentation:** https://www.postgresql.org/docs/14/
- **Index Tuning Guide:** https://www.postgresql.org/docs/14/indexes-types.html
- **Query Performance Tuning:** Use `EXPLAIN ANALYZE` for all critical queries
- **Connection Pooling:** Consider PgBouncer for high-concurrency scenarios
