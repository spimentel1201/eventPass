'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    CreditCard,
    Shield,
    CheckCircle,
    Loader2,
    AlertCircle,
    Trash2,
} from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { useCreateOrder } from '@/hooks/useOrders';
import { ReservationTimer } from '@/components/features/checkout/ReservationTimer';

export default function CheckoutPage() {
    const router = useRouter();
    const { isAuthenticated, user } = useAuthStore();
    const {
        items,
        totalAmount,
        totalQuantity,
        clearCart,
        removeItem,
        reservationExpiry,
        eventId,
        eventTitle,
    } = useCartStore();

    const { createOrder, isLoading, error, isSuccess, order } = useCreateOrder();
    const [acceptedTerms, setAcceptedTerms] = useState(false);

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <AlertCircle className="w-16 h-16 mx-auto text-warning mb-4" />
                <h2 className="text-2xl font-bold mb-2">Inicia sesión para continuar</h2>
                <p className="text-base-content/60 mb-6">
                    Necesitas una cuenta para completar tu compra
                </p>
                <Link href="/login?redirect=/checkout" className="btn btn-primary">
                    Iniciar sesión
                </Link>
            </div>
        );
    }

    // Empty cart
    if (items.length === 0 && !isSuccess) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <AlertCircle className="w-16 h-16 mx-auto text-error mb-4" />
                <h2 className="text-2xl font-bold mb-2">Tu carrito está vacío</h2>
                <p className="text-base-content/60 mb-6">
                    Selecciona entradas para continuar
                </p>
                <Link href="/events" className="btn btn-primary">
                    Ver eventos
                </Link>
            </div>
        );
    }

    // Success state
    if (isSuccess && order) {
        return (
            <div className="container mx-auto px-4 py-16 max-w-lg text-center">
                <div className="card bg-base-200">
                    <div className="card-body">
                        <CheckCircle className="w-20 h-20 mx-auto text-success mb-4" />
                        <h2 className="text-2xl font-bold mb-2">¡Compra exitosa!</h2>
                        <p className="text-base-content/60 mb-4">
                            Tu orden ha sido procesada correctamente
                        </p>
                        <div className="bg-base-300 rounded-lg p-4 mb-6">
                            <p className="text-sm text-base-content/60">Número de orden</p>
                            <p className="text-xl font-mono font-bold">{order.id}</p>
                        </div>
                        <p className="text-sm text-base-content/60 mb-6">
                            Recibirás un correo con los detalles de tu compra y tus tickets.
                        </p>
                        <div className="flex flex-col gap-2">
                            <Link href="/events" className="btn btn-primary">
                                Buscar más eventos
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const handleTimerExpire = () => {
        clearCart();
        router.push('/events');
    };

    const handleConfirmOrder = () => {
        if (!acceptedTerms) return;
        createOrder();
    };

    const subtotal = totalAmount();
    const serviceFee = subtotal * 0.10;
    const total = subtotal + serviceFee;

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href={`/events/${eventId}/seat-map`} className="btn btn-ghost btn-sm">
                        <ArrowLeft className="w-4 h-4" />
                        Volver
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">Checkout</h1>
                        <p className="text-base-content/60 text-sm">
                            {eventTitle || 'Confirma tu compra'}
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

            {/* Error */}
            {error && (
                <div className="alert alert-error mb-6">
                    <AlertCircle className="w-5 h-5" />
                    <span>{error.message || 'Error al procesar la orden'}</span>
                </div>
            )}

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Order Summary */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Items */}
                    <div className="card bg-base-200">
                        <div className="card-body">
                            <div className="flex justify-between items-center">
                                <h3 className="card-title text-lg">Tu Selección</h3>
                                <button
                                    className="btn btn-ghost btn-xs text-error"
                                    onClick={clearCart}
                                    disabled={isLoading}
                                >
                                    Limpiar todo
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Zona</th>
                                            <th className="text-center">Cantidad</th>
                                            <th className="text-right">Precio</th>
                                            <th className="text-right">Subtotal</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map(item => (
                                            <tr key={item.id}>
                                                <td>
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="w-3 h-3 rounded-full"
                                                            style={{ backgroundColor: item.color || '#3b82f6' }}
                                                        />
                                                        <span className="font-medium">{item.sectionName}</span>
                                                    </div>
                                                </td>
                                                <td className="text-center">{item.quantity}</td>
                                                <td className="text-right">S/ {item.pricePerTicket.toFixed(2)}</td>
                                                <td className="text-right font-medium">
                                                    S/ {(item.quantity * item.pricePerTicket).toFixed(2)}
                                                </td>
                                                <td className="text-right">
                                                    <button
                                                        className="btn btn-ghost btn-xs btn-circle text-error"
                                                        onClick={() => removeItem(item.sectionId)}
                                                        disabled={isLoading}
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* User Info */}
                    <div className="card bg-base-200">
                        <div className="card-body">
                            <h3 className="card-title text-lg">Datos del comprador</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div>
                                    <p className="text-sm text-base-content/60">Nombre</p>
                                    <p className="font-medium">{user?.fullName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-base-content/60">Email</p>
                                    <p className="font-medium">{user?.email}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Payment */}
                <div className="space-y-4">
                    {/* Payment Summary */}
                    <div className="card bg-base-200">
                        <div className="card-body">
                            <h3 className="card-title text-lg">Resumen</h3>

                            <div className="space-y-2 mt-4">
                                <div className="flex justify-between">
                                    <span className="text-base-content/60">Entradas ({totalQuantity()})</span>
                                    <span>S/ {subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-base-content/60">Cargo por servicio (10%)</span>
                                    <span>S/ {serviceFee.toFixed(2)}</span>
                                </div>
                                <div className="divider my-2" />
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total</span>
                                    <span className="text-primary">S/ {total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Card */}
                    <div className="card bg-base-200">
                        <div className="card-body">
                            <h3 className="card-title text-lg">
                                <CreditCard className="w-5 h-5" />
                                Pago
                            </h3>

                            <div className="alert alert-info mt-4">
                                <Shield className="w-5 h-5" />
                                <span className="text-sm">
                                    Demo: El pago se simula automáticamente
                                </span>
                            </div>

                            {/* Terms */}
                            <div className="form-control mt-4">
                                <label className="label cursor-pointer justify-start gap-3">
                                    <input
                                        type="checkbox"
                                        className="checkbox checkbox-primary"
                                        checked={acceptedTerms}
                                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                                        disabled={isLoading}
                                    />
                                    <span className="label-text">
                                        Acepto los{' '}
                                        <Link href="/terms" className="link link-primary">
                                            términos y condiciones
                                        </Link>
                                    </span>
                                </label>
                            </div>

                            {/* Confirm Button */}
                            <button
                                className="btn btn-primary btn-lg w-full mt-4"
                                disabled={!acceptedTerms || isLoading}
                                onClick={handleConfirmOrder}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Procesando...
                                    </>
                                ) : (
                                    <>
                                        <CreditCard className="w-5 h-5" />
                                        Pagar S/ {total.toFixed(2)}
                                    </>
                                )}
                            </button>

                            {/* Security */}
                            <div className="text-center mt-4">
                                <div className="flex items-center justify-center gap-2 text-sm text-base-content/60">
                                    <Shield className="w-4 h-4" />
                                    <span>Pago 100% seguro</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
