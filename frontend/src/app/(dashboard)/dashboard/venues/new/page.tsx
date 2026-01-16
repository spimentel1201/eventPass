'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Building2, MapPin, Globe } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateVenue } from '@/hooks/useVenues';
import { useAuthStore } from '@/stores/authStore';

const venueSchema = z.object({
    name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
    address: z.string().min(5, 'La dirección debe tener al menos 5 caracteres'),
    timezone: z.string().optional(),
});

type VenueFormData = z.infer<typeof venueSchema>;

export default function NewVenuePage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const createVenue = useCreateVenue();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<VenueFormData>({
        resolver: zodResolver(venueSchema),
        defaultValues: {
            timezone: 'America/Lima',
        },
    });

    const onSubmit = async (data: VenueFormData) => {
        try {
            // Note: In production, organizationId would come from user's organization
            const venue = await createVenue.mutateAsync({
                ...data,
                organizationId: user?.id || '', // Temporary: using user ID
            });
            router.push(`/dashboard/venues/${venue.id}/layout`);
        } catch (error) {
            console.error('Error creating venue:', error);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/dashboard/venues" className="btn btn-ghost btn-sm btn-circle">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">Nuevo Recinto</h1>
                    <p className="text-base-content/60">Crea un nuevo venue para tus eventos</p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="card bg-base-200">
                <div className="card-body space-y-4">
                    {/* Name */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium flex items-center gap-2">
                                <Building2 className="w-4 h-4" />
                                Nombre del recinto
                            </span>
                        </label>
                        <input
                            type="text"
                            className={`input input-bordered ${errors.name ? 'input-error' : ''}`}
                            placeholder="Ej: Teatro Nacional"
                            {...register('name')}
                        />
                        {errors.name && (
                            <label className="label">
                                <span className="label-text-alt text-error">{errors.name.message}</span>
                            </label>
                        )}
                    </div>

                    {/* Address */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                Dirección
                            </span>
                        </label>
                        <input
                            type="text"
                            className={`input input-bordered ${errors.address ? 'input-error' : ''}`}
                            placeholder="Ej: Av. Principal 123, Ciudad"
                            {...register('address')}
                        />
                        {errors.address && (
                            <label className="label">
                                <span className="label-text-alt text-error">{errors.address.message}</span>
                            </label>
                        )}
                    </div>

                    {/* Timezone */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium flex items-center gap-2">
                                <Globe className="w-4 h-4" />
                                Zona horaria
                            </span>
                        </label>
                        <select
                            className="select select-bordered"
                            {...register('timezone')}
                        >
                            <option value="America/Lima">América/Lima (UTC-5)</option>
                            <option value="America/New_York">América/New York (UTC-5/4)</option>
                            <option value="America/Los_Angeles">América/Los Angeles (UTC-8/7)</option>
                            <option value="Europe/Madrid">Europa/Madrid (UTC+1/2)</option>
                            <option value="America/Bogota">América/Bogotá (UTC-5)</option>
                            <option value="America/Mexico_City">América/México (UTC-6)</option>
                        </select>
                    </div>

                    {/* Error */}
                    {createVenue.error && (
                        <div className="alert alert-error">
                            Error al crear el recinto. Por favor intenta de nuevo.
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <Link href="/dashboard/venues" className="btn btn-ghost flex-1">
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            className="btn btn-primary flex-1"
                            disabled={isSubmitting || createVenue.isPending}
                        >
                            {(isSubmitting || createVenue.isPending) && (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            )}
                            Crear y Configurar Layout
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
