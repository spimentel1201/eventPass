'use client';

import { useState } from 'react';
import { useAdminOrders } from '@/hooks/useAdmin';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import {
    ShoppingCart,
    ChevronLeft,
    ChevronRight,
    AlertCircle,
    CheckCircle,
    XCircle,
    Clock,
    RefreshCw,
    Eye,
    Filter,
} from 'lucide-react';

const ORDER_STATUSES = [
    { value: '', label: 'Todos', icon: Filter, color: 'badge-ghost' },
    { value: 'PENDING', label: 'Pendiente', icon: Clock, color: 'badge-warning' },
    { value: 'PAID', label: 'Pagado', icon: CheckCircle, color: 'badge-success' },
    { value: 'FAILED', label: 'Fallido', icon: XCircle, color: 'badge-error' },
    { value: 'REFUNDED', label: 'Reembolsado', icon: RefreshCw, color: 'badge-info' },
];

export default function AdminOrdersPage() {
    const { user: currentUser } = useAuthStore();
    const [page, setPage] = useState(0);
    const [statusFilter, setStatusFilter] = useState<string>('');

    const { data, isLoading, error } = useAdminOrders(page, 10, {
        status: statusFilter || undefined
    });

    // Check if user is admin
    if (currentUser?.role !== 'ADMIN') {
        return (
            <div className="text-center py-16">
                <AlertCircle className="w-16 h-16 mx-auto text-error mb-4" />
                <h2 className="text-2xl font-bold mb-2">Acceso Denegado</h2>
                <p className="text-base-content/60 mb-6">
                    No tienes permisos para acceder a esta sección.
                </p>
                <Link href="/dashboard" className="btn btn-primary">
                    Volver al Dashboard
                </Link>
            </div>
        );
    }

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

    const formatCurrency = (amount: number, currency: string = 'PEN') => {
        return `${currency === 'PEN' ? 'S/' : '$'} ${amount.toFixed(2)}`;
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="skeleton h-8 w-48" />
                <div className="skeleton h-96 rounded-xl" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-16">
                <AlertCircle className="w-16 h-16 mx-auto text-error mb-4" />
                <h2 className="text-2xl font-bold mb-2">Error al cargar</h2>
                <p className="text-base-content/60">
                    No se pudieron cargar las órdenes.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <ShoppingCart className="w-8 h-8" />
                        Gestión de Órdenes
                    </h1>
                    <p className="text-base-content/60 mt-1">
                        {data?.totalElements ?? 0} órdenes en total
                    </p>
                </div>
                <Link href="/dashboard/admin" className="btn btn-ghost">
                    <ChevronLeft className="w-4 h-4" />
                    Volver
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
                {ORDER_STATUSES.map((status) => (
                    <button
                        key={status.value}
                        className={`btn btn-sm ${statusFilter === status.value ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => {
                            setStatusFilter(status.value);
                            setPage(0);
                        }}
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
                                    <th>ID</th>
                                    <th>Cliente</th>
                                    <th>Evento</th>
                                    <th>Estado</th>
                                    <th>Tickets</th>
                                    <th className="text-right">Total</th>
                                    <th>Fecha</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data?.content.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-8 text-base-content/60">
                                            No hay órdenes que mostrar
                                        </td>
                                    </tr>
                                ) : (
                                    data?.content.map((order) => (
                                        <tr key={order.id} className="hover">
                                            <td>
                                                <code className="text-xs bg-base-300 px-2 py-1 rounded">
                                                    {order.id.slice(0, 8)}...
                                                </code>
                                            </td>
                                            <td>
                                                <div>
                                                    <p className="font-medium">{order.userName}</p>
                                                    <p className="text-xs text-base-content/60">{order.userEmail}</p>
                                                </div>
                                            </td>
                                            <td className="max-w-[200px] truncate">
                                                {order.eventName || 'N/A'}
                                            </td>
                                            <td>{getStatusBadge(order.status)}</td>
                                            <td className="text-center">
                                                <span className="badge badge-ghost">{order.ticketCount}</span>
                                            </td>
                                            <td className="text-right font-medium">
                                                {formatCurrency(order.totalAmount, order.currency)}
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

                    {/* Pagination */}
                    {data && data.totalPages > 1 && (
                        <div className="flex justify-center items-center gap-4 mt-6">
                            <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => setPage((p) => Math.max(0, p - 1))}
                                disabled={page === 0}
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Anterior
                            </button>
                            <span className="text-sm">
                                Página {page + 1} de {data.totalPages}
                            </span>
                            <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => setPage((p) => p + 1)}
                                disabled={page >= data.totalPages - 1}
                            >
                                Siguiente
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Summary Card */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="card bg-base-200">
                    <div className="card-body py-4">
                        <p className="text-sm text-base-content/60">Total Órdenes</p>
                        <p className="text-2xl font-bold">{data?.totalElements ?? 0}</p>
                    </div>
                </div>
                <div className="card bg-success/20">
                    <div className="card-body py-4">
                        <p className="text-sm text-success">Pagadas</p>
                        <p className="text-2xl font-bold text-success">
                            {data?.content.filter(o => o.status === 'PAID').length ?? 0}
                        </p>
                    </div>
                </div>
                <div className="card bg-warning/20">
                    <div className="card-body py-4">
                        <p className="text-sm text-warning">Pendientes</p>
                        <p className="text-2xl font-bold text-warning">
                            {data?.content.filter(o => o.status === 'PENDING').length ?? 0}
                        </p>
                    </div>
                </div>
                <div className="card bg-error/20">
                    <div className="card-body py-4">
                        <p className="text-sm text-error">Fallidas</p>
                        <p className="text-2xl font-bold text-error">
                            {data?.content.filter(o => o.status === 'FAILED').length ?? 0}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
