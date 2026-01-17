'use client';

import { useAuthStore } from '@/stores/authStore';
import { useAdminDashboard } from '@/hooks/useAdmin';
import { useEvents } from '@/hooks/useEvents';
import { useMyTickets } from '@/hooks/useTickets';
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
                <div className="space-y-4">
                    <h2 className="text-xl font-bold">Acciones de Admin</h2>

                    <div className="grid grid-cols-2 gap-4">
                        <Link
                            href="/dashboard/admin/users"
                            className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-base-200 to-base-300 border border-base-300 p-4 hover:border-error/50 transition-all duration-300"
                        >
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-error/20">
                                    <Users className="w-5 h-5 text-error" />
                                </div>
                                <div>
                                    <p className="font-semibold group-hover:text-error transition-colors">Usuarios</p>
                                    <p className="text-xs text-base-content/50">Gestionar cuentas</p>
                                </div>
                            </div>
                        </Link>

                        <Link
                            href="/dashboard/admin/orders"
                            className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-base-200 to-base-300 border border-base-300 p-4 hover:border-warning/50 transition-all duration-300"
                        >
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-warning/20">
                                    <ShoppingCart className="w-5 h-5 text-warning" />
                                </div>
                                <div>
                                    <p className="font-semibold group-hover:text-warning transition-colors">Órdenes</p>
                                    <p className="text-xs text-base-content/50">Ver transacciones</p>
                                </div>
                            </div>
                        </Link>

                        <Link
                            href="/dashboard/events"
                            className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-base-200 to-base-300 border border-base-300 p-4 hover:border-primary/50 transition-all duration-300"
                        >
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-primary/20">
                                    <Calendar className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="font-semibold group-hover:text-primary transition-colors">Eventos</p>
                                    <p className="text-xs text-base-content/50">Ver todos</p>
                                </div>
                            </div>
                        </Link>

                        <Link
                            href="/dashboard/venues"
                            className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-base-200 to-base-300 border border-base-300 p-4 hover:border-info/50 transition-all duration-300"
                        >
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-info/20">
                                    <Building2 className="w-5 h-5 text-info" />
                                </div>
                                <div>
                                    <p className="font-semibold group-hover:text-info transition-colors">Recintos</p>
                                    <p className="text-xs text-base-content/50">Ver venues</p>
                                </div>
                            </div>
                        </Link>
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
                <div className="space-y-4">
                    <h2 className="text-xl font-bold">Acciones Rápidas</h2>

                    <div className="grid grid-cols-2 gap-4">
                        <Link
                            href="/dashboard/events/new"
                            className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-base-200 to-base-300 border border-base-300 p-4 hover:border-primary/50 transition-all duration-300"
                        >
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-primary/20">
                                    <Calendar className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="font-semibold group-hover:text-primary transition-colors">Crear Evento</p>
                                    <p className="text-xs text-base-content/50">Nuevo evento</p>
                                </div>
                            </div>
                        </Link>

                        <Link
                            href="/dashboard/venues/new"
                            className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-base-200 to-base-300 border border-base-300 p-4 hover:border-secondary/50 transition-all duration-300"
                        >
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-secondary/20">
                                    <Building2 className="w-5 h-5 text-secondary" />
                                </div>
                                <div>
                                    <p className="font-semibold group-hover:text-secondary transition-colors">Nuevo Recinto</p>
                                    <p className="text-xs text-base-content/50">Agregar venue</p>
                                </div>
                            </div>
                        </Link>

                        <Link
                            href="/dashboard/orders"
                            className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-base-200 to-base-300 border border-base-300 p-4 hover:border-success/50 transition-all duration-300"
                        >
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-success/20">
                                    <Ticket className="w-5 h-5 text-success" />
                                </div>
                                <div>
                                    <p className="font-semibold group-hover:text-success transition-colors">Ver Órdenes</p>
                                    <p className="text-xs text-base-content/50">Gestionar ventas</p>
                                </div>
                            </div>
                        </Link>

                        <Link
                            href="/dashboard/venues"
                            className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-base-200 to-base-300 border border-base-300 p-4 hover:border-info/50 transition-all duration-300"
                        >
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-info/20">
                                    <Building2 className="w-5 h-5 text-info" />
                                </div>
                                <div>
                                    <p className="font-semibold group-hover:text-info transition-colors">Mis Recintos</p>
                                    <p className="text-xs text-base-content/50">Ver venues</p>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Client Dashboard Component - For end users who buy tickets
