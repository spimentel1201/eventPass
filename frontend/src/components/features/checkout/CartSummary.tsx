'use client';

import { Trash2, ShoppingBag } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { SelectedSeat } from '@/stores/cartStore';

interface CartSummaryProps {
    seats: SelectedSeat[];
    totalAmount: number;
    onRemoveSeat: (seatId: string) => void;
    onClearAll: () => void;
    isLoading?: boolean;
}

export function CartSummary({
    seats,
    totalAmount,
    onRemoveSeat,
    onClearAll,
    isLoading,
}: CartSummaryProps) {
    if (seats.length === 0) {
        return (
            <div className="card bg-base-200">
                <div className="card-body text-center">
                    <ShoppingBag className="w-12 h-12 mx-auto text-base-content/40 mb-2" />
                    <p className="text-base-content/60">Tu carrito está vacío</p>
                </div>
            </div>
        );
    }

    // Group seats by section
    const seatsBySection = seats.reduce((acc, seat) => {
        if (!acc[seat.sectionName]) {
            acc[seat.sectionName] = [];
        }
        acc[seat.sectionName].push(seat);
        return acc;
    }, {} as Record<string, SelectedSeat[]>);

    return (
        <div className="card bg-base-200">
            <div className="card-body">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="card-title text-lg">
                        <ShoppingBag className="w-5 h-5" />
                        Tu Orden ({seats.length})
                    </h3>
                    {!isLoading && (
                        <button
                            className="btn btn-ghost btn-xs text-error"
                            onClick={onClearAll}
                        >
                            <Trash2 className="w-4 h-4" />
                            Limpiar
                        </button>
                    )}
                </div>

                <div className="space-y-4 max-h-64 overflow-y-auto">
                    {Object.entries(seatsBySection).map(([sectionName, sectionSeats]) => (
                        <div key={sectionName}>
                            <h4 className="font-semibold text-sm text-primary mb-2">
                                {sectionName}
                            </h4>
                            <div className="space-y-2">
                                {sectionSeats.map((seat) => (
                                    <div
                                        key={seat.id}
                                        className="flex items-center justify-between bg-base-300 rounded-lg p-3"
                                    >
                                        <div>
                                            <p className="font-medium">
                                                Fila {seat.rowLabel} - Asiento {seat.numberLabel}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-semibold text-primary">
                                                {formatCurrency(seat.price)}
                                            </span>
                                            {!isLoading && (
                                                <button
                                                    className="btn btn-ghost btn-xs btn-circle"
                                                    onClick={() => onRemoveSeat(seat.id)}
                                                >
                                                    <Trash2 className="w-4 h-4 text-error" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="divider my-2" />

                {/* Subtotals */}
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-base-content/60">Subtotal</span>
                        <span>{formatCurrency(totalAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-base-content/60">Cargo por servicio</span>
                        <span>{formatCurrency(totalAmount * 0.1)}</span>
                    </div>
                </div>

                <div className="divider my-2" />

                {/* Total */}
                <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-2xl font-bold text-primary">
                        {formatCurrency(totalAmount * 1.1)}
                    </span>
                </div>
            </div>
        </div>
    );
}
