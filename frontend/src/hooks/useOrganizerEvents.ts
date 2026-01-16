'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { API_ROUTES } from '@/lib/constants';
import type { Event } from '@/types';

interface ApiResponse<T> {
    success: boolean;
    data: T;
}

interface PageResponse<T> {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
}

interface CreateEventRequest {
    title: string;
    description: string;
    venueId: string;
    startDate: string;  // Frontend format from datetime-local input
    endDate: string;
    organizationId?: string;
    status?: string;
}

interface BackendEventRequest {
    title: string;
    description: string;
    organizationId: string;
    venueId: string;
    startTime: string;  // Backend format: LocalDateTime
    endTime: string;
    status: string;
}

// Get organizer's events
export function useOrganizerEvents(page = 0, size = 10) {
    return useQuery({
        queryKey: ['organizer-events', page, size],
        queryFn: async () => {
            const response = await api.get<ApiResponse<PageResponse<Event>>>(
                `${API_ROUTES.EVENTS}?page=${page}&size=${size}`
            );
            return response.data.data;
        },
    });
}

// Create event
export function useCreateEvent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (formData: CreateEventRequest) => {
            // Transform frontend form data to backend format
            const backendData: BackendEventRequest = {
                title: formData.title,
                description: formData.description,
                organizationId: formData.organizationId || formData.venueId, // Use venueId as fallback for org
                venueId: formData.venueId,
                startTime: formData.startDate, // datetime-local format is compatible
                endTime: formData.endDate,
                status: formData.status || 'PUBLISHED', // PUBLISHED so it appears in list
            };

            const response = await api.post<ApiResponse<Event>>(API_ROUTES.EVENTS, backendData);
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['organizer-events'] });
        },
    });
}

// Update event
export function useUpdateEvent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ eventId, data }: { eventId: string; data: Partial<CreateEventRequest> }) => {
            const response = await api.put<ApiResponse<Event>>(`${API_ROUTES.EVENTS}/${eventId}`, data);
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['organizer-events'] });
            queryClient.invalidateQueries({ queryKey: ['event'] });
        },
    });
}

// Delete event
export function useDeleteEvent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (eventId: string) => {
            await api.delete(`${API_ROUTES.EVENTS}/${eventId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['organizer-events'] });
        },
    });
}
