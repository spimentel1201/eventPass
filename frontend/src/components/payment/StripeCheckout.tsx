'use client';

import { useState, useEffect } from 'react';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import {
    Elements,
    PaymentElement,
    useStripe,
    useElements
} from '@stripe/react-stripe-js';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

interface StripeCheckoutProps {
    clientSecret: string;
    publicKey: string;
    onSuccess: () => void;
    onError: (error: string) => void;
}

// Inner form component that uses Stripe hooks
function CheckoutForm({ onSuccess, onError }: { onSuccess: () => void; onError: (error: string) => void }) {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setIsProcessing(true);
        setMessage(null);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/checkout/success`,
            },
            redirect: 'if_required',
        });

        if (error) {
            setMessage(error.message || 'Error processing payment');
            onError(error.message || 'Payment failed');
            setIsProcessing(false);
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            setMessage('Payment successful!');
            onSuccess();
        } else {
            setMessage('Payment processing...');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement
                options={{
                    layout: 'tabs',
                }}
            />

            {message && (
                <div className={`alert ${message.includes('successful') ? 'alert-success' : 'alert-error'}`}>
                    {message.includes('successful') ? (
                        <CheckCircle className="w-5 h-5" />
                    ) : (
                        <XCircle className="w-5 h-5" />
                    )}
                    <span>{message}</span>
                </div>
            )}

            <button
                type="submit"
                disabled={isProcessing || !stripe || !elements}
                className="btn btn-primary w-full btn-lg"
            >
                {isProcessing ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Procesando...
                    </>
                ) : (
                    'Pagar ahora'
                )}
            </button>
        </form>
    );
}

export default function StripeCheckout({ clientSecret, publicKey, onSuccess, onError }: StripeCheckoutProps) {
    const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);

    useEffect(() => {
        if (publicKey) {
            setStripePromise(loadStripe(publicKey));
        }
    }, [publicKey]);

    if (!stripePromise || !clientSecret) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const options = {
        clientSecret,
        appearance: {
            theme: 'night' as const,
            variables: {
                colorPrimary: '#6366f1',
                colorBackground: '#1e1e2e',
                colorText: '#ffffff',
                colorDanger: '#ef4444',
                fontFamily: 'system-ui, sans-serif',
                borderRadius: '8px',
            },
        },
    };

    return (
        <div className="card bg-base-200">
            <div className="card-body">
                <h3 className="card-title mb-4">
                    <span className="w-8 h-8 bg-[#635BFF] rounded flex items-center justify-center text-white text-sm font-bold">S</span>
                    Pago con tarjeta
                </h3>

                <Elements stripe={stripePromise} options={options}>
                    <CheckoutForm onSuccess={onSuccess} onError={onError} />
                </Elements>

                <p className="text-xs text-base-content/50 text-center mt-4">
                    Pago seguro procesado por Stripe
                </p>
            </div>
        </div>
    );
}