function ClientDashboard() {
    const { user } = useAuthStore();

    // Mock data for now - will be replaced with real API calls
    const upcomingEvents = [
        {
            id: '1',
            title: 'Perú vs Brasil - Copa América 2026',
            date: '17 Jun 2026',
            time: '21:00',
            venue: 'Estadio Nacional',
            status: 'confirmed',
        },
    ];

    const recentOrders = [
        {
            id: '1',
            event: 'Perú vs Brasil',
            date: '15 Ene 2026',
            tickets: 2,
            total: 550,
            status: 'PAID',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold">¡Hola, {user?.fullName?.split(' ')[0]}! 👋</h1>
                <p className="text-base-content/60">Aquí están tus próximos eventos y compras</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                    <div className="card-body p-4">
                        <div className="flex items-center justify-between">
                            <div className="p-3 rounded-xl bg-primary/20">
                                <Ticket className="w-6 h-6 text-primary" />
                            </div>
                        </div>
                        <div className="mt-2">
                            <p className="text-2xl font-bold">2</p>
                            <p className="text-sm text-base-content/60">Tickets activos</p>
                        </div>
                    </div>
                </div>

                <div className="card bg-gradient-to-br from-success/20 to-success/5 border border-success/20">
                    <div className="card-body p-4">
                        <div className="flex items-center justify-between">
                            <div className="p-3 rounded-xl bg-success/20">
                                <Calendar className="w-6 h-6 text-success" />
                            </div>
                        </div>
                        <div className="mt-2">
                            <p className="text-2xl font-bold">1</p>
                            <p className="text-sm text-base-content/60">Próximos eventos</p>
                        </div>
                    </div>
                </div>

                <div className="card bg-gradient-to-br from-warning/20 to-warning/5 border border-warning/20">
                    <div className="card-body p-4">
                        <div className="flex items-center justify-between">
                            <div className="p-3 rounded-xl bg-warning/20">
                                <ShoppingCart className="w-6 h-6 text-warning" />
                            </div>
                        </div>
                        <div className="mt-2">
                            <p className="text-2xl font-bold">3</p>
                            <p className="text-sm text-base-content/60">Compras realizadas</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upcoming Events */}
                <div className="card bg-base-200">
                    <div className="card-body">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="card-title">Próximos Eventos</h2>
                            <Link href="/dashboard/my-events" className="btn btn-ghost btn-sm">
                                Ver todos
                            </Link>
                        </div>

                        {upcomingEvents.length > 0 ? (
                            <div className="space-y-3">
                                {upcomingEvents.map((event) => (
                                    <div key={event.id} className="flex items-center gap-4 p-3 bg-base-300 rounded-lg">
                                        <div className="p-3 rounded-lg bg-primary/20">
                                            <Calendar className="w-6 h-6 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium">{event.title}</p>
                                            <p className="text-sm text-base-content/60">
                                                {event.date} • {event.time} • {event.venue}
                                            </p>
                                        </div>
                                        <span className="badge badge-success">Confirmado</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Calendar className="w-12 h-12 mx-auto text-base-content/30 mb-3" />
                                <p className="text-base-content/60">No tienes eventos próximos</p>
                                <Link href="/events" className="btn btn-primary btn-sm mt-3">
                                    Explorar eventos
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="card bg-base-200">
                    <div className="card-body">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="card-title">Compras Recientes</h2>
                            <Link href="/dashboard/my-orders" className="btn btn-ghost btn-sm">
                                Ver todas
                            </Link>
                        </div>

                        {recentOrders.length > 0 ? (
                            <div className="space-y-3">
                                {recentOrders.map((order) => (
                                    <div key={order.id} className="flex items-center gap-4 p-3 bg-base-300 rounded-lg">
                                        <div className="p-3 rounded-lg bg-success/20">
                                            <ShoppingCart className="w-6 h-6 text-success" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium">{order.event}</p>
                                            <p className="text-sm text-base-content/60">
                                                {order.tickets} tickets • {order.date}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold">S/ {order.total}</p>
                                            <span className="badge badge-success badge-sm">Pagado</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <ShoppingCart className="w-12 h-12 mx-auto text-base-content/30 mb-3" />
                                <p className="text-base-content/60">No tienes compras aún</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold">Acciones Rápidas</h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link
                        href="/events"
                        className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-base-200 to-base-300 border border-base-300 p-4 hover:border-primary/50 transition-all duration-300"
                    >
                        <div className="flex flex-col items-center text-center gap-2">
                            <div className="p-3 rounded-lg bg-primary/20">
                                <Calendar className="w-6 h-6 text-primary" />
                            </div>
                            <p className="font-semibold group-hover:text-primary transition-colors">Explorar Eventos</p>
                        </div>
                    </Link>

                    <Link
                        href="/dashboard/my-tickets"
                        className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-base-200 to-base-300 border border-base-300 p-4 hover:border-success/50 transition-all duration-300"
                    >
                        <div className="flex flex-col items-center text-center gap-2">
                            <div className="p-3 rounded-lg bg-success/20">
                                <Ticket className="w-6 h-6 text-success" />
                            </div>
                            <p className="font-semibold group-hover:text-success transition-colors">Mis Tickets</p>
                        </div>
                    </Link>

                    <Link
                        href="/dashboard/my-orders"
                        className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-base-200 to-base-300 border border-base-300 p-4 hover:border-warning/50 transition-all duration-300"
                    >
                        <div className="flex flex-col items-center text-center gap-2">
                            <div className="p-3 rounded-lg bg-warning/20">
                                <ShoppingCart className="w-6 h-6 text-warning" />
                            </div>
                            <p className="font-semibold group-hover:text-warning transition-colors">Mis Compras</p>
                        </div>
                    </Link>

                    <Link
                        href="/dashboard/profile"
                        className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-base-200 to-base-300 border border-base-300 p-4 hover:border-info/50 transition-all duration-300"
                    >
                        <div className="flex flex-col items-center text-center gap-2">
                            <div className="p-3 rounded-lg bg-info/20">
                                <Users className="w-6 h-6 text-info" />
                            </div>
                            <p className="font-semibold group-hover:text-info transition-colors">Mi Perfil</p>
                        </div>
                    </Link>
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

    // Show Organizer Dashboard for ORGANIZER role
    if (user?.role === 'ORGANIZER') {
        return <OrganizerDashboard />;
    }

    // Show Client Dashboard for CLIENT role (default)
    return <ClientDashboard />;
}
