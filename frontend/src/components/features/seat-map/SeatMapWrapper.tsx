'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import type { SeatingMap, Section, Seat } from '@/types';

// Dynamic import to avoid SSR issues with Konva
const VenueMap = dynamic(() => import('./VenueMap').then((mod) => mod.VenueMap), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center h-96 bg-base-200 rounded-2xl">
            <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
                <p className="text-base-content/60">Cargando mapa...</p>
            </div>
        </div>
    ),
});

interface SeatMapWrapperProps {
    seatingMap: SeatingMap;
    selectedSeats: string[];
    onSeatClick: (seat: Seat, section: Section) => void;
    onSectionClick?: (section: Section) => void;
    hoveredSeat?: Seat | null;
    onSeatHover?: (seat: Seat | null) => void;
}

export function SeatMapWrapper({
    seatingMap,
    selectedSeats,
    onSeatClick,
    onSectionClick,
    hoveredSeat,
    onSeatHover,
}: SeatMapWrapperProps) {
    return (
        <div className="relative">
            <VenueMap
                seatingMap={seatingMap}
                selectedSeats={selectedSeats}
                onSeatClick={onSeatClick}
                onSectionClick={onSectionClick}
                hoveredSeat={hoveredSeat}
                onSeatHover={onSeatHover}
            />
        </div>
    );
}
