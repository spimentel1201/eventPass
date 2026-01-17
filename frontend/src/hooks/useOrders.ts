'use client';

import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { API_ROUTES } from '@/lib/constants';
import { useCartStore } from '@/stores/cartStore';
import type { Order } from '@/types';

// Request for section-based purchase
interface CreateOrderRequest {
    eventId: string;
    items: {
        sectionId: string;
        quantity: number;
        pricePerTicket: number;
    }[];
    totalAmount: number;
}

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export function useCreateOrder() {
    const { items, eventId, totalAmount, clearCart } = useCartStore();

    const mutation = useMutation({
        mutationFn: async () => {
            if (!eventId || items.length === 0) {
                throw new Error('No hay entradas seleccionadas');
            }

            const request: CreateOrderRequest = {
                eventId,
                items: items.map((item) => ({
                    sectionId: item.sectionId,
                    quantity: item.quantity,
                    pricePerTicket: item.pricePerTicket,
                })),
                totalAmount: totalAmount(),
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
