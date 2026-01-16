'use client';

import { EventCard } from './EventCard';
import type { EventSummary } from '@/types';

interface EventListProps {
    events: EventSummary[];
    isLoading?: boolean;
    emptyMessage?: string;
}

export function EventList({ events, isLoading, emptyMessage = 'No hay eventos disponibles' }: EventListProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="card bg-base-200 shadow-xl">
                        <figure className="skeleton h-48 rounded-t-2xl" />
                        <div className="card-body p-4">
                            <div className="skeleton h-6 w-3/4" />
                            <div className="skeleton h-4 w-full mt-2" />
                            <div className="skeleton h-4 w-2/3 mt-1" />
                            <div className="flex gap-2 mt-4">
                                <div className="skeleton h-4 w-4" />
                                <div className="skeleton h-4 w-24" />
                            </div>
                            <div className="flex gap-2 mt-2">
                                <div className="skeleton h-4 w-4" />
                                <div className="skeleton h-4 w-32" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (!events || events.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="text-6xl mb-4">🎭</div>
                <h3 className="text-xl font-semibold text-base-content/70">{emptyMessage}</h3>
                <p className="text-base-content/50 mt-2">
                    Vuelve más tarde para ver nuevos eventos
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {events.map((event) => (
                <EventCard key={event.id} event={event} />
            ))}
        </div>
    );
}
