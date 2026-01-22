'use client';

import { useState } from 'react';
import { CreditCard, Wallet } from 'lucide-react';
import { PaymentProvider } from '@/hooks/usePayment';

interface PaymentMethodSelectorProps {
    onSelect: (provider: PaymentProvider) => void;
    selectedProvider?: PaymentProvider;
    disabled?: boolean;
}

export default function PaymentMethodSelector({
    onSelect,
    selectedProvider,
    disabled = false
}: PaymentMethodSelectorProps) {
    const [selected, setSelected] = useState<PaymentProvider | undefined>(selectedProvider);

    const handleSelect = (provider: PaymentProvider) => {
        if (disabled) return;
        setSelected(provider);
        onSelect(provider);
    };

    return (
        <div className="space-y-4">
            <h3 className="font-semibold text-lg">Selecciona método de pago</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Stripe Option */}
                <button
                    type="button"
                    onClick={() => handleSelect('STRIPE')}
                    disabled={disabled}
                    className={`card border-2 transition-all ${selected === 'STRIPE'
                        ? 'border-primary bg-primary/10'
                        : 'border-base-300 hover:border-primary/50'
                        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                    <div className="card-body items-center text-center py-6">
                        <div className="w-16 h-16 bg-[#635BFF] rounded-xl flex items-center justify-center mb-3">
                            <CreditCard className="w-8 h-8 text-white" />
                        </div>
                        <h4 className="font-bold text-lg">Tarjeta de Crédito/Débito</h4>
                        <p className="text-sm text-base-content/60">
                            Visa, Mastercard, American Express
                        </p>
                        <div className="flex gap-2 mt-2">
                            <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/visa/visa-original.svg" className="h-6" alt="Visa" />
                            <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mastercard/mastercard-original.svg" className="h-6" alt="Mastercard" />
                        </div>
                        {selected === 'STRIPE' && (
                            <div className="badge badge-primary mt-2">Seleccionado</div>
                        )}
                    </div>
                </button>

                {/* MercadoPago Option */}
                <button
                    type="button"
                    onClick={() => handleSelect('MERCADOPAGO')}
                    disabled={disabled}
                    className={`card border-2 transition-all ${selected === 'MERCADOPAGO'
                        ? 'border-primary bg-primary/10'
                        : 'border-base-300 hover:border-primary/50'
                        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                    <div className="card-body items-center text-center py-6">
                        <div className="w-16 h-16 bg-[#00B1EA] rounded-xl flex items-center justify-center mb-3">
                            <Wallet className="w-8 h-8 text-white" />
                        </div>
                        <h4 className="font-bold text-lg">MercadoPago</h4>
                        <p className="text-sm text-base-content/60">
                            Yape, Plin, Tarjetas locales
                        </p>
                        <div className="flex gap-2 mt-2">
                            <div className="badge badge-outline">Yape</div>
                            <div className="badge badge-outline">Plin</div>
                        </div>
                        {selected === 'MERCADOPAGO' && (
                            <div className="badge badge-primary mt-2">Seleccionado</div>
                        )}
                    </div>
                </button>
            </div>
        </div>
    );
}
