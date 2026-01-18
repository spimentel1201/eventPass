'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    Ticket,
    ShoppingCart,
    ChevronLeft,
    ChevronRight,
    AlertCircle,
    CheckCircle,
    XCircle,
    Clock,
    RefreshCw,
    Filter,
    Calendar,
    DollarSign,
} from 'lucide-react';

// Mock data for now - in real app would come from API
const MOCK_ORDERS = [
    {
        id: '1',
        eventName: 'Perú vs Argentina',
        customerName: 'Juan Pérez',
        customerEmail: 'juan@example.com',
        status: 'PAID',
        ticketCount: 2,
        totalAmount: 200,
        createdAt: '2026-01-15T10:30:00',
    },
    {
        id: '2',
        eventName: 'Concierto Rock',
        customerName: 'María García',
        customerEmail: 'maria@example.com',
        status: 'PENDING',
        ticketCount: 4,
        totalAmount: 400,
        createdAt: '2026-01-16T14:20:00',
    },
];

const ORDER_STATUSES = [
    { value: '', label: 'Todos', icon: Filter, color: 'badge-ghost' },
    { value: 'PENDING', label: 'Pendiente', icon: Clock, color: 'badge-warning' },
    { value: 'PAID', label: 'Pagado', icon: CheckCircle, color: 'badge-success' },
    { value: 'FAILED', label: 'Fallido', icon: XCircle, color: 'badge-error' },
    { value: 'REFUNDED', label: 'Reembolsado', icon: RefreshCw, color: 'badge-info' },
];

export default function DashboardOrdersPage() {
    const [statusFilter, setStatusFilter] = useState<string>('');

    const filteredOrders = statusFilter
        ? MOCK_ORDERS.filter(o => o.status === statusFilter)
        : MOCK_ORDERS;

    const getStatusBadge = (status: string) => {
        const statusConfig = ORDER_STATUSES.find((s) => s.value === status);
        const Icon = statusConfig?.icon || Clock;
        return (
            <span className={`badge ${statusConfig?.color || 'badge-ghost'} gap-1`}>
                <Icon className="w-3 h-3" />
                {statusConfig?.label || status}
            </span>
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-PE', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Calculate stats
    const totalRevenue = MOCK_ORDERS.reduce((sum, o) => sum + o.totalAmount, 0);
    const paidOrders = MOCK_ORDERS.filter(o => o.status === 'PAID').length;
    const totalTickets = MOCK_ORDERS.reduce((sum, o) => sum + o.ticketCount, 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Ticket className="w-8 h-8" />
                    Órdenes de Mis Eventos
                </h1>
                <p className="text-base-content/60 mt-1">
                    Gestiona las órdenes de tus eventos
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="card bg-base-200">
                    <div className="card-body py-4">
                        <div className="flex items-center gap-3">
                            <ShoppingCart className="w-5 h-5 text-primary" />
                            <div>
                                <p className="text-sm text-base-content/60">Total Órdenes</p>
                                <p className="text-2xl font-bold">{MOCK_ORDERS.length}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="card bg-success/20">
                    <div className="card-body py-4">
                        <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-success" />
                            <div>
                                <p className="text-sm text-success">Pagadas</p>
                                <p className="text-2xl font-bold text-success">{paidOrders}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="card bg-base-200">
                    <div className="card-body py-4">
                        <div className="flex items-center gap-3">
                            <Ticket className="w-5 h-5 text-secondary" />
                            <div>
                                <p className="text-sm text-base-content/60">Tickets Vendidos</p>
                                <p className="text-2xl font-bold">{totalTickets}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="card bg-primary/20">
                    <div className="card-body py-4">
                        <div className="flex items-center gap-3">
                            <DollarSign className="w-5 h-5 text-primary" />
                            <div>
                                <p className="text-sm text-primary">Ingresos</p>
                                <p className="text-2xl font-bold text-primary">S/ {totalRevenue}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
                {ORDER_STATUSES.map((status) => (
                    <button
                        key={status.value}
                        className={`btn btn-sm ${statusFilter === status.value ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setStatusFilter(status.value)}
                    >
                        <status.icon className="w-4 h-4" />
                        {status.label}
                    </button>
                ))}
            </div>

            {/* Orders Table */}
            <div className="card bg-base-200">
                <div className="card-body">
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Evento</th>
                                    <th>Cliente</th>
                                    <th>Estado</th>
                                    <th>Tickets</th>
                                    <th className="text-right">Total</th>
                                    <th>Fecha</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-8 text-base-content/60">
                                            No hay órdenes que mostrar
                                        </td>
                                    </tr>
                                ) : (
                                    filteredOrders.map((order) => (
                                        <tr key={order.id} className="hover">
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-primary" />
                                                    <span className="font-medium">{order.eventName}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div>
                                                    <p className="font-medium">{order.customerName}</p>
                                                    <p className="text-xs text-base-content/60">{order.customerEmail}</p>
                                                </div>
                                            </td>
                                            <td>{getStatusBadge(order.status)}</td>
                                            <td className="text-center">
                                                <span className="badge badge-ghost">{order.ticketCount}</span>
                                            </td>
                                            <td className="text-right font-medium">
                                                S/ {order.totalAmount.toFixed(2)}
                                            </td>
                                            <td className="text-sm text-base-content/60">
                                                {formatDate(order.createdAt)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Info */}
            <div className="alert alert-info">
                <AlertCircle className="w-5 h-5" />
                <span>
                    Esta vista muestra las órdenes de todos tus eventos. Para ver estadísticas detalladas,
                    ve a la página de cada evento.
                </span>
            </div>
        </div>
    );
}
