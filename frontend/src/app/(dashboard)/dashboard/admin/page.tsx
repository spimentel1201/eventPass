'use client';

import { useAdminDashboard } from '@/hooks/useAdmin';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import {
    Users,
    ShoppingCart,
    DollarSign,
    TrendingUp,
    Calendar,
    AlertCircle,
    ArrowRight,
    Ticket,
    Building2,
    Shield,
} from 'lucide-react';

export default function AdminDashboardPage() {
    const { user } = useAuthStore();
    const { data: stats, isLoading, error } = useAdminDashboard();

    // Check if user is admin
    if (user?.role !== 'ADMIN') {
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

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="skeleton h-8 w-48" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="skeleton h-32 rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-16">
                <AlertCircle className="w-16 h-16 mx-auto text-error mb-4" />
                <h2 className="text-2xl font-bold mb-2">Error al cargar</h2>
                <p className="text-base-content/60">
                    No se pudieron cargar las estadísticas.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Shield className="w-8 h-8 text-error" />
                    Panel de Administración
                </h1>
                <p className="text-base-content/60 mt-1">
                    Resumen general de la plataforma (datos en tiempo real)
                </p>
            </div>

            {/* Main Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Users */}
                <div className="card bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                    <div className="card-body">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-base-content/60">Usuarios Totales</p>
                                <p className="text-3xl font-bold mt-1">{stats?.totalUsers ?? 0}</p>
                                <p className="text-xs text-base-content/60 mt-1">
                                    {stats?.userCount ?? 0} clientes • {stats?.staffCount ?? 0} staff • {stats?.adminCount ?? 0} admins
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                                <Users className="w-6 h-6 text-primary" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Total Events */}
                <div className="card bg-gradient-to-br from-secondary/20 to-secondary/5 border border-secondary/20">
                    <div className="card-body">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-base-content/60">Eventos</p>
                                <p className="text-3xl font-bold mt-1">{stats?.totalEvents ?? 0}</p>
                                <p className="text-xs text-base-content/60 mt-1">
                                    {stats?.publishedEvents ?? 0} publicados • {stats?.draftEvents ?? 0} borradores
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-secondary" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Total Revenue */}
                <div className="card bg-gradient-to-br from-success/20 to-success/5 border border-success/20">
                    <div className="card-body">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-base-content/60">Ingresos Totales</p>
                                <p className="text-3xl font-bold mt-1">
                                    S/ {(stats?.totalRevenue ?? 0).toLocaleString()}
                                </p>
                                <p className="text-xs text-success mt-1">
                                    S/ {(stats?.platformFees ?? 0).toLocaleString()} comisiones
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-success" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Total Orders */}
                <div className="card bg-gradient-to-br from-warning/20 to-warning/5 border border-warning/20">
                    <div className="card-body">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-base-content/60">Órdenes</p>
                                <p className="text-3xl font-bold mt-1">{stats?.totalOrders ?? 0}</p>
                                <p className="text-xs text-base-content/60 mt-1">
                                    {stats?.totalTickets ?? 0} tickets vendidos
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center">
                                <ShoppingCart className="w-6 h-6 text-warning" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card bg-base-200">
                    <div className="card-body py-4">
                        <div className="flex items-center gap-3">
                            <Building2 className="w-5 h-5 text-info" />
                            <div>
                                <p className="text-sm text-base-content/60">Organizaciones</p>
                                <p className="text-2xl font-bold">{stats?.totalOrganizations ?? 0}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="card bg-base-200">
                    <div className="card-body py-4">
                        <div className="flex items-center gap-3">
                            <Building2 className="w-5 h-5 text-accent" />
                            <div>
                                <p className="text-sm text-base-content/60">Recintos</p>
                                <p className="text-2xl font-bold">{stats?.totalVenues ?? 0}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="card bg-base-200">
                    <div className="card-body py-4">
                        <div className="flex items-center gap-3">
                            <Ticket className="w-5 h-5 text-primary" />
                            <div>
                                <p className="text-sm text-base-content/60">Tickets Vendidos</p>
                                <p className="text-2xl font-bold">{stats?.totalTickets ?? 0}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Users Card */}
                <div className="card bg-base-200">
                    <div className="card-body">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="card-title">
                                <Users className="w-5 h-5" />
                                Gestión de Usuarios
                            </h3>
                        </div>
                        <p className="text-base-content/60 mb-4">
                            {stats?.totalUsers ?? 0} usuarios registrados. Administra roles y cuentas.
                        </p>
                        <div className="card-actions justify-end">
                            <Link href="/dashboard/admin/users" className="btn btn-primary btn-sm">
                                Ver usuarios
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Orders Card */}
                <div className="card bg-base-200">
                    <div className="card-body">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="card-title">
                                <ShoppingCart className="w-5 h-5" />
                                Gestión de Órdenes
                            </h3>
                        </div>
                        <p className="text-base-content/60 mb-4">
                            {stats?.totalOrders ?? 0} órdenes procesadas. Revisa detalles y estados.
                        </p>
                        <div className="card-actions justify-end">
                            <Link href="/dashboard/admin/orders" className="btn btn-primary btn-sm">
                                Ver órdenes
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
