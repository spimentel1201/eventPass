'use client';

import { useAuthStore } from '@/stores/authStore';
import { useAdminDashboard } from '@/hooks/useAdmin';
import { useEvents } from '@/hooks/useEvents';
import Link from 'next/link';
import {
    Calendar,
    Users,
    Ticket,
    DollarSign,
    TrendingUp,
    ArrowUpRight,
    Building2,
    ShoppingCart,
    Shield,
    Plus,
    Eye,
} from 'lucide-react';

// Admin Dashboard Component
function AdminDashboard() {
    const { data: stats, isLoading } = useAdminDashboard();

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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Shield className="w-6 h-6 text-error" />
                        Panel de Administración
                    </h1>
                    <p className="text-base-content/60">Vista global de la plataforma</p>
                </div>
            </div>

            {/* Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                    <div className="card-body p-4">
                        <div className="flex items-center justify-between">
                            <div className="p-3 rounded-xl bg-primary/20">
                                <Users className="w-6 h-6 text-primary" />
                            </div>
                        </div>
                        <div className="mt-2">
                            <p className="text-2xl font-bold">{stats?.totalUsers ?? 0}</p>
                            <p className="text-sm text-base-content/60">Usuarios</p>
                        </div>
                    </div>
                </div>

                <div className="card bg-gradient-to-br from-secondary/20 to-secondary/5 border border-secondary/20">
                    <div className="card-body p-4">
                        <div className="flex items-center justify-between">
                            <div className="p-3 rounded-xl bg-secondary/20">
                                <Calendar className="w-6 h-6 text-secondary" />
                            </div>
                            <span className="badge badge-secondary">{stats?.publishedEvents ?? 0} activos</span>
                        </div>
                        <div className="mt-2">
                            <p className="text-2xl font-bold">{stats?.totalEvents ?? 0}</p>
                            <p className="text-sm text-base-content/60">Eventos</p>
                        </div>
                    </div>
                </div>

                <div className="card bg-gradient-to-br from-success/20 to-success/5 border border-success/20">
                    <div className="card-body p-4">
                        <div className="flex items-center justify-between">
                            <div className="p-3 rounded-xl bg-success/20">
                                <DollarSign className="w-6 h-6 text-success" />
                            </div>
                        </div>
                        <div className="mt-2">
                            <p className="text-2xl font-bold">S/ {(stats?.totalRevenue ?? 0).toLocaleString()}</p>
                            <p className="text-sm text-success">+ S/ {(stats?.platformFees ?? 0).toLocaleString()} comisiones</p>
                        </div>
                    </div>
                </div>

                <div className="card bg-gradient-to-br from-warning/20 to-warning/5 border border-warning/20">
                    <div className="card-body p-4">
                        <div className="flex items-center justify-between">
                            <div className="p-3 rounded-xl bg-warning/20">
                                <ShoppingCart className="w-6 h-6 text-warning" />
                            </div>
                            <span className="badge badge-warning">{stats?.totalTickets ?? 0} tickets</span>
                        </div>
                        <div className="mt-2">
                            <p className="text-2xl font-bold">{stats?.totalOrders ?? 0}</p>
                            <p className="text-sm text-base-content/60">Órdenes</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Secondary Stats + Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Platform Stats */}
                <div className="card bg-base-200">
                    <div className="card-body">
                        <h2 className="card-title mb-4">Estadísticas de Plataforma</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-base-300 rounded-lg text-center">
                                <Building2 className="w-6 h-6 mx-auto mb-2 text-info" />
                                <p className="text-2xl font-bold">{stats?.totalOrganizations ?? 0}</p>
                                <p className="text-xs text-base-content/60">Organizaciones</p>
                            </div>
                            <div className="p-4 bg-base-300 rounded-lg text-center">
                                <Building2 className="w-6 h-6 mx-auto mb-2 text-accent" />
                                <p className="text-2xl font-bold">{stats?.totalVenues ?? 0}</p>
                                <p className="text-xs text-base-content/60">Recintos</p>
                            </div>
                            <div className="p-4 bg-base-300 rounded-lg text-center">
                                <Calendar className="w-6 h-6 mx-auto mb-2 text-success" />
                                <p className="text-2xl font-bold">{stats?.publishedEvents ?? 0}</p>
                                <p className="text-xs text-base-content/60">Publicados</p>
                            </div>
                            <div className="p-4 bg-base-300 rounded-lg text-center">
                                <Calendar className="w-6 h-6 mx-auto mb-2 text-base-content/40" />
                                <p className="text-2xl font-bold">{stats?.draftEvents ?? 0}</p>
                                <p className="text-xs text-base-content/60">Borradores</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="card bg-base-200">
                    <div className="card-body">
                        <h2 className="card-title mb-4">Acciones de Admin</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <Link href="/dashboard/admin/users" className="btn btn-outline btn-error justify-start gap-2">
                                <Users className="w-5 h-5" />
                                Usuarios
                            </Link>
                            <Link href="/dashboard/admin/orders" className="btn btn-outline btn-error justify-start gap-2">
                                <ShoppingCart className="w-5 h-5" />
                                Órdenes
                            </Link>
                            <Link href="/dashboard/events" className="btn btn-outline justify-start gap-2">
                                <Calendar className="w-5 h-5" />
                                Eventos
                            </Link>
                            <Link href="/dashboard/venues" className="btn btn-outline justify-start gap-2">
                                <Building2 className="w-5 h-5" />
                                Recintos
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Organizer Dashboard Component
function OrganizerDashboard() {
    const { user } = useAuthStore();
    const { data: eventsData, isLoading } = useEvents();

    // Get events array from PageResponse
    const eventsList = eventsData?.content ?? [];
    const recentEvents = eventsList.slice(0, 5);

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

    // Calculate stats from events
    const totalEvents = eventsList.length;
    const publishedEvents = eventsList.filter(e => e.status === 'PUBLISHED').length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Panel de Control</h1>
                    <p className="text-base-content/60">Bienvenido, {user?.fullName?.split(' ')[0] ?? 'Organizador'}</p>
                </div>
                <Link href="/dashboard/events/new" className="btn btn-primary">
                    <Plus className="w-4 h-4" />
                    Nuevo Evento
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                    <div className="card-body p-4">
                        <div className="flex items-center justify-between">
                            <div className="p-3 rounded-xl bg-primary/20">
                                <Calendar className="w-6 h-6 text-primary" />
                            </div>
                            <span className="badge badge-primary">{publishedEvents} activos</span>
                        </div>
                        <div className="mt-2">
                            <p className="text-2xl font-bold">{totalEvents}</p>
                            <p className="text-sm text-base-content/60">Mis Eventos</p>
                        </div>
                    </div>
                </div>

                <div className="card bg-gradient-to-br from-success/20 to-success/5 border border-success/20">
                    <div className="card-body p-4">
                        <div className="flex items-center justify-between">
                            <div className="p-3 rounded-xl bg-success/20">
                                <Ticket className="w-6 h-6 text-success" />
                            </div>
                            <span className="badge badge-success gap-1">
                                <TrendingUp className="w-3 h-3" />
                            </span>
                        </div>
                        <div className="mt-2">
                            <p className="text-2xl font-bold">--</p>
                            <p className="text-sm text-base-content/60">Tickets Vendidos</p>
                        </div>
                    </div>
                </div>

                <div className="card bg-gradient-to-br from-warning/20 to-warning/5 border border-warning/20">
                    <div className="card-body p-4">
                        <div className="flex items-center justify-between">
                            <div className="p-3 rounded-xl bg-warning/20">
                                <DollarSign className="w-6 h-6 text-warning" />
                            </div>
                        </div>
                        <div className="mt-2">
                            <p className="text-2xl font-bold">S/ --</p>
                            <p className="text-sm text-base-content/60">Ingresos del Mes</p>
                        </div>
                    </div>
                </div>

                <div className="card bg-gradient-to-br from-info/20 to-info/5 border border-info/20">
                    <div className="card-body p-4">
                        <div className="flex items-center justify-between">
                            <div className="p-3 rounded-xl bg-info/20">
                                <Users className="w-6 h-6 text-info" />
                            </div>
                        </div>
                        <div className="mt-2">
                            <p className="text-2xl font-bold">--</p>
                            <p className="text-sm text-base-content/60">Asistentes</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Events */}
                <div className="card bg-base-200">
                    <div className="card-body">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="card-title">Mis Eventos</h2>
                            <Link href="/dashboard/events" className="btn btn-ghost btn-sm">
                                Ver todos
                                <ArrowUpRight className="w-4 h-4" />
                            </Link>
                        </div>

                        {recentEvents.length > 0 ? (
                            <div className="space-y-3">
                                {recentEvents.map((event) => (
                                    <div
                                        key={event.id}
                                        className="flex items-center justify-between p-3 bg-base-300 rounded-lg"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{event.title}</p>
                                            <p className="text-sm text-base-content/60">
                                                {new Date(event.startTime).toLocaleDateString('es-PE')}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`badge ${event.status === 'PUBLISHED' ? 'badge-success' : 'badge-ghost'}`}>
                                                {event.status === 'PUBLISHED' ? 'Publicado' : 'Borrador'}
                                            </span>
                                            <Link href={`/dashboard/events/${event.id}/edit`} className="btn btn-ghost btn-sm btn-circle">
                                                <Eye className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-base-content/60">
                                <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>No tienes eventos aún</p>
                                <Link href="/dashboard/events/new" className="btn btn-primary btn-sm mt-4">
                                    Crear tu primer evento
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="card bg-base-200">
                    <div className="card-body">
                        <h2 className="card-title mb-4">Acciones Rápidas</h2>

                        <div className="grid grid-cols-2 gap-3">
                            <Link
                                href="/dashboard/events/new"
                                className="btn btn-outline btn-primary justify-start gap-2"
                            >
                                <Calendar className="w-5 h-5" />
                                Crear Evento
                            </Link>
                            <Link
                                href="/dashboard/venues/new"
                                className="btn btn-outline btn-secondary justify-start gap-2"
                            >
                                <Building2 className="w-5 h-5" />
                                Nuevo Recinto
                            </Link>
                            <Link
                                href="/dashboard/orders"
                                className="btn btn-outline justify-start gap-2"
                            >
                                <Ticket className="w-5 h-5" />
                                Ver Órdenes
                            </Link>
                            <Link
                                href="/dashboard/venues"
                                className="btn btn-outline justify-start gap-2"
                            >
                                <Building2 className="w-5 h-5" />
                                Mis Recintos
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Main Dashboard Page - Routes based on role
export default function DashboardPage() {
    const { user } = useAuthStore();

    // Show Admin Dashboard for ADMIN role
    if (user?.role === 'ADMIN') {
        return <AdminDashboard />;
    }

    // Show Organizer Dashboard for everyone else
    return <OrganizerDashboard />;
}
