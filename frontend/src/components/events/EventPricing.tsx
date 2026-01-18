'use client';

import Link from 'next/link';
import { Ticket, Shield, Clock, CreditCard, Info } from 'lucide-react';

interface PriceRange {
    min: number;
    max: number;
    currency: string;
}

interface EventPricingProps {
    eventId: string;
    status: string;
    priceRange?: PriceRange;
    sectionsCount?: number;
}

export default function EventPricing({
    eventId,
    status,
    priceRange,
    sectionsCount = 0
}: EventPricingProps) {
    const formatPrice = (price: number, currency: string = 'PEN') => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: currency,
        }).format(price);
    };

    const isAvailable = status === 'PUBLISHED';

    return (
        <div className="card bg-gradient-to-br from-base-200 to-base-300 border border-base-300 shadow-xl sticky top-24">
            <div className="card-body">
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                    <h3 className="card-title text-xl">
                        <Ticket className="w-5 h-5 text-primary" />
                        Entradas
                    </h3>
                    {isAvailable && (
                        <span className="badge badge-success animate-pulse">
                            ● En venta
                        </span>
                    )}
                </div>

                <div className="divider my-2" />

                {/* Price Range */}
                {priceRange && (
                    <div className="bg-base-100/50 rounded-xl p-4 mb-4">
                        <p className="text-sm text-base-content/60 mb-1">Precios desde</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-primary">
                                {formatPrice(priceRange.min, priceRange.currency)}
                            </span>
                            {priceRange.max > priceRange.min && (
                                <span className="text-base-content/60">
                                    - {formatPrice(priceRange.max, priceRange.currency)}
                                </span>
                            )}
                        </div>
                        {sectionsCount > 0 && (
                            <p className="text-sm text-base-content/50 mt-1">
                                {sectionsCount} zonas disponibles
                            </p>
                        )}
                    </div>
                )}

                {/* CTA Button */}
                {isAvailable ? (
                    <Link
                        href={`/events/${eventId}/seat-map`}
                        className="btn btn-primary btn-lg w-full gap-2 mb-4"
                    >
                        <Ticket className="w-5 h-5" />
                        Comprar Entradas
                    </Link>
                ) : (
                    <button className="btn btn-disabled btn-lg w-full mb-4" disabled>
                        {status === 'DRAFT' ? 'Próximamente' : 'No disponible'}
                    </button>
                )}

                {/* Trust Badges */}
                <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-base-content/60">
                        <Shield className="w-4 h-4 text-success" />
                        <span>Compra 100% segura</span>
                    </div>
                    <div className="flex items-center gap-2 text-base-content/60">
                        <Clock className="w-4 h-4 text-warning" />
                        <span>Reserva garantizada por 10 min</span>
                    </div>
                    <div className="flex items-center gap-2 text-base-content/60">
                        <CreditCard className="w-4 h-4 text-info" />
                        <span>Múltiples medios de pago</span>
                    </div>
                </div>

                {/* Additional Info */}
                <div className="mt-4 p-3 bg-info/10 rounded-lg">
                    <div className="flex gap-2">
                        <Info className="w-4 h-4 text-info shrink-0 mt-0.5" />
                        <p className="text-xs text-base-content/70">
                            Recibirás tus entradas digitales por email inmediatamente después del pago.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
