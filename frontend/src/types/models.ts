// Domain models

export interface Event {
    id: string;
    organizationId: string;
    venueId: string;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    startDate?: string;   // Alias for frontend compatibility
    endDate?: string;     // Alias for frontend compatibility
    status: EventStatus;
    createdAt: string;
    images?: EventImages;
    metadata?: Record<string, unknown>;
    venueName?: string;   // Joined from venue
    thumbnailUrl?: string; // Extracted from images
}

export interface EventSummary {
    id: string;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    status: EventStatus;
    thumbnailUrl?: string;
    venueName?: string;
}

export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';

export interface EventImages {
    banner?: ImageInfo;
    thumbnail?: ImageInfo;
}

export interface ImageInfo {
    url: string;
    width?: number;
    height?: number;
    transformations?: Record<string, string>;
}

export interface Venue {
    id: string;
    organizationId: string;
    name: string;
    address: string;
    timezone: string;
    createdAt: string;
}

export interface Section {
    id: string;
    venueId: string;
    name: string;
    type: SectionType;
    capacity: number;
    layoutConfig?: SectionLayout;
    seats?: Seat[];
    availableCount?: number;
    soldCount?: number;
}

export type SectionType = 'SEATED' | 'GENERAL_ADMISSION' | 'VIP' | 'BOX';

export interface SectionLayout {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    points?: number[];
    color?: string;
    polygon?: number[];
    position?: { x: number; y: number };
}

export interface Seat {
    id: string;
    sectionId: string;
    rowLabel: string;
    numberLabel: string;
    xPosition: number;
    yPosition: number;
    isAccessible?: boolean;
    status?: SeatStatus;
}

export type SeatStatus = 'AVAILABLE' | 'SOLD' | 'RESERVED' | 'LOCKED' | 'SELECTED';

export interface SeatingMap {
    eventId: string;
    venueId: string;
    venueName: string;
    venueLayout?: VenueLayout;
    sections: Section[];
    summary: AvailabilitySummary;
}

export interface VenueLayout {
    canvas?: { width: number; height: number; backgroundColor?: string };
    elements?: unknown[];
}

export interface AvailabilitySummary {
    totalCapacity: number;
    totalAvailable: number;
    totalSold: number;
    totalReserved: number;
}

export interface Order {
    id: string;
    userId: string;
    eventId: string;
    status: OrderStatus;
    totalAmount: number;
    platformFee: number;
    netAmount: number;
    currency: string;
    createdAt: string;
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'REFUNDED';

export interface TicketTier {
    id: string;
    eventId: string;
    name: string;
    price: number;
    quantity: number;
    sold: number;
}

export interface Organization {
    id: string;
    ownerId: string;
    name: string;
    slug: string;
    createdAt: string;
}
