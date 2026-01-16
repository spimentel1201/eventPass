'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    Plus,
    Building2,
    MapPin,
    MoreVertical,
    Edit,
    Trash2,
    Eye,
    Loader2,
    Layout,
} from 'lucide-react';
import { useVenues } from '@/hooks/useVenues';

export default function VenuesPage() {
    const [page, setPage] = useState(0);
    const { data, isLoading, error } = useVenues(page, 10);

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
                Error al cargar recintos. Por favor intenta de nuevo.
            </div>
        );
    }

    const venues = data?.content || [];
    const totalPages = data?.totalPages || 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Recintos</h1>
                    <p className="text-base-content/60">Gestiona tus venues y layouts</p>
                </div>
                <Link href="/dashboard/venues/new" className="btn btn-primary">
                    <Plus className="w-4 h-4" />
                    Nuevo Recinto
                </Link>
            </div>

            {/* Venues Grid */}
            {venues.length === 0 ? (
                <div className="card bg-base-200">
                    <div className="card-body items-center text-center py-12">
                        <Building2 className="w-16 h-16 text-base-content/30 mb-4" />
                        <h3 className="text-lg font-semibold">No hay recintos</h3>
                        <p className="text-base-content/60 mb-4">
                            Crea tu primer recinto para gestionar eventos
                        </p>
                        <Link href="/dashboard/venues/new" className="btn btn-primary">
                            <Plus className="w-4 h-4" />
                            Crear Recinto
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {venues.map((venue) => (
                        <div key={venue.id} className="card bg-base-200">
                            <div className="card-body p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 rounded-xl bg-primary/20">
                                            <Building2 className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">{venue.name}</h3>
                                            <p className="text-sm text-base-content/60 flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />
                                                {venue.address || 'Sin dirección'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Actions dropdown */}
                                    <div className="dropdown dropdown-end">
                                        <label tabIndex={0} className="btn btn-ghost btn-sm btn-circle">
                                            <MoreVertical className="w-4 h-4" />
                                        </label>
                                        <ul
                                            tabIndex={0}
                                            className="dropdown-content menu p-2 shadow-lg bg-base-300 rounded-box w-44"
                                        >
                                            <li>
                                                <Link href={`/dashboard/venues/${venue.id}`}>
                                                    <Eye className="w-4 h-4" />
                                                    Ver Detalles
                                                </Link>
                                            </li>
                                            <li>
                                                <Link href={`/dashboard/venues/${venue.id}/layout`}>
                                                    <Layout className="w-4 h-4" />
                                                    Editor Layout
                                                </Link>
                                            </li>
                                            <li>
                                                <Link href={`/dashboard/venues/${venue.id}/edit`}>
                                                    <Edit className="w-4 h-4" />
                                                    Editar
                                                </Link>
                                            </li>
                                            <li>
                                                <button className="text-error">
                                                    <Trash2 className="w-4 h-4" />
                                                    Eliminar
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Quick actions */}
                                <div className="flex gap-2 mt-4">
                                    <Link
                                        href={`/dashboard/venues/${venue.id}/layout`}
                                        className="btn btn-sm btn-outline flex-1"
                                    >
                                        <Layout className="w-4 h-4" />
                                        Editor
                                    </Link>
                                    <Link
                                        href={`/dashboard/events/new?venueId=${venue.id}`}
                                        className="btn btn-sm btn-primary flex-1"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Evento
                                    </Link>
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
