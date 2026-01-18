'use client';

import { KONVA_COLORS } from './constants';

interface SeatLegendProps {
    showReserved?: boolean;
}

const legendItems = [
    { color: KONVA_COLORS.AVAILABLE, label: 'Disponible' },
    { color: KONVA_COLORS.SELECTED, label: 'Seleccionado' },
    { color: KONVA_COLORS.SOLD, label: 'Vendido' },
    { color: KONVA_COLORS.RESERVED, label: 'Reservado' },
];

export function SeatLegend({ showReserved = true }: SeatLegendProps) {
    const items = showReserved ? legendItems : legendItems.filter(i => i.label !== 'Reservado');

    return (
        <div className="flex flex-wrap gap-4 justify-center p-4 bg-base-200 rounded-xl">
            {items.map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                    <span
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-base-content/70">{item.label}</span>
                </div>
            ))}
        </div>
    );
}
