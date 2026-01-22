import { useMutation, useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export type PaymentProvider = 'STRIPE' | 'MERCADOPAGO';

export interface PaymentConfig {
    stripePublishableKey: string;
    mercadoPagoPublicKey: string;
}

export interface CreatePaymentRequest {
    orderId: string;
    provider: PaymentProvider;
    amount: number;
    currency?: string;
    description?: string;
}

export interface PaymentResponse {
    id: string;
    orderId: string;
    provider: PaymentProvider;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
    amount: number;
    currency: string;
    clientSecret?: string; // For Stripe
    checkoutUrl?: string;  // For MercadoPago redirect
    publicKey?: string;
    errorMessage?: string;
    createdAt: string;
    completedAt?: string;
}

// Get payment SDK configuration
export function usePaymentConfig() {
    return useQuery<PaymentConfig>({
        queryKey: ['payment-config'],
        queryFn: async () => {
            const response = await api.get('/payments/config');
            return response.data.data;
        },
        staleTime: 1000 * 60 * 60, // 1 hour
    });
}

// Create payment intent
export function useCreatePayment() {
    return useMutation<PaymentResponse, Error, CreatePaymentRequest>({
        mutationFn: async (request) => {
            const response = await api.post('/payments/create-intent', request);
            return response.data.data;
        },
    });
}

// Get payment status
export function usePaymentStatus(paymentId: string | null) {
    return useQuery<PaymentResponse>({
        queryKey: ['payment-status', paymentId],
        queryFn: async () => {
            const response = await api.get(`/payments/${paymentId}/status`);
            return response.data.data;
        },
        enabled: !!paymentId,
        refetchInterval: (query) => {
            // Stop polling when payment is complete or failed
            const data = query.state.data;
            if (data?.status === 'COMPLETED' || data?.status === 'FAILED') {
                return false;
            }
            return 2000; // Poll every 2 seconds
        },
    });
}

// Confirm payment
export function useConfirmPayment() {
    return useMutation<PaymentResponse, Error, { paymentId: string; externalPaymentId: string }>({
        mutationFn: async ({ paymentId, externalPaymentId }) => {
            const response = await api.post(
                `/payments/${paymentId}/confirm?externalPaymentId=${externalPaymentId}`
            );
            return response.data.data;
        },
    });
}
