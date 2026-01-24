'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
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

// Order response type from API
export interface OrderResponse {
    id: string;
    eventId: string;
    status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
    totalAmount: number;
    platformFee: number;
    netAmount: number;
    currency: string;
    createdAt: string;
    // Enriched fields
    eventTitle?: string;
    eventDate?: string;
    ticketCount?: number;
}

export function useCreateOrder() {
    const mutation = useMutation({
        mutationFn: async () => {
            // Get current state at execution time, not at hook creation time
            const state = useCartStore.getState();
            const { items, eventId, totalAmount, clearCart } = state;

            console.log('Creating order with:', { eventId, itemsCount: items.length });

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

            console.log('Order request:', request);

            const response = await api.post<ApiResponse<Order>>(
                API_ROUTES.CHECKOUT,
                request
            );
            return response.data.data;
        },
        // NO limpiar carrito aquí - el carrito se limpia en handlePaymentSuccess después del pago exitoso
    });

    return {
        createOrder: mutation.mutate,
        isLoading: mutation.isPending,
        error: mutation.error,
        isSuccess: mutation.isSuccess,
        order: mutation.data,
    };
}

// Hook to get user's orders
export function useMyOrders() {
    return useQuery({
        queryKey: ['my-orders'],
        queryFn: async () => {
            const response = await api.get<ApiResponse<OrderResponse[]>>(API_ROUTES.MY_ORDERS);
            return response.data.data;
        },
    });
}

// Hook to get a single order
export function useOrder(orderId: string) {
    return useQuery({
        queryKey: ['order', orderId],
        queryFn: async () => {
            const response = await api.get<ApiResponse<OrderResponse>>(API_ROUTES.ORDER(orderId));
            return response.data.data;
        },
        enabled: !!orderId,
    });
}
