'use client';

import { Calendar, Users, Ticket, DollarSign, TrendingUp, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

// Mock data for demo
const stats = [
    { label: 'Eventos Activos', value: '12', icon: Calendar, change: '+2', color: 'primary' },
    { label: 'Tickets Vendidos', value: '1,847', icon: Ticket, change: '+15%', color: 'success' },
    { label: 'Ingresos del Mes', value: formatCurrency(45230), icon: DollarSign, change: '+23%', color: 'warning' },
    { label: 'Asistentes Totales', value: '4,521', icon: Users, change: '+8%', color: 'info' },
];

const recentEvents = [
    { id: '1', name: 'Concierto Rock Nacional', date: '2026-01-20', sold: 450, capacity: 500 },
    { id: '2', name: 'Festival de Verano', date: '2026-02-14', sold: 1200, capacity: 2000 },
    { id: '3', name: 'Teatro Clásico', date: '2026-01-25', sold: 180, capacity: 200 },
];

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Panel de Control</h1>
                    <p className="text-base-content/60">Bienvenido de vuelta</p>
                </div>
                <Link href="/dashboard/events/new" className="btn btn-primary">
                    <Calendar className="w-4 h-4" />
                    Nuevo Evento
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <div key={stat.label} className="card bg-base-200">
                        <div className="card-body p-4">
                            <div className="flex items-center justify-between">
                                <div className={`p-3 rounded-xl bg-${stat.color}/20`}>
                                    <stat.icon className={`w-6 h-6 text-${stat.color}`} />
                                </div>
                                <span className="badge badge-success gap-1">
                                    <TrendingUp className="w-3 h-3" />
                                    {stat.change}
                                </span>
                            </div>
                            <div className="mt-3">
                                <p className="text-2xl font-bold">{stat.value}</p>
                                <p className="text-sm text-base-content/60">{stat.label}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Events */}
                <div className="card bg-base-200">
                    <div className="card-body">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="card-title">Eventos Recientes</h2>
                            <Link href="/dashboard/events" className="btn btn-ghost btn-sm">
                                Ver todos
                                <ArrowUpRight className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="space-y-3">
                            {recentEvents.map((event) => (
                                <div
                                    key={event.id}
                                    className="flex items-center justify-between p-3 bg-base-300 rounded-lg"
                                >
                                    <div>
                                        <p className="font-medium">{event.name}</p>
                                        <p className="text-sm text-base-content/60">{event.date}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">
                                            {event.sold}/{event.capacity}
                                        </p>
                                        <div className="w-24 h-2 bg-base-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary rounded-full"
                                                style={{ width: `${(event.sold / event.capacity) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
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
                                <Users className="w-5 h-5" />
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
                                href="/dashboard/reports"
                                className="btn btn-outline justify-start gap-2"
                            >
                                <TrendingUp className="w-5 h-5" />
                                Reportes
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
