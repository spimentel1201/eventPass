'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Loader2,
    Save,
    Calendar,
    MapPin,
    Clock,
    ImageIcon,
    Trash2,
    Eye,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEvent } from '@/hooks/useEvent';
import { useUpdateEvent, useDeleteEvent } from '@/hooks/useOrganizerEvents';
import { useVenue } from '@/hooks/useVenues';

const eventSchema = z.object({
    title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
    description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
    startDate: z.string().min(1, 'Selecciona fecha de inicio'),
    endDate: z.string().min(1, 'Selecciona fecha de fin'),
    status: z.enum(['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED']),
});

type EventFormData = z.infer<typeof eventSchema>;

function formatDateForInput(dateString: string | undefined): string {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16);
    } catch {
        return '';
    }
}

function EventEditForm({ eventId }: { eventId: string }) {
    const router = useRouter();
    const { data: event, isLoading, error } = useEvent(eventId);
    const { data: venue } = useVenue(event?.venueId || '');
    const updateEvent = useUpdateEvent();
    const deleteEvent = useDeleteEvent();
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isDirty },
    } = useForm<EventFormData>({
        resolver: zodResolver(eventSchema),
    });

    // Load event data into form
    useEffect(() => {
        if (event) {
            reset({
                title: event.title,
                description: event.description,
                startDate: formatDateForInput(event.startTime || event.startDate),
                endDate: formatDateForInput(event.endTime || event.endDate),
                status: event.status,
            });
        }
    }, [event, reset]);

    const onSubmit = async (data: EventFormData) => {
        try {
            await updateEvent.mutateAsync({
                eventId,
                data: {
                    title: data.title,
                    description: data.description,
                    startDate: data.startDate,
                    endDate: data.endDate,
                    status: data.status,
                },
            });
            router.push('/dashboard/events');
        } catch (error) {
            console.error('Error updating event:', error);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteEvent.mutateAsync(eventId);
            router.push('/dashboard/events');
        } catch (error) {
            console.error('Error deleting event:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="alert alert-error">
                No se pudo cargar el evento. Por favor intenta de nuevo.
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/events" className="btn btn-ghost btn-sm btn-circle">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">Editar Evento</h1>
                        <p className="text-base-content/60">{event.title}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link
                        href={`/events/${eventId}`}
                        className="btn btn-ghost btn-sm"
                        target="_blank"
                    >
                        <Eye className="w-4 h-4" />
                        Ver público
                    </Link>
                    <button
                        type="button"
                        className="btn btn-error btn-sm"
                        onClick={() => setShowDeleteModal(true)}
                    >
                        <Trash2 className="w-4 h-4" />
                        Eliminar
                    </button>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-2 space-y-6">
                    {/* Basic Info Card */}
                    <div className="card bg-base-200">
                        <div className="card-body">
                            <h2 className="card-title text-lg">Información Básica</h2>

                            {/* Title */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium">Título</span>
                                </label>
                                <input
                                    type="text"
                                    className={`input input-bordered ${errors.title ? 'input-error' : ''}`}
                                    {...register('title')}
                                />
                                {errors.title && (
                                    <label className="label">
                                        <span className="label-text-alt text-error">
                                            {errors.title.message}
                                        </span>
                                    </label>
                                )}
                            </div>

                            {/* Description */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium">Descripción</span>
                                </label>
                                <textarea
                                    className={`textarea textarea-bordered h-32 ${errors.description ? 'textarea-error' : ''}`}
                                    {...register('description')}
                                />
                                {errors.description && (
                                    <label className="label">
                                        <span className="label-text-alt text-error">
                                            {errors.description.message}
                                        </span>
                                    </label>
                                )}
                            </div>

                            {/* Status */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium">Estado</span>
                                </label>
                                <select
                                    className="select select-bordered"
                                    {...register('status')}
                                >
                                    <option value="DRAFT">Borrador</option>
                                    <option value="PUBLISHED">Publicado</option>
                                    <option value="CANCELLED">Cancelado</option>
                                    <option value="COMPLETED">Completado</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Date/Time Card */}
                    <div className="card bg-base-200">
                        <div className="card-body">
                            <h2 className="card-title text-lg">Fecha y Hora</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-medium flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            Inicio
                                        </span>
                                    </label>
                                    <input
                                        type="datetime-local"
                                        className={`input input-bordered ${errors.startDate ? 'input-error' : ''}`}
                                        {...register('startDate')}
                                    />
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-medium flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            Fin
                                        </span>
                                    </label>
                                    <input
                                        type="datetime-local"
                                        className={`input input-bordered ${errors.endDate ? 'input-error' : ''}`}
                                        {...register('endDate')}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3">
                        <Link href="/dashboard/events" className="btn btn-ghost">
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={!isDirty || updateEvent.isPending}
                        >
                            {updateEvent.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                            <Save className="w-4 h-4" />
                            Guardar Cambios
                        </button>
                    </div>
                </form>

                {/* Sidebar */}
                <div className="space-y-4">
                    {/* Venue Info */}
                    <div className="card bg-base-200">
                        <div className="card-body">
                            <h2 className="card-title text-lg flex items-center gap-2">
                                <MapPin className="w-5 h-5" />
                                Recinto
                            </h2>
                            {venue ? (
                                <div>
                                    <p className="font-medium">{venue.name}</p>
                                    <p className="text-sm text-base-content/60">{venue.address}</p>
                                    <Link
                                        href={`/dashboard/venues/${venue.id}/layout`}
                                        className="btn btn-outline btn-sm mt-3 w-full"
                                    >
                                        Editar Layout
                                    </Link>
                                </div>
                            ) : (
                                <p className="text-base-content/60">Cargando...</p>
                            )}
                        </div>
                    </div>

                    {/* Event Image */}
                    <div className="card bg-base-200">
                        <div className="card-body">
                            <h2 className="card-title text-lg flex items-center gap-2">
                                <ImageIcon className="w-5 h-5" />
                                Imagen
                            </h2>
                            {event.thumbnailUrl ? (
                                <img
                                    src={event.thumbnailUrl}
                                    alt={event.title}
                                    className="rounded-lg w-full h-32 object-cover"
                                />
                            ) : (
                                <div className="h-32 bg-base-300 rounded-lg flex items-center justify-center">
                                    <span className="text-base-content/40">Sin imagen</span>
                                </div>
                            )}
                            <button className="btn btn-outline btn-sm mt-2">
                                Cambiar imagen
                            </button>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="card bg-base-200">
                        <div className="card-body">
                            <h2 className="card-title text-lg">Estadísticas</h2>
                            <div className="stats stats-vertical shadow bg-base-300">
                                <div className="stat py-3">
                                    <div className="stat-title text-xs">Tickets Vendidos</div>
                                    <div className="stat-value text-lg">0</div>
                                </div>
                                <div className="stat py-3">
                                    <div className="stat-title text-xs">Ingresos</div>
                                    <div className="stat-value text-lg">$0</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg">¿Eliminar evento?</h3>
                        <p className="py-4">
                            Esta acción no se puede deshacer. Se eliminarán todos los datos
                            asociados al evento.
                        </p>
                        <div className="modal-action">
                            <button
                                className="btn btn-ghost"
                                onClick={() => setShowDeleteModal(false)}
                            >
                                Cancelar
                            </button>
                            <button
                                className="btn btn-error"
                                onClick={handleDelete}
                                disabled={deleteEvent.isPending}
                            >
                                {deleteEvent.isPending && (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                )}
                                Eliminar
                            </button>
                        </div>
                    </div>
                    <div
                        className="modal-backdrop"
                        onClick={() => setShowDeleteModal(false)}
                    />
                </div>
            )}
        </div>
    );
}

export default function EventEditPage() {
    const params = useParams();
    const eventId = params.eventId as string;

    return (
        <Suspense fallback={<div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
            <EventEditForm eventId={eventId} />
        </Suspense>
    );
}
