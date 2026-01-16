'use client';

import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { API_ROUTES } from '@/lib/constants';
import { useCartStore } from '@/stores/cartStore';
import type { Order } from '@/types';

interface CreateOrderRequest {
    eventId: string;
    items: {
        ticketTierId: string;
        seatId: string;
        quantity: number;
    }[];
}

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export function useCreateOrder() {
    const { selectedSeats, eventId, clearCart } = useCartStore();

    const mutation = useMutation({
        mutationFn: async () => {
            if (!eventId || selectedSeats.length === 0) {
                throw new Error('No hay asientos seleccionados');
            }

            const request: CreateOrderRequest = {
                eventId,
                items: selectedSeats.map((seat) => ({
                    ticketTierId: seat.ticketTierId,
                    seatId: seat.id,
                    quantity: 1,
                })),
            };

            const response = await api.post<ApiResponse<Order>>(
                API_ROUTES.CHECKOUT,
                request
            );
            return response.data.data;
        },
        onSuccess: () => {
            clearCart();
        },
    });

    return {
        createOrder: mutation.mutate,
        isLoading: mutation.isPending,
        error: mutation.error,
        isSuccess: mutation.isSuccess,
        order: mutation.data,
    };
}
