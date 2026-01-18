'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { API_ROUTES } from '@/lib/constants';

// Types - Match with backend AdminDashboardResponse
export interface DashboardStats {
    // Contadores
    totalUsers: number;
    totalEvents: number;
    totalOrganizations: number;
    totalVenues: number;
    totalOrders: number;
    totalTickets: number;

    // Estadísticas de eventos
    publishedEvents: number;
    draftEvents: number;

    // Estadísticas de ventas
    totalRevenue: number;
    platformFees: number;

    // Usuarios por rol
    adminCount: number;
    staffCount: number;
    userCount: number;
}

export interface AdminUser {
    id: string;
    email: string;
    fullName: string;
    role: 'ADMIN' | 'ORGANIZER' | 'CUSTOMER';
    createdAt: string;
    lastLoginAt?: string;
    active: boolean;
}

export interface AdminOrder {
    id: string;
    userId: string;
    userEmail: string;
    userName: string;
    eventId: string;
    eventTitle: string;  // Changed from eventName
    status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
    totalAmount: number;
    platformFee: number;
    netAmount: number;
    currency: string;
    ticketCount: number;
    createdAt: string;
}

interface PaginatedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

// Dashboard Stats Hook
export function useAdminDashboard() {
    return useQuery({
        queryKey: ['admin', 'dashboard'],
        queryFn: async () => {
            const response = await api.get<ApiResponse<DashboardStats>>(API_ROUTES.ADMIN_DASHBOARD);
            return response.data.data;
        },
        staleTime: 30000, // 30 seconds
    });
}

// Users Hooks
export function useAdminUsers(page = 0, size = 10) {
    return useQuery({
        queryKey: ['admin', 'users', page, size],
        queryFn: async () => {
            const response = await api.get<ApiResponse<PaginatedResponse<AdminUser>>>(
                `${API_ROUTES.ADMIN_USERS}?page=${page}&size=${size}`
            );
            return response.data.data;
        },
    });
}

export function useAdminUser(userId: string) {
    return useQuery({
        queryKey: ['admin', 'users', userId],
        queryFn: async () => {
            const response = await api.get<ApiResponse<AdminUser>>(`${API_ROUTES.ADMIN_USERS}/${userId}`);
            return response.data.data;
        },
        enabled: !!userId,
    });
}

export function useChangeUserRole() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
            const response = await api.put<ApiResponse<AdminUser>>(
                `${API_ROUTES.ADMIN_USERS}/${userId}/role`,
                { role }
            );
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
        },
    });
}

export function useDeactivateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (userId: string) => {
            const response = await api.post<ApiResponse<void>>(
                `${API_ROUTES.ADMIN_USERS}/${userId}/deactivate`
            );
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
        },
    });
}

// Orders Hooks
export function useAdminOrders(
    page = 0,
    size = 10,
    filters?: { status?: string; eventId?: string }
) {
    return useQuery({
        queryKey: ['admin', 'orders', page, size, filters],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.append('page', page.toString());
            params.append('size', size.toString());
            if (filters?.status) params.append('status', filters.status);
            if (filters?.eventId) params.append('eventId', filters.eventId);

            const response = await api.get<ApiResponse<PaginatedResponse<AdminOrder>>>(
                `${API_ROUTES.ADMIN_ORDERS}?${params.toString()}`
            );
            return response.data.data;
        },
    });
}

export function useAdminOrder(orderId: string) {
    return useQuery({
        queryKey: ['admin', 'orders', orderId],
        queryFn: async () => {
            const response = await api.get<ApiResponse<AdminOrder>>(`${API_ROUTES.ADMIN_ORDERS}/${orderId}`);
            return response.data.data;
        },
        enabled: !!orderId,
    });
}
