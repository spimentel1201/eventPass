import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { API_ROUTES } from '@/lib/constants';

// Types
export interface MyTicket {
    id: string;
    eventId: string;
    eventTitle: string;
    eventDate: string;
    venueName: string;
    venueAddress: string;
    sectionName: string;
    row: string;
    seatNumber: string;
    tierName: string;
    price: number;
    currency: string;
    qrCodeHash: string;
    status: 'VALID' | 'USED' | 'CANCELLED';
    scannedAt: string | null;
    purchasedAt: string;
}

// Hook to get user's tickets
export function useMyTickets() {
    return useQuery({
        queryKey: ['my-tickets'],
        queryFn: async () => {
            const response = await api.get<{ data: MyTicket[] }>(API_ROUTES.MY_TICKETS);
            return response.data.data;
        },
    });
}

// Hook to get a single ticket
export function useTicket(ticketId: string) {
    return useQuery({
        queryKey: ['ticket', ticketId],
        queryFn: async () => {
            const response = await api.get<{ data: MyTicket }>(API_ROUTES.TICKET(ticketId));
            return response.data.data;
        },
        enabled: !!ticketId,
    });
}

// Function to download ticket PDF
export async function downloadTicketPdf(ticketId: string, filename?: string) {
    try {
        const response = await api.get(API_ROUTES.TICKET_DOWNLOAD(ticketId), {
            responseType: 'blob',
        });

        // Create download link
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename || `ticket_${ticketId.substring(0, 8)}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        return true;
    } catch (error) {
        console.error('Error downloading PDF:', error);
        throw error;
    }
}

// Hook for download mutation (with loading state)
export function useDownloadTicket() {
    return useMutation({
        mutationFn: async ({ ticketId, filename }: { ticketId: string; filename?: string }) => {
            return downloadTicketPdf(ticketId, filename);
        },
    });
}
