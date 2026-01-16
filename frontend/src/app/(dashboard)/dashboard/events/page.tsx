'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    Plus,
    Calendar,
    MapPin,
    Users,
    MoreVertical,
    Edit,
    Trash2,
    Eye,
    Loader2,
} from 'lucide-react';
import { useOrganizerEvents, useDeleteEvent } from '@/hooks/useOrganizerEvents';
import { formatDate } from '@/lib/utils';

export default function EventsPage() {
    const [page, setPage] = useState(0);
    const { data, isLoading, error } = useOrganizerEvents(page, 10);
    const deleteEvent = useDeleteEvent();

    const handleDelete = async (eventId: string) => {
        if (confirm('¿Estás seguro de eliminar este evento?')) {
            deleteEvent.mutate(eventId);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-error">
                Error al cargar eventos. Por favor intenta de nuevo.
            </div>
        );
    }

    const events = data?.content || [];
    const totalPages = data?.totalPages || 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Mis Eventos</h1>
                    <p className="text-base-content/60">Gestiona tus eventos y tickets</p>
                </div>
                <Link href="/dashboard/events/new" className="btn btn-primary">
                    <Plus className="w-4 h-4" />
                    Nuevo Evento
                </Link>
            </div>

            {/* Events Grid */}
            {events.length === 0 ? (
                <div className="card bg-base-200">
                    <div className="card-body items-center text-center py-12">
                        <Calendar className="w-16 h-16 text-base-content/30 mb-4" />
                        <h3 className="text-lg font-semibold">No hay eventos</h3>
                        <p className="text-base-content/60 mb-4">
                            Crea tu primer evento para empezar a vender tickets
                        </p>
                        <Link href="/dashboard/events/new" className="btn btn-primary">
                            <Plus className="w-4 h-4" />
                            Crear Evento
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {events.map((event) => (
                        <div key={event.id} className="card bg-base-200">
                            {/* Event Image */}
                            <figure className="h-40 bg-gradient-to-br from-primary/20 to-secondary/20">
                                {event.thumbnailUrl ? (
                                    <img
                                        src={event.thumbnailUrl}
                                        alt={event.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <Calendar className="w-12 h-12 text-primary/50" />
                                )}
                            </figure>

                            <div className="card-body p-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-semibold line-clamp-1">{event.title}</h3>
                                        <p className="text-sm text-base-content/60 flex items-center gap-1 mt-1">
                                            <Calendar className="w-3 h-3" />
                                            {formatDate(event.startDate || event.startTime)}
                                        </p>
                                        {event.venueName && (
                                            <p className="text-sm text-base-content/60 flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />
                                                {event.venueName}
                                            </p>
                                        )}
                                    </div>

                                    {/* Actions dropdown */}
                                    <div className="dropdown dropdown-end">
                                        <label tabIndex={0} className="btn btn-ghost btn-sm btn-circle">
                                            <MoreVertical className="w-4 h-4" />
                                        </label>
                                        <ul
                                            tabIndex={0}
                                            className="dropdown-content menu p-2 shadow-lg bg-base-300 rounded-box w-40"
                                        >
                                            <li>
                                                <Link href={`/events/${event.id}`}>
                                                    <Eye className="w-4 h-4" />
                                                    Ver
                                                </Link>
                                            </li>
                                            <li>
                                                <Link href={`/dashboard/events/${event.id}/edit`}>
                                                    <Edit className="w-4 h-4" />
                                                    Editar
                                                </Link>
                                            </li>
                                            <li>
                                                <button
                                                    onClick={() => handleDelete(event.id)}
                                                    className="text-error"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Eliminar
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="flex items-center gap-4 mt-3 text-sm">
                                    <div className="flex items-center gap-1 text-success">
                                        <Users className="w-4 h-4" />
                                        <span>0 vendidos</span>
                                    </div>
                                    <div className={`badge ${event.status === 'PUBLISHED' ? 'badge-success' : 'badge-warning'}`}>
                                        {event.status === 'PUBLISHED' ? 'Publicado' : 'Borrador'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center">
                    <div className="join">
                        <button
                            className="join-item btn"
                            onClick={() => setPage((p) => Math.max(0, p - 1))}
                            disabled={page === 0}
                        >
                            «
                        </button>
                        <button className="join-item btn">
                            Página {page + 1} de {totalPages}
                        </button>
                        <button
                            className="join-item btn"
                            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                            disabled={page >= totalPages - 1}
                        >
                            »
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
