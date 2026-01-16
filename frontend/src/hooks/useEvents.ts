'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { API_ROUTES } from '@/lib/constants';
import type { Event, EventSummary, PageResponse, ApiResponse } from '@/types';

// Fetch all events with pagination
export function useEvents(page = 0, size = 10, status?: string) {
    return useQuery({
        queryKey: ['events', { page, size, status }],
        queryFn: async () => {
            const params = new URLSearchParams({
                page: page.toString(),
                size: size.toString(),
            });
            if (status) params.append('status', status);

            const response = await api.get<ApiResponse<PageResponse<EventSummary>>>(
                `${API_ROUTES.EVENTS}?${params}`
            );
            return response.data.data;
        },
    });
}

// Fetch single event by ID
export function useEvent(eventId: string) {
    return useQuery({
        queryKey: ['event', eventId],
        queryFn: async () => {
            const response = await api.get<ApiResponse<Event>>(
                API_ROUTES.EVENT(eventId)
            );
            return response.data.data;
        },
        enabled: !!eventId,
    });
}

// Fetch upcoming/published events for public view
export function usePublicEvents(page = 0, size = 12) {
    return useQuery({
        queryKey: ['public-events', { page, size }],
        queryFn: async () => {
            const response = await api.get<ApiResponse<PageResponse<EventSummary>>>(
                `${API_ROUTES.EVENTS}?page=${page}&size=${size}&status=PUBLISHED`
            );
            return response.data.data;
        },
    });
}
