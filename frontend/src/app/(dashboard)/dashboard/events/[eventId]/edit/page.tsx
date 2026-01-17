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
    Youtube,
    Music,
    FileText,
    Plus,
    X,
    Info,
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
    // Media
    bannerUrl: z.string().optional(),
    youtubeVideoId: z.string().optional(),
    spotifyPlaylistId: z.string().optional(),
    // Metadata
    ageRestriction: z.string().optional(),
    additionalInfo: z.string().optional(),
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

type TabType = 'basic' | 'media' | 'info';

function EventEditForm({ eventId }: { eventId: string }) {
    const router = useRouter();
    const { data: event, isLoading, error } = useEvent(eventId);
    const { data: venue } = useVenue(event?.venueId || '');
    const updateEvent = useUpdateEvent();
    const deleteEvent = useDeleteEvent();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('basic');

    // State for dynamic lists
    const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
    const [policies, setPolicies] = useState<string[]>([]);
    const [includes, setIncludes] = useState<string[]>([]);
    const [newGalleryUrl, setNewGalleryUrl] = useState('');
    const [newPolicy, setNewPolicy] = useState('');
    const [newInclude, setNewInclude] = useState('');

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
            const media = event.media || {};
            const metadata = event.metadata || {};

            reset({
                title: event.title,
                description: event.description,
                startDate: formatDateForInput(event.startTime || event.startDate),
                endDate: formatDateForInput(event.endTime || event.endDate),
                status: event.status,
                bannerUrl: media.images?.banner?.url || event.images?.banner?.url || '',
                youtubeVideoId: media.videos?.trailer?.videoId || '',
                spotifyPlaylistId: media.audio?.playlist?.playlistId || '',
                ageRestriction: metadata.ageRestriction || '',
                additionalInfo: metadata.additionalInfo || '',
            });

            // Load dynamic lists
            setGalleryUrls(media.images?.gallery?.map((img: { url: string }) => img.url) || []);
            setPolicies(metadata.policies || []);
            setIncludes(metadata.includes || []);
        }
    }, [event, reset]);

    const onSubmit = async (data: EventFormData) => {
        try {
            // Build metadata object
            const metadata = {
                media: {
                    images: {
                        banner: data.bannerUrl ? { url: data.bannerUrl } : undefined,
                        gallery: galleryUrls.map(url => ({ url })),
                    },
                    videos: data.youtubeVideoId ? {
                        trailer: { videoId: data.youtubeVideoId, platform: 'youtube' }
                    } : undefined,
                    audio: data.spotifyPlaylistId ? {
                        playlist: { playlistId: data.spotifyPlaylistId, platform: 'spotify' }
                    } : undefined,
                },
                ageRestriction: data.ageRestriction || undefined,
                policies: policies.length > 0 ? policies : undefined,
                includes: includes.length > 0 ? includes : undefined,
                additionalInfo: data.additionalInfo || undefined,
            };

            await updateEvent.mutateAsync({
                eventId,
                data: {
                    title: data.title,
                    description: data.description,
                    startDate: data.startDate,
                    endDate: data.endDate,
                    status: data.status,
                    metadata: JSON.stringify(metadata),
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

    // Helper functions for dynamic lists
    const addGalleryUrl = () => {
        if (newGalleryUrl.trim()) {
            setGalleryUrls([...galleryUrls, newGalleryUrl.trim()]);
            setNewGalleryUrl('');
        }
    };

    const removeGalleryUrl = (index: number) => {
        setGalleryUrls(galleryUrls.filter((_, i) => i !== index));
    };

    const addPolicy = () => {
        if (newPolicy.trim()) {
            setPolicies([...policies, newPolicy.trim()]);
            setNewPolicy('');
        }
    };

    const removePolicy = (index: number) => {
        setPolicies(policies.filter((_, i) => i !== index));
    };

    const addInclude = () => {
        if (newInclude.trim()) {
            setIncludes([...includes, newInclude.trim()]);
            setNewInclude('');
        }
    };

    const removeInclude = (index: number) => {
        setIncludes(includes.filter((_, i) => i !== index));
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
        <div className="max-w-5xl mx-auto space-y-6">
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

            {/* Tabs */}
            <div className="tabs tabs-boxed bg-base-200 p-1">
                <button
                    className={`tab gap-2 ${activeTab === 'basic' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('basic')}
                >
                    <FileText className="w-4 h-4" />
                    Información Básica
                </button>
                <button
                    className={`tab gap-2 ${activeTab === 'media' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('media')}
                >
                    <ImageIcon className="w-4 h-4" />
                    Multimedia
                </button>
                <button
                    className={`tab gap-2 ${activeTab === 'info' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('info')}
                >
                    <Info className="w-4 h-4" />
                    Info Adicional
                </button>
            </div>

            {/* Main Content Grid */}
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Form Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Tab: Basic Info */}
                        {activeTab === 'basic' && (
                            <>
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
                            </>
                        )}

                        {/* Tab: Media */}
                        {activeTab === 'media' && (
                            <>
                                {/* Banner */}
                                <div className="card bg-base-200">
                                    <div className="card-body">
                                        <h2 className="card-title text-lg flex items-center gap-2">
                                            <ImageIcon className="w-5 h-5" />
                                            Imagen Principal (Banner)
                                        </h2>
                                        <div className="form-control">
                                            <label className="label">
                                                <span className="label-text">URL de la imagen</span>
                                            </label>
                                            <input
                                                type="url"
                                                placeholder="https://ejemplo.com/imagen.jpg"
                                                className="input input-bordered"
                                                {...register('bannerUrl')}
                                            />
                                            <label className="label">
                                                <span className="label-text-alt text-base-content/50">
                                                    Imagen recomendada: 1920x1080px
                                                </span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Gallery */}
                                <div className="card bg-base-200">
                                    <div className="card-body">
                                        <h2 className="card-title text-lg">Galería de Imágenes</h2>

                                        {/* Gallery list */}
                                        {galleryUrls.length > 0 && (
                                            <div className="space-y-2 mb-4">
                                                {galleryUrls.map((url, index) => (
                                                    <div key={index} className="flex items-center gap-2 bg-base-300 p-2 rounded-lg">
                                                        <span className="flex-1 text-sm truncate">{url}</span>
                                                        <button
                                                            type="button"
                                                            className="btn btn-ghost btn-sm btn-circle text-error"
                                                            onClick={() => removeGalleryUrl(index)}
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Add new gallery image */}
                                        <div className="flex gap-2">
                                            <input
                                                type="url"
                                                placeholder="URL de imagen de galería"
                                                className="input input-bordered flex-1"
                                                value={newGalleryUrl}
                                                onChange={(e) => setNewGalleryUrl(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addGalleryUrl())}
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-primary"
                                                onClick={addGalleryUrl}
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* YouTube */}
                                <div className="card bg-base-200">
                                    <div className="card-body">
                                        <h2 className="card-title text-lg flex items-center gap-2">
                                            <Youtube className="w-5 h-5 text-error" />
                                            Video de YouTube
                                        </h2>
                                        <div className="form-control">
                                            <label className="label">
                                                <span className="label-text">ID del video</span>
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="dQw4w9WgXcQ"
                                                className="input input-bordered"
                                                {...register('youtubeVideoId')}
                                            />
                                            <label className="label">
                                                <span className="label-text-alt text-base-content/50">
                                                    El ID es la parte después de v= en la URL de YouTube
                                                </span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Spotify */}
                                <div className="card bg-base-200">
                                    <div className="card-body">
                                        <h2 className="card-title text-lg flex items-center gap-2">
                                            <Music className="w-5 h-5 text-success" />
                                            Playlist de Spotify
                                        </h2>
                                        <div className="form-control">
                                            <label className="label">
                                                <span className="label-text">ID de la playlist</span>
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="37i9dQZF1DXcBWIGoYBM5M"
                                                className="input input-bordered"
                                                {...register('spotifyPlaylistId')}
                                            />
                                            <label className="label">
                                                <span className="label-text-alt text-base-content/50">
                                                    Copia el ID de la URL de Spotify o usa Compartir → Copiar enlace
                                                </span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Tab: Additional Info */}
                        {activeTab === 'info' && (
                            <>
                                {/* Age Restriction */}
                                <div className="card bg-base-200">
                                    <div className="card-body">
                                        <h2 className="card-title text-lg">Restricción de Edad</h2>
                                        <div className="form-control">
                                            <input
                                                type="text"
                                                placeholder="Ej: Mayores de 18 años"
                                                className="input input-bordered"
                                                {...register('ageRestriction')}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Policies */}
                                <div className="card bg-base-200">
                                    <div className="card-body">
                                        <h2 className="card-title text-lg">Políticas del Evento</h2>

                                        {policies.length > 0 && (
                                            <div className="space-y-2 mb-4">
                                                {policies.map((policy, index) => (
                                                    <div key={index} className="flex items-center gap-2 bg-base-300 p-2 rounded-lg">
                                                        <span className="flex-1 text-sm">{policy}</span>
                                                        <button
                                                            type="button"
                                                            className="btn btn-ghost btn-sm btn-circle text-error"
                                                            onClick={() => removePolicy(index)}
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Ej: No se permite ingreso de alimentos"
                                                className="input input-bordered flex-1"
                                                value={newPolicy}
                                                onChange={(e) => setNewPolicy(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPolicy())}
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-primary"
                                                onClick={addPolicy}
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* What's Included */}
                                <div className="card bg-base-200">
                                    <div className="card-body">
                                        <h2 className="card-title text-lg">¿Qué Incluye?</h2>

                                        {includes.length > 0 && (
                                            <div className="space-y-2 mb-4">
                                                {includes.map((include, index) => (
                                                    <div key={index} className="flex items-center gap-2 bg-success/20 p-2 rounded-lg">
                                                        <span className="flex-1 text-sm">{include}</span>
                                                        <button
                                                            type="button"
                                                            className="btn btn-ghost btn-sm btn-circle text-error"
                                                            onClick={() => removeInclude(index)}
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Ej: Acceso a zona VIP"
                                                className="input input-bordered flex-1"
                                                value={newInclude}
                                                onChange={(e) => setNewInclude(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addInclude())}
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-primary"
                                                onClick={addInclude}
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Additional Info */}
                                <div className="card bg-base-200">
                                    <div className="card-body">
                                        <h2 className="card-title text-lg">Información Adicional</h2>
                                        <div className="form-control">
                                            <textarea
                                                className="textarea textarea-bordered h-24"
                                                placeholder="Cualquier otra información importante..."
                                                {...register('additionalInfo')}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Actions */}
                        <div className="flex justify-end gap-3">
                            <Link href="/dashboard/events" className="btn btn-ghost">
                                Cancelar
                            </Link>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={updateEvent.isPending}
                            >
                                {updateEvent.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                                <Save className="w-4 h-4" />
                                Guardar Cambios
                            </button>
                        </div>
                    </div>

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

                        {/* Help */}
                        <div className="card bg-info/10 border border-info/20">
                            <div className="card-body py-4">
                                <h3 className="font-medium text-info">💡 Tips</h3>
                                <ul className="text-sm text-base-content/70 space-y-1 mt-2">
                                    <li>• Agrega multimedia para atraer más público</li>
                                    <li>• Las políticas claras reducen problemas</li>
                                    <li>• Indica restricciones de edad si aplica</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </form>

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
