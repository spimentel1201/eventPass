'use client';

import { useState } from 'react';
import { Loader2, ArrowLeft, AlertCircle } from 'lucide-react';
import PaymentMethodSelector from './PaymentMethodSelector';
import StripeCheckout from './StripeCheckout';
import MercadoPagoCheckout from './MercadoPagoCheckout';
import { PaymentProvider, PaymentResponse, useCreatePayment } from '@/hooks/usePayment';

interface PaymentCheckoutProps {
    orderId: string;
    amount: number;
    currency?: string;
    description?: string;
    onSuccess: (payment: PaymentResponse) => void;
    onCancel: () => void;
}

type Step = 'select' | 'checkout';

export default function PaymentCheckout({
    orderId,
    amount,
    currency = 'PEN',
    description = 'NeonPass Ticket Purchase',
    onSuccess,
    onCancel
}: PaymentCheckoutProps) {
    const [step, setStep] = useState<Step>('select');
    const [selectedProvider, setSelectedProvider] = useState<PaymentProvider | null>(null);
    const [payment, setPayment] = useState<PaymentResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const createPaymentMutation = useCreatePayment();

    const handleProviderSelect = async (provider: PaymentProvider) => {
        setSelectedProvider(provider);
        setError(null);

        try {
            const paymentResponse = await createPaymentMutation.mutateAsync({
                orderId,
                provider,
                amount,
                currency,
                description
            });

            setPayment(paymentResponse);

            if (paymentResponse.status === 'FAILED') {
                setError(paymentResponse.errorMessage || 'Failed to create payment');
                return;
            }

            setStep('checkout');
        } catch (err: any) {
            setError(err.message || 'Error creating payment');
        }
    };

    const handlePaymentSuccess = () => {
        if (payment) {
            onSuccess({ ...payment, status: 'COMPLETED' });
        }
    };

    const handlePaymentError = (errorMsg: string) => {
        setError(errorMsg);
    };

    const handleBack = () => {
        setStep('select');
        setPayment(null);
        setError(null);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Pago</h2>
                    <p className="text-base-content/60">
                        Total: <span className="font-bold text-primary">{currency} {amount.toFixed(2)}</span>
                    </p>
                </div>
                {step === 'checkout' && (
                    <button onClick={handleBack} className="btn btn-ghost btn-sm gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Cambiar método
                    </button>
                )}
            </div>

            {/* Error Alert */}
            {error && (
                <div className="alert alert-error">
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="btn btn-ghost btn-sm">
                        Cerrar
                    </button>
                </div>
            )}

            {/* Loading State */}
            {createPaymentMutation.isPending && (
                <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                    <p className="text-base-content/60">Preparando pago...</p>
                </div>
            )}

            {/* Step: Select Payment Method */}
            {step === 'select' && !createPaymentMutation.isPending && (
                <PaymentMethodSelector
                    onSelect={handleProviderSelect}
                    selectedProvider={selectedProvider || undefined}
                    disabled={createPaymentMutation.isPending}
                />
            )}

            {/* Step: Checkout */}
            {step === 'checkout' && payment && (
                <>
                    {selectedProvider === 'STRIPE' && payment.clientSecret && (
                        <StripeCheckout
                            clientSecret={payment.clientSecret}
                            publicKey={payment.publicKey || ''}
                            onSuccess={handlePaymentSuccess}
                            onError={handlePaymentError}
                        />
                    )}

                    {selectedProvider === 'MERCADOPAGO' && payment.checkoutUrl && (
                        <MercadoPagoCheckout
                            checkoutUrl={payment.checkoutUrl}
                            publicKey={payment.publicKey || ''}
                        />
                    )}
                </>
            )}

            {/* Cancel Button */}
            <div className="text-center">
                <button onClick={onCancel} className="btn btn-ghost">
                    Cancelar
                </button>
            </div>
        </div>
    );
}
