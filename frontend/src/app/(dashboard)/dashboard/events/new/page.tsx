'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Calendar, MapPin, Clock, Info } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateEvent } from '@/hooks/useOrganizerEvents';
import { useVenues } from '@/hooks/useVenues';

const eventSchema = z.object({
    title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
    description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
    venueId: z.string().min(1, 'Selecciona un recinto'),
    startDate: z.string().min(1, 'Selecciona fecha de inicio'),
    endDate: z.string().min(1, 'Selecciona fecha de fin'),
});

type EventFormData = z.infer<typeof eventSchema>;

function NewEventForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const preselectedVenueId = searchParams.get('venueId');

    const { data: venuesData } = useVenues(0, 100);
    const createEvent = useCreateEvent();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<EventFormData>({
        resolver: zodResolver(eventSchema),
        defaultValues: {
            venueId: preselectedVenueId || '',
        },
    });

    const onSubmit = async (data: EventFormData) => {
        try {
            const event = await createEvent.mutateAsync(data);
            router.push(`/dashboard/events/${event.id}/edit`);
        } catch (error) {
            console.error('Error creating event:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="card bg-base-200">
            <div className="card-body space-y-4">
                {/* Title */}
                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-medium">Título del evento</span>
                    </label>
                    <input
                        type="text"
                        className={`input input-bordered ${errors.title ? 'input-error' : ''}`}
                        placeholder="Ej: Concierto de Rock Nacional"
                        {...register('title')}
                    />
                    {errors.title && (
                        <label className="label">
                            <span className="label-text-alt text-error">{errors.title.message}</span>
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
                        placeholder="Describe tu evento..."
                        {...register('description')}
                    />
                    {errors.description && (
                        <label className="label">
                            <span className="label-text-alt text-error">{errors.description.message}</span>
                        </label>
                    )}
                </div>

                {/* Venue */}
                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-medium flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Recinto
                        </span>
                    </label>
                    <select
                        className={`select select-bordered ${errors.venueId ? 'select-error' : ''}`}
                        {...register('venueId')}
                    >
                        <option value="">Selecciona un recinto</option>
                        {venuesData?.content.map((venue) => (
                            <option key={venue.id} value={venue.id}>
                                {venue.name} - {venue.address}
                            </option>
                        ))}
                    </select>
                    {errors.venueId && (
                        <label className="label">
                            <span className="label-text-alt text-error">{errors.venueId.message}</span>
                        </label>
                    )}
                    {!venuesData?.content.length && (
                        <div className="alert alert-warning mt-2">
                            <Info className="w-4 h-4" />
                            <span>
                                No tienes recintos.{' '}
                                <Link href="/dashboard/venues/new" className="link">
                                    Crea uno primero
                                </Link>
                            </span>
                        </div>
                    )}
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Fecha de inicio
                            </span>
                        </label>
                        <input
                            type="datetime-local"
                            className={`input input-bordered ${errors.startDate ? 'input-error' : ''}`}
                            {...register('startDate')}
                        />
                        {errors.startDate && (
                            <label className="label">
                                <span className="label-text-alt text-error">{errors.startDate.message}</span>
                            </label>
                        )}
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Fecha de fin
                            </span>
                        </label>
                        <input
                            type="datetime-local"
                            className={`input input-bordered ${errors.endDate ? 'input-error' : ''}`}
                            {...register('endDate')}
                        />
                        {errors.endDate && (
                            <label className="label">
                                <span className="label-text-alt text-error">{errors.endDate.message}</span>
                            </label>
                        )}
                    </div>
                </div>

                {/* Error */}
                {createEvent.error && (
                    <div className="alert alert-error">
                        Error al crear el evento. Por favor intenta de nuevo.
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                    <Link href="/dashboard/events" className="btn btn-ghost flex-1">
                        Cancelar
                    </Link>
                    <button
                        type="submit"
                        className="btn btn-primary flex-1"
                        disabled={isSubmitting || createEvent.isPending}
                    >
                        {(isSubmitting || createEvent.isPending) && (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        )}
                        Crear Evento
                    </button>
                </div>
            </div>
        </form>
    );
}

export default function NewEventPage() {
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/dashboard/events" className="btn btn-ghost btn-sm btn-circle">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">Nuevo Evento</h1>
                    <p className="text-base-content/60">Crea un nuevo evento para tu público</p>
                </div>
            </div>

            {/* Form with Suspense for useSearchParams */}
            <Suspense fallback={<div className="skeleton h-96 w-full" />}>
                <NewEventForm />
            </Suspense>
        </div>
    );
}
