'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ShoppingCart, Download, Eye, Calendar, Ticket, Search } from 'lucide-react';

// Mock data - will be replaced with real API
const mockOrders = [
    {
        id: 'ORD-2026-001',
        eventTitle: 'Perú vs Brasil - Copa América 2026',
        eventDate: '2026-06-17',
        purchaseDate: '2026-01-15T14:30:00',
        tickets: 2,
        subtotal: 550,
        serviceFee: 27.50,
        total: 577.50,
        status: 'PAID',
        paymentMethod: 'Visa ****4242',
    },
    {
        id: 'ORD-2025-089',
        eventTitle: 'Coldplay - Music of the Spheres',
        eventDate: '2025-11-20',
        purchaseDate: '2025-09-10T10:15:00',
        tickets: 4,
        subtotal: 1200,
        serviceFee: 60,
        total: 1260,
        status: 'PAID',
        paymentMethod: 'Mastercard ****8888',
    },
];

export default function MyOrdersPage() {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredOrders = mockOrders.filter((order) =>
        order.eventTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-PE', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatDateTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-PE', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PAID':
                return <span className="badge badge-success">Pagado</span>;
            case 'PENDING':
                return <span className="badge badge-warning">Pendiente</span>;
            case 'REFUNDED':
                return <span className="badge badge-error">Reembolsado</span>;
            default:
                return <span className="badge badge-ghost">{status}</span>;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="btn btn-ghost btn-sm btn-circle">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <ShoppingCart className="w-6 h-6 text-warning" />
                            Mis Compras
                        </h1>
                        <p className="text-base-content/60">Historial de órdenes</p>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
                <input
                    type="text"
                    placeholder="Buscar por evento o número de orden..."
                    className="input input-bordered w-full pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Orders List */}
            {filteredOrders.length > 0 ? (
                <div className="space-y-4">
                    {filteredOrders.map((order) => (
                        <div key={order.id} className="card bg-base-200">
                            <div className="card-body">
                                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                    {/* Order Info */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-sm font-mono text-base-content/60">{order.id}</span>
                                            {getStatusBadge(order.status)}
                                        </div>
                                        <h3 className="font-bold text-lg">{order.eventTitle}</h3>
                                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-base-content/70">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                Evento: {formatDate(order.eventDate)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Ticket className="w-4 h-4" />
                                                {order.tickets} tickets
                                            </span>
                                        </div>
                                        <p className="text-xs text-base-content/50 mt-2">
                                            Comprado el {formatDateTime(order.purchaseDate)} • {order.paymentMethod}
                                        </p>
                                    </div>

                                    {/* Price & Actions */}
                                    <div className="text-right space-y-2">
                                        <div>
                                            <p className="text-xs text-base-content/50">Total pagado</p>
                                            <p className="text-2xl font-bold">S/ {order.total.toFixed(2)}</p>
                                        </div>
                                        <div className="flex gap-2 justify-end">
                                            <Link
                                                href={`/dashboard/my-tickets`}
                                                className="btn btn-ghost btn-sm gap-2"
                                            >
                                                <Eye className="w-4 h-4" />
                                                Ver Tickets
                                            </Link>
                                            <button className="btn btn-primary btn-sm gap-2">
                                                <Download className="w-4 h-4" />
                                                Descargar
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Details Collapse */}
                                <div className="collapse collapse-arrow bg-base-300 mt-4">
                                    <input type="checkbox" />
                                    <div className="collapse-title text-sm font-medium">
                                        Ver detalle de la compra
                                    </div>
                                    <div className="collapse-content">
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span>Tickets ({order.tickets})</span>
                                                <span>S/ {order.subtotal.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-base-content/70">
                                                <span>Cargo por servicio</span>
                                                <span>S/ {order.serviceFee.toFixed(2)}</span>
                                            </div>
                                            <div className="divider my-1"></div>
                                            <div className="flex justify-between font-bold">
                                                <span>Total</span>
                                                <span>S/ {order.total.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card bg-base-200">
                    <div className="card-body items-center text-center py-12">
                        <ShoppingCart className="w-16 h-16 text-base-content/20 mb-4" />
                        <h3 className="text-xl font-bold">No tienes compras</h3>
                        <p className="text-base-content/60 mb-4">
                            {searchTerm ? 'No encontramos órdenes con esa búsqueda' : 'Aún no has realizado ninguna compra'}
                        </p>
                        <Link href="/events" className="btn btn-primary">
                            Explorar eventos
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
