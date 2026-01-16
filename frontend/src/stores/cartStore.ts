import { create } from 'zustand';
import { MAX_SEATS_PER_ORDER, RESERVATION_TIMEOUT_MINUTES } from '@/lib/constants';

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
    selectedSeats: SelectedSeat[];
    eventId: string | null;
    reservationExpiry: Date | null;

    // Actions
    addSeat: (seat: SelectedSeat) => boolean;
    removeSeat: (seatId: string) => void;
    clearCart: () => void;
    setEventId: (eventId: string) => void;
    startReservationTimer: () => void;

    // Computed
    totalAmount: () => number;
    seatCount: () => number;
    canAddSeat: () => boolean;
    isExpired: () => boolean;
}

export const useCartStore = create<CartState>((set, get) => ({
    selectedSeats: [],
    eventId: null,
    reservationExpiry: null,

    addSeat: (seat) => {
        const state = get();

        // Check max seats limit
        if (state.selectedSeats.length >= MAX_SEATS_PER_ORDER) {
            return false;
        }

        // Check if already selected
        if (state.selectedSeats.some(s => s.id === seat.id)) {
            return false;
        }

        set((state) => ({
            selectedSeats: [...state.selectedSeats, seat],
        }));

        // Start timer on first seat
        if (state.selectedSeats.length === 0) {
            get().startReservationTimer();
        }

        return true;
    },

    removeSeat: (seatId) => {
        set((state) => ({
            selectedSeats: state.selectedSeats.filter((s) => s.id !== seatId),
        }));

        // Clear timer if cart is empty
        if (get().selectedSeats.length === 0) {
            set({ reservationExpiry: null });
        }
    },

    clearCart: () => {
        set({
            selectedSeats: [],
            reservationExpiry: null,
        });
    },

    setEventId: (eventId) => {
        const state = get();
        // If changing event, clear cart
        if (state.eventId && state.eventId !== eventId) {
            get().clearCart();
        }
        set({ eventId });
    },

    startReservationTimer: () => {
        const expiry = new Date();
        expiry.setMinutes(expiry.getMinutes() + RESERVATION_TIMEOUT_MINUTES);
        set({ reservationExpiry: expiry });
    },

    totalAmount: () => {
        return get().selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
    },

    seatCount: () => {
        return get().selectedSeats.length;
    },

    canAddSeat: () => {
        return get().selectedSeats.length < MAX_SEATS_PER_ORDER;
    },

    isExpired: () => {
        const expiry = get().reservationExpiry;
        if (!expiry) return false;
        return new Date() > expiry;
    },
}));
