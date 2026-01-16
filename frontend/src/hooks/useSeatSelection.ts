'use client';

import { useState, useCallback } from 'react';
import { useCartStore, type SelectedSeat } from '@/stores/cartStore';
import type { Seat, Section, SeatStatus } from '@/types';
import { MAX_SEATS_PER_ORDER } from '@/lib/constants';

interface UseSeatSelectionProps {
    eventId: string;
    onMaxSeatsReached?: () => void;
}

export function useSeatSelection({ eventId, onMaxSeatsReached }: UseSeatSelectionProps) {
    const {
        selectedSeats,
        addSeat,
        removeSeat,
        clearCart,
        setEventId,
        totalAmount,
        seatCount,
        canAddSeat,
        reservationExpiry,
        isExpired,
    } = useCartStore();

    const [hoveredSeat, setHoveredSeat] = useState<Seat | null>(null);

    // Set event ID when component mounts
    useState(() => {
        setEventId(eventId);
    });

    const handleSeatClick = useCallback(
        (seat: Seat, section: Section, ticketTierId: string, price: number) => {
            // Check if seat is already selected
            const isSelected = selectedSeats.some((s) => s.id === seat.id);

            if (isSelected) {
                // Deselect seat
                removeSeat(seat.id);
            } else {
                // Check if can add more seats
                if (!canAddSeat()) {
                    onMaxSeatsReached?.();
                    return;
                }

                // Add seat to cart
                const seatData: SelectedSeat = {
                    id: seat.id,
                    sectionId: section.id,
                    sectionName: section.name,
                    rowLabel: seat.rowLabel,
                    numberLabel: seat.numberLabel,
                    price,
                    ticketTierId,
                };

                addSeat(seatData);
            }
        },
        [selectedSeats, addSeat, removeSeat, canAddSeat, onMaxSeatsReached]
    );

    const isSeatSelected = useCallback(
        (seatId: string) => selectedSeats.some((s) => s.id === seatId),
        [selectedSeats]
    );

    const getSeatStatus = useCallback(
        (seat: Seat): SeatStatus => {
            if (isSeatSelected(seat.id)) {
                return 'SELECTED';
            }
            return seat.status || 'AVAILABLE';
        },
        [isSeatSelected]
    );

    return {
        selectedSeats,
        hoveredSeat,
        setHoveredSeat,
        handleSeatClick,
        isSeatSelected,
        getSeatStatus,
        clearCart,
        totalAmount: totalAmount(),
        seatCount: seatCount(),
        canAddSeat: canAddSeat(),
        maxSeats: MAX_SEATS_PER_ORDER,
        reservationExpiry,
        isExpired: isExpired(),
    };
}
