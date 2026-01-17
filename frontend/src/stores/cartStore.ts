import { create } from 'zustand';
import { RESERVATION_TIMEOUT_MINUTES } from '@/lib/constants';

// Cart item represents tickets from a section (not individual seats)
export interface CartItem {
    id: string; // unique id for cart
    sectionId: string;
    sectionName: string;
    sectionType: string;
    quantity: number;
    pricePerTicket: number;
    color?: string;
}

// Legacy seat selection for backwards compatibility
export interface SelectedSeat {
    id: string;
    sectionId: string;
    sectionName: string;
    rowLabel: string;
    numberLabel: string;
    price: number;
    ticketTierId: string;
}

interface CartState {
    // Section-based selection
    items: CartItem[];
    eventId: string | null;
    eventTitle: string | null;
    reservationExpiry: Date | null;

    // Legacy for seat-based (if needed)
    selectedSeats: SelectedSeat[];

    // Section actions
    addItem: (item: Omit<CartItem, 'id'>) => void;
    updateItemQuantity: (sectionId: string, quantity: number) => void;
    removeItem: (sectionId: string) => void;
    clearCart: () => void;
    setEvent: (eventId: string, eventTitle: string) => void;
    startReservationTimer: () => void;

    // Legacy seat actions
    addSeat: (seat: SelectedSeat) => boolean;
    removeSeat: (seatId: string) => void;
    setEventId: (eventId: string) => void; // Legacy alias

    // Computed
    totalAmount: () => number;
    totalQuantity: () => number;
    isExpired: () => boolean;

    // Legacy computed
    seatCount: () => number;
    canAddSeat: () => boolean;
}

const MAX_TICKETS_PER_SECTION = 10;
const MAX_TICKETS_TOTAL = 20;

export const useCartStore = create<CartState>((set, get) => ({
    items: [],
    eventId: null,
    eventTitle: null,
    reservationExpiry: null,
    selectedSeats: [],

    addItem: (item) => {
        const state = get();

        // Check if section already in cart
        const existing = state.items.find(i => i.sectionId === item.sectionId);

        if (existing) {
            // Update quantity
            const newQty = Math.min(existing.quantity + item.quantity, MAX_TICKETS_PER_SECTION);
            set({
                items: state.items.map(i =>
                    i.sectionId === item.sectionId
                        ? { ...i, quantity: newQty }
                        : i
                )
            });
        } else {
            // Add new item
            const newItem: CartItem = {
                ...item,
                id: `${item.sectionId}-${Date.now()}`,
                quantity: Math.min(item.quantity, MAX_TICKETS_PER_SECTION),
            };
            set({ items: [...state.items, newItem] });
        }

        // Start timer on first item
        if (state.items.length === 0 && !state.reservationExpiry) {
            get().startReservationTimer();
        }
    },

    updateItemQuantity: (sectionId, quantity) => {
        if (quantity <= 0) {
            get().removeItem(sectionId);
            return;
        }

        set(state => ({
            items: state.items.map(i =>
                i.sectionId === sectionId
                    ? { ...i, quantity: Math.min(quantity, MAX_TICKETS_PER_SECTION) }
                    : i
            )
        }));
    },

    removeItem: (sectionId) => {
        set(state => ({
            items: state.items.filter(i => i.sectionId !== sectionId)
        }));

        // Clear timer if cart is empty
        if (get().items.length === 0) {
            set({ reservationExpiry: null });
        }
    },

    clearCart: () => {
        set({
            items: [],
            selectedSeats: [],
            reservationExpiry: null,
        });
    },

    setEvent: (eventId, eventTitle) => {
        const state = get();
        if (state.eventId && state.eventId !== eventId) {
            get().clearCart();
        }
        set({ eventId, eventTitle });
    },

    // Legacy alias for backwards compatibility
    setEventId: (eventId: string) => {
        get().setEvent(eventId, '');
    },

    startReservationTimer: () => {
        const expiry = new Date();
        expiry.setMinutes(expiry.getMinutes() + RESERVATION_TIMEOUT_MINUTES);
        set({ reservationExpiry: expiry });
    },

    // Legacy seat functions
    addSeat: (seat) => {
        const state = get();
        if (state.selectedSeats.some(s => s.id === seat.id)) return false;

        set({ selectedSeats: [...state.selectedSeats, seat] });

        if (state.selectedSeats.length === 0) {
            get().startReservationTimer();
        }
        return true;
    },

    removeSeat: (seatId) => {
        set(state => ({
            selectedSeats: state.selectedSeats.filter(s => s.id !== seatId)
        }));
    },

    totalAmount: () => {
        const state = get();
        // Sum from section items
        const itemsTotal = state.items.reduce((sum, item) =>
            sum + (item.pricePerTicket * item.quantity), 0
        );
        // Sum from legacy seats
        const seatsTotal = state.selectedSeats.reduce((sum, seat) =>
            sum + seat.price, 0
        );
        return itemsTotal + seatsTotal;
    },

    totalQuantity: () => {
        const state = get();
        const itemsQty = state.items.reduce((sum, item) => sum + item.quantity, 0);
        return itemsQty + state.selectedSeats.length;
    },

    isExpired: () => {
        const expiry = get().reservationExpiry;
        if (!expiry) return false;
        return new Date() > expiry;
    },

    // Legacy computed for backwards compatibility
    seatCount: () => {
        return get().selectedSeats.length;
    },

    canAddSeat: () => {
        return get().selectedSeats.length < MAX_TICKETS_TOTAL;
    },
}));

