'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { API_ROUTES } from '@/lib/constants';
import type { Event } from '@/types';

interface ApiResponse<T> {
    success: boolean;
    data: T;
}

// Get single event by ID
export function useEvent(eventId: string) {
    return useQuery({
        queryKey: ['event', eventId],
        queryFn: async () => {
            const response = await api.get<ApiResponse<Event>>(`${API_ROUTES.EVENTS}/${eventId}`);
            return response.data.data;
        },
        enabled: !!eventId,
    });
}
