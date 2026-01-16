// App-wide constants

export const APP_NAME = 'NeonPass';

export const MAX_SEATS_PER_ORDER = 6;
export const RESERVATION_TIMEOUT_MINUTES = 10;

export const API_ROUTES = {
    // Auth
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',

    // Events
    EVENTS: '/events',
    EVENT: (id: string) => `/events/${id}`,
    SEATING_MAP: (id: string) => `/events/${id}/seating-map`,

    // Venues
    VENUES: '/venues',
    VENUE_LAYOUT: (id: string) => `/venues/${id}/layout`,
    VENUE_SECTIONS: (id: string) => `/venues/${id}/sections`,

    // Sections
    SECTIONS: '/sections',
    SECTION_SEATS: (id: string) => `/sections/${id}/seats`,

    // Orders
    ORDERS: '/orders',
    CHECKOUT: '/orders/checkout',
    MY_ORDERS: '/orders',
    ORDER: (id: string) => `/orders/${id}`,

    // Admin
    ADMIN_DASHBOARD: '/admin/dashboard',
    ADMIN_USERS: '/admin/users',
    ADMIN_ORDERS: '/admin/orders',
} as const;
