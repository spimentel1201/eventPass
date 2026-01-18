'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertCircle, ShoppingCart, Plus, Minus, Ticket, Trash2 } from 'lucide-react';
import { useSeatingMap } from '@/hooks/useSeatingMap';
import { useCartStore } from '@/stores/cartStore';
import { ReservationTimer } from '@/components/features/checkout/ReservationTimer';
import type { Section } from '@/types';

export default function SeatMapPage() {
    const params = useParams();
    const router = useRouter();
    const eventId = params.eventId as string;

    const { data: seatingMap, isLoading, error } = useSeatingMap(eventId);
    const { items, addItem, updateItemQuantity, removeItem, clearCart, totalAmount, totalQuantity, reservationExpiry, setEvent } = useCartStore();

    // Set event when page loads - CRITICAL: This must run to set eventId in cart
    useEffect(() => {
        if (eventId) {
            setEvent(eventId, seatingMap?.venueName || 'Evento');
        }
    }, [eventId, seatingMap?.venueName, setEvent]);

    const handleTimerExpire = () => {
        clearCart();
        alert('Tu reserva ha expirado. Por favor selecciona nuevamente.');
    };

    const handleAddToCart = (section: Section) => {
        const config = section.layoutConfig || {};
        const price = config.basePrice || 50;

        addItem({
            sectionId: section.id,
            sectionName: section.name,
            sectionType: section.type,
            quantity: 1,
            pricePerTicket: price,
            color: config.color,
        });
    };

    const getItemQuantity = (sectionId: string) => {
        const item = items.find(i => i.sectionId === sectionId);
        return item?.quantity || 0;
    };

    const handleQuantityChange = (sectionId: string, delta: number) => {
        const current = getItemQuantity(sectionId);
        const newQty = current + delta;
        if (newQty <= 0) {
            removeItem(sectionId);
        } else {
            updateItemQuantity(sectionId, newQty);
        }
    };

    const handleProceedToCheckout = () => {
        if (totalQuantity() === 0) return;
        router.push('/checkout');
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="skeleton h-8 w-48 mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="skeleton h-48 w-full rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    if (error || !seatingMap) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <AlertCircle className="w-16 h-16 mx-auto text-error mb-4" />
                <h2 className="text-2xl font-bold mb-2">Error al cargar</h2>
                <p className="text-base-content/60 mb-6">
                    No se pudo cargar la información del evento.
                </p>
                <Link href={`/events/${eventId}`} className="btn btn-primary">
                    <ArrowLeft className="w-4 h-4" />
                    Volver al evento
                </Link>
            </div>
        );
    }

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
                            Selecciona la zona y cantidad de entradas
                        </p>
                    </div>
                </div>

                {reservationExpiry && (
                    <ReservationTimer
                        expiryTime={reservationExpiry}
                        onExpire={handleTimerExpire}
                    />
                )}
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sections */}
                <div className="lg:col-span-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {seatingMap.sections && seatingMap.sections.length > 0 ? (
                            seatingMap.sections.map((section) => (
                                <SectionCard
                                    key={section.id}
                                    section={section}
                                    quantity={getItemQuantity(section.id)}
                                    onAdd={() => handleAddToCart(section)}
                                    onQuantityChange={(delta) => handleQuantityChange(section.id, delta)}
                                />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-12">
                                <Ticket className="w-16 h-16 mx-auto text-base-content/20 mb-4" />
                                <p className="text-base-content/60">No hay secciones disponibles</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar - Cart Summary */}
                <div className="space-y-4">
                    {/* Cart */}
                    <div className="card bg-base-200">
                        <div className="card-body">
                            <h2 className="card-title">
                                <ShoppingCart className="w-5 h-5" />
                                Tu Selección
                            </h2>

                            {items.length > 0 ? (
                                <div className="space-y-3">
                                    {items.map(item => (
                                        <div key={item.id} className="flex items-center gap-3 p-2 bg-base-300/50 rounded-lg">
                                            <div
                                                className="w-3 h-3 rounded-full flex-shrink-0"
                                                style={{ backgroundColor: item.color || '#3b82f6' }}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate">{item.sectionName}</p>
                                                <p className="text-sm text-base-content/60">
                                                    {item.quantity} × S/{item.pricePerTicket}
                                                </p>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <p className="font-bold">
                                                    S/ {(item.quantity * item.pricePerTicket).toFixed(2)}
                                                </p>
                                            </div>
                                            <button
                                                className="btn btn-ghost btn-sm btn-circle text-error hover:bg-error/20"
                                                onClick={() => removeItem(item.sectionId)}
                                                title="Eliminar"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}

                                    <div className="divider my-2" />

                                    <div className="flex justify-between items-center font-bold text-lg">
                                        <span>Total</span>
                                        <span>S/ {totalAmount().toFixed(2)}</span>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-center text-base-content/60 py-4">
                                    Selecciona entradas de las secciones disponibles
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Checkout Button */}
                    {items.length > 0 && (
                        <button
                            className="btn btn-primary btn-lg w-full"
                            onClick={handleProceedToCheckout}
                        >
                            <ShoppingCart className="w-5 h-5" />
                            Continuar ({totalQuantity()} entradas)
                        </button>
                    )}

                    {/* Info */}
                    <div className="bg-base-200 rounded-xl p-4">
                        <h4 className="font-semibold mb-2">📋 Información</h4>
                        <ul className="text-sm text-base-content/70 space-y-1">
                            <li>• Máximo 10 entradas por zona</li>
                            <li>• Reserva válida por 10 minutos</li>
                            <li>• Asiento asignado al momento de compra</li>
                        </ul>
                    </div>

                    {/* Availability */}
                    <div className="bg-base-200 rounded-xl p-4">
                        <h4 className="font-semibold mb-2">📊 Disponibilidad</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                                <p className="text-base-content/60">Total</p>
                                <p className="font-bold">{seatingMap.summary?.totalCapacity || 0}</p>
                            </div>
                            <div>
                                <p className="text-base-content/60">Disponibles</p>
                                <p className="font-bold text-success">{seatingMap.summary?.totalAvailable || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Section Card Component
function SectionCard({
    section,
    quantity,
    onAdd,
    onQuantityChange,
}: {
    section: Section;
    quantity: number;
    onAdd: () => void;
    onQuantityChange: (delta: number) => void;
}) {
    const config = section.layoutConfig || {};
    const color = config.color || '#3b82f6';
    const price = config.basePrice || 50;
    // Use capacity as base - if there are sold seats, subtract them
    const rows = config.rows ?? 0;
    const seatsPerRow = config.seatsPerRow ?? 0;
    const capacity = section.capacity || (rows * seatsPerRow) || 100;
    const soldCount = section.soldCount || 0;
    const available = capacity - soldCount;

    const isInCart = quantity > 0;

    return (
        <div
            className={`card border-2 transition-all ${isInCart ? 'bg-primary/10' : 'bg-base-200'}`}
            style={{ borderColor: isInCart ? color : 'transparent' }}
        >
            <div className="card-body">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: color }}
                            />
                            <h3 className="card-title text-lg">{section.name}</h3>
                        </div>
                        <p className="text-sm text-base-content/60 mt-1">
                            {section.type} • {available} disponibles
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold" style={{ color }}>
                            S/{price}
                        </p>
                        <p className="text-xs text-base-content/60">por entrada</p>
                    </div>
                </div>

                <div className="mt-4">
                    {isInCart ? (
                        <div className="flex items-center justify-between gap-4 bg-base-300/50 rounded-lg p-3">
                            <div className="flex items-center gap-4">
                                <button
                                    className="btn btn-sm btn-circle btn-ghost hover:bg-base-content/10"
                                    onClick={() => onQuantityChange(-1)}
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="text-xl font-bold min-w-[2rem] text-center">{quantity}</span>
                                <button
                                    className="btn btn-sm btn-circle btn-ghost hover:bg-base-content/10"
                                    onClick={() => onQuantityChange(1)}
                                    disabled={quantity >= 10 || quantity >= available}
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="text-right">
                                <p className="text-xl font-bold" style={{ color }}>
                                    S/ {(price * quantity).toFixed(2)}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <button
                            className="btn btn-primary w-full"
                            onClick={onAdd}
                            disabled={available === 0}
                            style={available > 0 ? { backgroundColor: color, borderColor: color } : {}}
                        >
                            <Plus className="w-4 h-4" />
                            Agregar
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
