'use client';

import { useEffect } from 'react';
import { Loader2, ExternalLink } from 'lucide-react';

interface MercadoPagoCheckoutProps {
    checkoutUrl: string;
    publicKey: string;
    onRedirect?: () => void;
}

export default function MercadoPagoCheckout({
    checkoutUrl,
    publicKey,
    onRedirect
}: MercadoPagoCheckoutProps) {

    const handlePayClick = () => {
        if (onRedirect) onRedirect();
        window.location.href = checkoutUrl;
    };

    if (!checkoutUrl) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="card bg-base-200">
            <div className="card-body items-center text-center">
                <div className="w-20 h-20 bg-[#00B1EA] rounded-xl flex items-center justify-center mb-4">
                    <svg viewBox="0 0 24 24" className="w-12 h-12 text-white fill-current">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                </div>

                <h3 className="text-xl font-bold mb-2">Pagar con MercadoPago</h3>

                <p className="text-base-content/60 mb-6">
                    Serás redirigido a MercadoPago para completar tu pago de forma segura.
                    Podrás pagar con:
                </p>

                <div className="flex flex-wrap gap-2 justify-center mb-6">
                    <div className="badge badge-lg badge-outline">💳 Tarjetas</div>
                    <div className="badge badge-lg badge-outline">📱 Yape</div>
                    <div className="badge badge-lg badge-outline">📱 Plin</div>
                    <div className="badge badge-lg badge-outline">🏦 Transferencia</div>
                </div>

                <button
                    onClick={handlePayClick}
                    className="btn btn-primary btn-lg gap-2"
                >
                    <ExternalLink className="w-5 h-5" />
                    Ir a MercadoPago
                </button>

                <p className="text-xs text-base-content/50 mt-4">
                    Después del pago serás redirigido de vuelta a NeonPass
                </p>
            </div>
        </div>
    );
}
