'use client';

import { Search, Calendar, MapPin, SlidersHorizontal } from 'lucide-react';

interface EventFiltersProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    selectedCategory?: string;
    onCategoryChange?: (category: string) => void;
}

const categories = [
    { value: '', label: 'Todas las categorías' },
    { value: 'CONCERT', label: '🎵 Conciertos' },
    { value: 'SPORTS', label: '⚽ Deportes' },
    { value: 'THEATER', label: '🎭 Teatro' },
    { value: 'CONFERENCE', label: '📢 Conferencias' },
    { value: 'FESTIVAL', label: '🎉 Festivales' },
];

export function EventFilters({
    searchQuery,
    onSearchChange,
    selectedCategory = '',
    onCategoryChange,
}: EventFiltersProps) {
    return (
        <div className="bg-base-200 rounded-2xl p-4 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="form-control flex-1">
                    <label className="input input-bordered flex items-center gap-2">
                        <Search className="w-4 h-4 opacity-70" />
                        <input
                            type="text"
                            placeholder="Buscar eventos..."
                            className="grow"
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </label>
                </div>

                {/* Category Filter */}
                <select
                    className="select select-bordered w-full md:w-48"
                    value={selectedCategory}
                    onChange={(e) => onCategoryChange?.(e.target.value)}
                >
                    {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                            {cat.label}
                        </option>
                    ))}
                </select>

                {/* More Filters Button */}
                <button className="btn btn-outline btn-primary">
                    <SlidersHorizontal className="w-4 h-4" />
                    Más filtros
                </button>
            </div>
        </div>
    );
}
