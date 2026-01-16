-- NEONPASS DATABASE SCHEMA v2.1
-- Architecture: Hierarchical (Venue -> Section -> Seat)
-- Enhancements: Audit, Commission, Event-Section Mapping

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. TENANCY & USERS
-- ==========================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'USER', -- USER, ADMIN, STAFF
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted BOOLEAN DEFAULT FALSE
);

CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    stripe_account_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted BOOLEAN DEFAULT FALSE
);

-- ==========================================
-- 2. VENUE ARCHITECTURE
-- ==========================================

CREATE TABLE venues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    timezone VARCHAR(50) DEFAULT 'UTC',
    base_layout_json JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted BOOLEAN DEFAULT FALSE
);

CREATE TABLE sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) CHECK (type IN ('SEATED', 'GENERAL')),
    capacity INT NOT NULL,
    layout_config JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted BOOLEAN DEFAULT FALSE
);

CREATE TABLE seats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
    row_label VARCHAR(10) NOT NULL,
    number_label VARCHAR(10) NOT NULL,
    x_position INT NOT NULL,
    y_position INT NOT NULL,
    is_accessible BOOLEAN DEFAULT FALSE,
    deleted BOOLEAN DEFAULT FALSE,
    UNIQUE(section_id, row_label, number_label)
);

-- ==========================================
-- 3. EVENTS & PRICING
-- ==========================================

CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    venue_id UUID REFERENCES venues(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    status VARCHAR(20) DEFAULT 'DRAFT',
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted BOOLEAN DEFAULT FALSE
);

-- NEW: Explicit Event-Section Activation Mapping
CREATE TABLE event_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    section_id UUID REFERENCES sections(id),
    is_active BOOLEAN DEFAULT TRUE,
    custom_capacity INT, -- Override capacity for this event
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, section_id)
);

CREATE TABLE ticket_tiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id),
    section_id UUID REFERENCES sections(id),
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    capacity_allocated INT,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted BOOLEAN DEFAULT FALSE
);

-- ==========================================
-- 4. COMMERCE & TICKETS
-- ==========================================

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    event_id UUID REFERENCES events(id),
    total_amount DECIMAL(10, 2) NOT NULL,
    platform_fee DECIMAL(10, 2) DEFAULT 0.00, -- NEW
    net_amount DECIMAL(10, 2), -- NEW: total_amount - platform_fee
    status VARCHAR(20) DEFAULT 'PENDING',
    payment_intent_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id),
    event_id UUID REFERENCES events(id),
    ticket_tier_id UUID REFERENCES ticket_tiers(id),
    seat_id UUID REFERENCES seats(id),
    
    -- NEW: Price immutability (frozen at purchase time)
    price_snapshot DECIMAL(10, 2) NOT NULL,
    currency_snapshot VARCHAR(3) DEFAULT 'USD',
    
    qr_code_hash VARCHAR(512) NOT NULL,
    status VARCHAR(20) DEFAULT 'VALID',
    scanned_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, seat_id)
);

-- NEW: Audit Trail for Access Control (Mobile App)
CREATE TABLE ticket_validations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID REFERENCES tickets(id),
    validated_by UUID REFERENCES users(id), -- Staff member
    validated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    location_metadata JSONB, -- GPS, device info, gate number
    status VARCHAR(20) DEFAULT 'SUCCESS', -- SUCCESS, REJECTED, DUPLICATE_ATTEMPT
    rejection_reason TEXT
);

-- NEW: Commission Configuration per Organization
CREATE TABLE commission_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    platform_fee_percentage DECIMAL(5, 2) DEFAULT 5.00,
    payment_processor_fee DECIMAL(5, 2) DEFAULT 2.90,
    flat_fee_per_ticket DECIMAL(10, 2) DEFAULT 0.30,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 5. PERFORMANCE INDEXES
-- ==========================================

-- Existing indexes
CREATE INDEX idx_seats_section ON seats(section_id);
CREATE INDEX idx_tickets_order ON tickets(order_id);
CREATE INDEX idx_tickets_hash ON tickets(qr_code_hash);

-- NEW: High-concurrency optimizations
CREATE INDEX idx_seats_position ON seats(section_id, x_position, y_position);
CREATE INDEX idx_events_status_time ON events(status, start_time) 
WHERE status IN ('PUBLISHED', 'DRAFT');
CREATE INDEX idx_tickets_status_event ON tickets(event_id, status);
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
CREATE INDEX idx_event_sections_event ON event_sections(event_id);
CREATE INDEX idx_ticket_validations_ticket ON ticket_validations(ticket_id);

-- Índices específicos para multimedia
CREATE INDEX IF NOT EXISTS idx_events_banner_url 
ON events ((metadata->'media'->'images'->'banner'->>'url'))
WHERE metadata->'media'->'images'->'banner' IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_events_youtube_trailer 
ON events ((metadata->'media'->'videos'->'trailer'->>'videoId'))
WHERE metadata->'media'->'videos'->'trailer' IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_events_spotify_playlist 
ON events ((metadata->'media'->'audio'->'playlist'->>'playlistId'))
WHERE metadata->'media'->'audio'->'playlist' IS NOT NULL;

-- Índices para búsquedas eficientes
CREATE INDEX IF NOT EXISTS idx_events_metadata_gin 
ON events USING GIN (metadata);

-- ==========================================
-- 6. MATERIALIZED VIEW FOR AVAILABILITY
-- ==========================================

CREATE MATERIALIZED VIEW section_availability AS
SELECT 
    s.id AS section_id,
    s.name AS section_name,
    s.type AS section_type,
    s.capacity AS total_capacity,
    COALESCE(COUNT(t.id) FILTER (WHERE t.status = 'VALID'), 0) AS tickets_sold,
    (s.capacity - COALESCE(COUNT(t.id) FILTER (WHERE t.status = 'VALID'), 0)) AS available
FROM sections s
LEFT JOIN ticket_tiers tt ON tt.section_id = s.id
LEFT JOIN tickets t ON t.ticket_tier_id = tt.id
WHERE s.type = 'GENERAL' AND s.deleted = FALSE
GROUP BY s.id, s.name, s.type, s.capacity;

CREATE UNIQUE INDEX idx_section_availability_section ON section_availability(section_id);

-- Refresh command (call after ticket purchase):
-- REFRESH MATERIALIZED VIEW CONCURRENTLY section_availability;