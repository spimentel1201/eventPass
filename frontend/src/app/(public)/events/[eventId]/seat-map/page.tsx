'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertCircle, ShoppingCart } from 'lucide-react';
import { useSeatingMap } from '@/hooks/useSeatingMap';
import { useSeatSelection } from '@/hooks/useSeatSelection';
import { useCartStore } from '@/stores/cartStore';
import { SeatMapWrapper, SeatLegend, SeatCounter } from '@/components/features/seat-map';
import { ReservationTimer } from '@/components/features/checkout/ReservationTimer';
import type { Section, Seat } from '@/types';

export default function SeatMapPage() {
    const params = useParams();
    const router = useRouter();
    const eventId = params.eventId as string;

    const { data: seatingMap, isLoading, error } = useSeatingMap(eventId);
    const { clearCart, reservationExpiry } = useCartStore();

    const {
        selectedSeats,
        handleSeatClick,
        totalAmount,
        seatCount,
        maxSeats,
    } = useSeatSelection({
        eventId,
        onMaxSeatsReached: () => {
            // Show toast or modal
            alert(`Máximo ${maxSeats} asientos por compra`);
        },
    });

    const [showMaxAlert, setShowMaxAlert] = useState(false);

    const handleProceedToCheckout = () => {
        if (selectedSeats.length === 0) return;
        router.push('/checkout');
    };

    const handleTimerExpire = () => {
        clearCart();
        alert('Tu reserva ha expirado. Por favor selecciona nuevamente tus asientos.');
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="skeleton h-8 w-48 mb-6" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <div className="skeleton h-96 w-full rounded-2xl" />
                    </div>
                    <div className="space-y-4">
                        <div className="skeleton h-32 w-full rounded-xl" />
                        <div className="skeleton h-48 w-full rounded-xl" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !seatingMap) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <AlertCircle className="w-16 h-16 mx-auto text-error mb-4" />
                <h2 className="text-2xl font-bold mb-2">Error al cargar el mapa</h2>
                <p className="text-base-content/60 mb-6">
                    No se pudo cargar el mapa de asientos. Intenta nuevamente.
                </p>
                <Link href={`/events/${eventId}`} className="btn btn-primary">
                    <ArrowLeft className="w-4 h-4" />
                    Volver al evento
                </Link>
            </div>
        );
    }

    // Mock ticket tier for demo (in real app, this comes from API)
    const defaultTicketTierId = 'demo-tier';
    const defaultPrice = 50;

    const handleSeatSelection = (seat: Seat, section: Section) => {
        handleSeatClick(seat, section, defaultTicketTierId, defaultPrice);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Link href={`/events/${eventId}`} className="btn btn-ghost btn-sm">
                        <ArrowLeft className="w-4 h-4" />
                        Volver
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">{seatingMap.venueName}</h1>
                        <p className="text-base-content/60 text-sm">
                            Selecciona tus asientos
                        </p>
                    </div>
                </div>

                {/* Timer */}
                {reservationExpiry && (
                    <ReservationTimer
                        expiryTime={reservationExpiry}
                        onExpire={handleTimerExpire}
                    />
                )}
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Map */}
                <div className="lg:col-span-2 space-y-4">
                    <SeatMapWrapper
                        seatingMap={seatingMap}
                        selectedSeats={selectedSeats.map((s) => s.id)}
                        onSeatClick={handleSeatSelection}
                    />

                    <SeatLegend />
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    {/* Selected Seats */}
                    <SeatCounter
                        selectedSeats={selectedSeats}
                        totalAmount={totalAmount}
                        maxSeats={maxSeats}
                        onClearAll={clearCart}
                        onRemoveSeat={(seatId) => {
                            const store = useCartStore.getState();
                            store.removeSeat(seatId);
                        }}
                    />

                    {/* Checkout Button */}
                    {selectedSeats.length > 0 && (
                        <button
                            className="btn btn-primary btn-lg w-full"
                            onClick={handleProceedToCheckout}
                        >
                            <ShoppingCart className="w-5 h-5" />
                            Continuar al pago
                        </button>
                    )}

                    {/* Info */}
                    <div className="bg-base-200 rounded-xl p-4">
                        <h4 className="font-semibold mb-2">📋 Información</h4>
                        <ul className="text-sm text-base-content/70 space-y-1">
                            <li>• Máximo {maxSeats} asientos por compra</li>
                            <li>• Reserva válida por 10 minutos</li>
                            <li>• Haz click en una sección para ver asientos</li>
                            <li>• Usa la rueda del mouse para zoom</li>
                        </ul>
                    </div>

                    {/* Summary */}
                    <div className="bg-base-200 rounded-xl p-4">
                        <h4 className="font-semibold mb-2">📊 Disponibilidad</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                                <p className="text-base-content/60">Total</p>
                                <p className="font-bold">{seatingMap.summary.totalCapacity}</p>
                            </div>
                            <div>
                                <p className="text-base-content/60">Disponibles</p>
                                <p className="font-bold text-success">{seatingMap.summary.totalAvailable}</p>
                            </div>
                            <div>
                                <p className="text-base-content/60">Vendidos</p>
                                <p className="font-bold text-error">{seatingMap.summary.totalSold}</p>
                            </div>
                            <div>
                                <p className="text-base-content/60">Reservados</p>
                                <p className="font-bold text-warning">{seatingMap.summary.totalReserved}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
