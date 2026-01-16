'use client';

import { useState } from 'react';
import { usePublicEvents } from '@/hooks/useEvents';
import { EventList, EventFilters } from '@/components/features/events';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function EventsPage() {
    const [page, setPage] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [category, setCategory] = useState('');

    const { data, isLoading } = usePublicEvents(page, 12);

    // Filter events client-side (for search)
    const filteredEvents = data?.content?.filter((event) =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Hero Section */}
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                    Descubre <span className="text-primary">eventos</span> increíbles
                </h1>
                <p className="text-base-content/70 text-lg max-w-2xl mx-auto">
                    Encuentra conciertos, deportes, teatro y más. Compra tus entradas de forma segura y rápida.
                </p>
            </div>

            {/* Filters */}
            <EventFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedCategory={category}
                onCategoryChange={setCategory}
            />

            {/* Events Grid */}
            <EventList
                events={filteredEvents || []}
                isLoading={isLoading}
                emptyMessage="No se encontraron eventos"
            />

            {/* Pagination */}
            {data && data.totalPages > 1 && (
                <div className="flex justify-center mt-8 gap-2">
                    <button
                        className="btn btn-outline btn-sm"
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                        disabled={data.first}
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Anterior
                    </button>

                    <span className="btn btn-ghost btn-sm">
                        Página {page + 1} de {data.totalPages}
                    </span>

                    <button
                        className="btn btn-outline btn-sm"
                        onClick={() => setPage((p) => p + 1)}
                        disabled={data.last}
                    >
                        Siguiente
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
