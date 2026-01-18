'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { API_ROUTES } from '@/lib/constants';
import type { Venue, Section } from '@/types';

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

interface CreateVenueRequest {
    organizationId: string;
    name: string;
    address: string;
    timezone?: string;
}

interface CreateSectionRequest {
    venueId: string;
    name: string;
    type: string;
    capacity: number;
    layoutConfig?: Record<string, unknown>;
}

// Get venues
export function useVenues(page = 0, size = 10) {
    return useQuery({
        queryKey: ['venues', page, size],
        queryFn: async () => {
            const response = await api.get<ApiResponse<PageResponse<Venue>>>(
                `${API_ROUTES.VENUES}?page=${page}&size=${size}`
            );
            return response.data.data;
        },
    });
}

// Get single venue
export function useVenue(venueId: string) {
    return useQuery({
        queryKey: ['venue', venueId],
        queryFn: async () => {
            const response = await api.get<ApiResponse<Venue>>(`${API_ROUTES.VENUES}/${venueId}`);
            return response.data.data;
        },
        enabled: !!venueId,
    });
}

// Get venue layout
export function useVenueLayout(venueId: string) {
    return useQuery({
        queryKey: ['venue-layout', venueId],
        queryFn: async () => {
            const response = await api.get<ApiResponse<Record<string, unknown>>>(
                API_ROUTES.VENUE_LAYOUT(venueId)
            );
            return response.data.data;
        },
        enabled: !!venueId,
    });
}

// Save venue layout
export function useSaveVenueLayout() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ venueId, layout }: { venueId: string; layout: Record<string, unknown> }) => {
            await api.put(API_ROUTES.VENUE_LAYOUT(venueId), { layout });
        },
        onSuccess: (_, { venueId }) => {
            queryClient.invalidateQueries({ queryKey: ['venue-layout', venueId] });
        },
    });
}

// Get venue sections
export function useVenueSections(venueId: string) {
    return useQuery({
        queryKey: ['venue-sections', venueId],
        queryFn: async () => {
            const response = await api.get<ApiResponse<Section[]>>(API_ROUTES.VENUE_SECTIONS(venueId));
            return response.data.data;
        },
        enabled: !!venueId,
    });
}

// Create venue
export function useCreateVenue() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateVenueRequest) => {
            const response = await api.post<ApiResponse<Venue>>(API_ROUTES.VENUES, data);
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['venues'] });
        },
    });
}

// Create section
export function useCreateSection() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateSectionRequest) => {
            const response = await api.post<ApiResponse<Section>>(API_ROUTES.SECTIONS, data);
            return response.data.data;
        },
        onSuccess: (_, { venueId }) => {
            queryClient.invalidateQueries({ queryKey: ['venue-sections', venueId] });
        },
    });
}

// Update section
interface UpdateSectionRequest {
    sectionId: string;
    venueId: string;
    name?: string;
    type?: string;
    capacity?: number;
    layoutConfig?: Record<string, unknown>;
}

export function useUpdateSection() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ sectionId, ...data }: UpdateSectionRequest) => {
            const response = await api.put<ApiResponse<Section>>(
                `${API_ROUTES.SECTIONS}/${sectionId}`,
                data
            );
            return response.data.data;
        },
        onSuccess: (_, { venueId }) => {
            queryClient.invalidateQueries({ queryKey: ['venue-sections', venueId] });
        },
    });
}

// Delete section
export function useDeleteSection() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ sectionId, venueId }: { sectionId: string; venueId: string }) => {
            await api.delete(`${API_ROUTES.SECTIONS}/${sectionId}`);
        },
        onSuccess: (_, { venueId }) => {
            queryClient.invalidateQueries({ queryKey: ['venue-sections', venueId] });
        },
    });
}
