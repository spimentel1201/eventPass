'use client';

import { ShoppingCart, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { SelectedSeat } from '@/stores/cartStore';

interface SeatCounterProps {
    selectedSeats: SelectedSeat[];
    totalAmount: number;
    maxSeats: number;
    onClearAll: () => void;
    onRemoveSeat: (seatId: string) => void;
}

export function SeatCounter({
    selectedSeats,
    totalAmount,
    maxSeats,
    onClearAll,
    onRemoveSeat,
}: SeatCounterProps) {
    if (selectedSeats.length === 0) {
        return (
            <div className="bg-base-200 rounded-xl p-4 text-center">
                <ShoppingCart className="w-8 h-8 mx-auto text-base-content/40 mb-2" />
                <p className="text-base-content/60">
                    Selecciona hasta {maxSeats} asientos
                </p>
            </div>
        );
    }

    return (
        <div className="bg-base-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Asientos seleccionados ({selectedSeats.length}/{maxSeats})
                </h3>
                <button
                    className="btn btn-ghost btn-xs text-error"
                    onClick={onClearAll}
                >
                    <Trash2 className="w-4 h-4" />
                    Limpiar
                </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedSeats.map((seat) => (
                    <div
                        key={seat.id}
                        className="flex items-center justify-between bg-base-300 rounded-lg p-2"
                    >
                        <div>
                            <p className="font-medium text-sm">
                                {seat.sectionName}
                            </p>
                            <p className="text-xs text-base-content/60">
                                Fila {seat.rowLabel} - Asiento {seat.numberLabel}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-primary">
                                {formatCurrency(seat.price)}
                            </span>
                            <button
                                className="btn btn-ghost btn-xs btn-circle"
                                onClick={() => onRemoveSeat(seat.id)}
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="divider my-2" />

            <div className="flex items-center justify-between">
                <span className="text-base-content/70">Total</span>
                <span className="text-xl font-bold text-primary">
                    {formatCurrency(totalAmount)}
                </span>
            </div>
        </div>
    );
}
