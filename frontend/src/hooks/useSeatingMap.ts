'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { API_ROUTES } from '@/lib/constants';
import type { SeatingMap, Section, Seat } from '@/types';

interface ApiResponse<T> {
    success: boolean;
    data: T;
}

// Fetch complete seating map for an event
export function useSeatingMap(eventId: string) {
    return useQuery({
        queryKey: ['seating-map', eventId],
        queryFn: async () => {
            const response = await api.get<ApiResponse<SeatingMap>>(
                API_ROUTES.SEATING_MAP(eventId)
            );
            return response.data.data;
        },
        enabled: !!eventId,
        staleTime: 30 * 1000, // Refresh every 30 seconds
        refetchInterval: 30 * 1000,
    });
}

// Fetch seats for a specific section (lazy loading)
export function useSectionSeats(sectionId: string | null) {
    return useQuery({
        queryKey: ['section-seats', sectionId],
        queryFn: async () => {
            if (!sectionId) return [];
            const response = await api.get<ApiResponse<Seat[]>>(
                API_ROUTES.SECTION_SEATS(sectionId)
            );
            return response.data.data;
        },
        enabled: !!sectionId,
    });
}
