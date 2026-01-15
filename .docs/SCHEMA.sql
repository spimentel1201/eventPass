-- NEONPASS DATABASE SCHEMA v2.0
-- Architecture: Hierarchical (Venue -> Section -> Seat)
-- Security: UUID Primary Keys

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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL, -- For friendly URLs (neonpass.com/coldplay-tour)
    stripe_account_id VARCHAR(100), -- For payouts
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 2. VENUE ARCHITECTURE (The Physical Place)
-- ==========================================

CREATE TABLE venues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    timezone VARCHAR(50) DEFAULT 'UTC',
    base_layout_json JSONB -- Global coordinates for the stadium shape
);

-- ZONES / SECTIONS (e.g., "North Stand", "VIP Box", "General Field")
CREATE TABLE sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) CHECK (type IN ('SEATED', 'GENERAL')), -- SEATED = Numbered, GENERAL = Standing
    capacity INT NOT NULL, -- Max capacity for GENERAL; Calculated for SEATED
    layout_config JSONB, -- { x, y, width, height, rotation, vector_path } for the Macro Map
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- INDIVIDUAL SEATS (Only for type='SEATED')
CREATE TABLE seats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
    row_label VARCHAR(10) NOT NULL, -- "A", "Row 1"
    number_label VARCHAR(10) NOT NULL, -- "12", "Seat 5"
    x_position INT NOT NULL, -- Relative X inside the Section
    y_position INT NOT NULL, -- Relative Y inside the Section
    is_accessible BOOLEAN DEFAULT FALSE,
    UNIQUE(section_id, row_label, number_label) -- Physical constraint
);

-- ==========================================
-- 3. EVENTS & PRICING (The Temporal Layer)
-- ==========================================

CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    venue_id UUID REFERENCES venues(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    status VARCHAR(20) DEFAULT 'DRAFT', -- DRAFT, PUBLISHED, CANCELLED, COMPLETED
    metadata JSONB
);

-- TICKET TIERS (Connects an Event to a Section with a Price)
CREATE TABLE ticket_tiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id),
    section_id UUID REFERENCES sections(id),
    name VARCHAR(100) NOT NULL, -- "Early Bird", "Regular", "Last Call"
    price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    capacity_allocated INT, -- Optional limit overrides
    status VARCHAR(20) DEFAULT 'ACTIVE' -- ACTIVE, SOLD_OUT, HIDDEN
);

-- ==========================================
-- 4. COMMERCE & TICKETS
-- ==========================================

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    event_id UUID REFERENCES events(id),
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, PAID, FAILED, REFUNDED
    payment_intent_id VARCHAR(255), -- Stripe Payment Intent
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id),
    event_id UUID REFERENCES events(id),
    ticket_tier_id UUID REFERENCES ticket_tiers(id),
    
    -- Nullable because 'General Admission' tickets don't have a specific seat_id
    seat_id UUID REFERENCES seats(id), 
    
    qr_code_hash VARCHAR(512) NOT NULL, -- Signed JWT/HMAC hash
    status VARCHAR(20) DEFAULT 'VALID', -- VALID, USED, CANCELLED
    scanned_at TIMESTAMP,
    UNIQUE(event_id, seat_id) -- Critical: Prevents double booking in DB layer
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX idx_seats_section ON seats(section_id);
CREATE INDEX idx_tickets_order ON tickets(order_id);
CREATE INDEX idx_tickets_hash ON tickets(qr_code_hash);