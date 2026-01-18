'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ShoppingCart, Download, Eye, Calendar, Ticket, Search, Loader2 } from 'lucide-react';
import { useMyOrders, OrderResponse } from '@/hooks/useOrders';
import { useMyTickets, downloadTicketPdf } from '@/hooks/useTickets';

export default function MyOrdersPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    const { data: orders = [], isLoading, error } = useMyOrders();
    const { data: tickets = [] } = useMyTickets();

    const filteredOrders = orders.filter((order: OrderResponse) =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.eventId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-PE', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatDateTime = (dateStr: string) => {
        if (!dateStr) return '';
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

    // Get tickets for an order
    const getOrderTickets = (orderId: string) => {
        // Note: This requires backend to provide order_id on tickets or a way to relate them
        // For now we'll use eventId matching
        return tickets.filter(t => t.id); // Placeholder
    };

    // Download all tickets for an order
    const handleDownloadAll = async (order: OrderResponse) => {
        setDownloadingId(order.id);
        try {
            // Download first ticket PDF as example (in real app, would generate combined PDF)
            const orderTickets = tickets.filter(t => t.eventId === order.eventId);
            if (orderTickets.length > 0) {
                await downloadTicketPdf(orderTickets[0].id, `order_${order.id.substring(0, 8)}.pdf`);
            }
        } catch (error) {
            console.error('Error downloading:', error);
        } finally {
            setDownloadingId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="card bg-base-200">
                <div className="card-body items-center text-center py-12">
                    <p className="text-error">Error al cargar las órdenes</p>
                    <Link href="/dashboard" className="btn btn-primary mt-4">
                        Volver al dashboard
                    </Link>
                </div>
            </div>
        );
    }

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
                        <p className="text-base-content/60">Historial de órdenes ({orders.length})</p>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
                <input
                    type="text"
                    placeholder="Buscar por número de orden..."
                    className="input input-bordered w-full pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Orders List */}
            {filteredOrders.length > 0 ? (
                <div className="space-y-4">
                    {filteredOrders.map((order: OrderResponse) => (
                        <div key={order.id} className="card bg-base-200">
                            <div className="card-body">
                                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                    {/* Order Info */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-sm font-mono text-base-content/60">
                                                {order.id.substring(0, 8)}...
                                            </span>
                                            {getStatusBadge(order.status)}
                                        </div>
                                        <h3 className="font-bold text-lg">
                                            {order.eventTitle || `Evento ${order.eventId?.substring(0, 8) || ''}`}
                                        </h3>
                                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-base-content/70">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                Comprado: {formatDateTime(order.createdAt)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Price & Actions */}
                                    <div className="text-right space-y-2">
                                        <div>
                                            <p className="text-xs text-base-content/50">Total pagado</p>
                                            <p className="text-2xl font-bold">
                                                {order.currency} {order.totalAmount?.toFixed(2)}
                                            </p>
                                        </div>
                                        <div className="flex gap-2 justify-end">
                                            <Link
                                                href={`/dashboard/my-tickets`}
                                                className="btn btn-ghost btn-sm gap-2"
                                            >
                                                <Eye className="w-4 h-4" />
                                                Ver Tickets
                                            </Link>
                                            <button
                                                className="btn btn-primary btn-sm gap-2"
                                                onClick={() => handleDownloadAll(order)}
                                                disabled={downloadingId === order.id}
                                            >
                                                {downloadingId === order.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Download className="w-4 h-4" />
                                                )}
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
                                                <span>Subtotal</span>
                                                <span>{order.currency} {order.netAmount?.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-base-content/70">
                                                <span>Cargo por servicio</span>
                                                <span>{order.currency} {order.platformFee?.toFixed(2)}</span>
                                            </div>
                                            <div className="divider my-1"></div>
                                            <div className="flex justify-between font-bold">
                                                <span>Total</span>
                                                <span>{order.currency} {order.totalAmount?.toFixed(2)}</span>
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
