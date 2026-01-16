'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, MapPin, Clock, Users, ArrowLeft, Ticket } from 'lucide-react';
import { useEvent } from '@/hooks/useEvents';
import { formatDate } from '@/lib/utils';

export default function EventDetailPage() {
    const params = useParams();
    const eventId = params.eventId as string;
    const { data: event, isLoading, error } = useEvent(eventId);

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="skeleton h-64 w-full rounded-2xl mb-8" />
                <div className="skeleton h-10 w-1/2 mb-4" />
                <div className="skeleton h-6 w-3/4 mb-2" />
                <div className="skeleton h-6 w-2/3" />
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <div className="text-6xl mb-4">😕</div>
                <h2 className="text-2xl font-bold mb-2">Evento no encontrado</h2>
                <p className="text-base-content/60 mb-6">
                    El evento que buscas no existe o ha sido eliminado.
                </p>
                <Link href="/events" className="btn btn-primary">
                    <ArrowLeft className="w-4 h-4" />
                    Ver todos los eventos
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Back Button */}
            <Link href="/events" className="btn btn-ghost btn-sm mb-6">
                <ArrowLeft className="w-4 h-4" />
                Volver a eventos
            </Link>

            {/* Hero Banner */}
            <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden mb-8">
                {event.images?.banner?.url ? (
                    <Image
                        src={event.images.banner.url}
                        alt={event.title}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
                        <Ticket className="w-24 h-24 text-primary/50" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-base-100 to-transparent" />

                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                    <span className={`badge badge-lg ${event.status === 'PUBLISHED' ? 'badge-success' :
                            event.status === 'DRAFT' ? 'badge-warning' : 'badge-error'
                        }`}>
                        {event.status === 'PUBLISHED' ? '✓ Disponible' : event.status}
                    </span>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2">
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">{event.title}</h1>

                    <div className="prose prose-invert max-w-none mb-8">
                        <p className="text-base-content/70 text-lg">
                            {event.description || 'Sin descripción disponible'}
                        </p>
                    </div>

                    {/* Event Info Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        <div className="card bg-base-200">
                            <div className="card-body p-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-primary/20 p-3 rounded-xl">
                                        <Calendar className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-base-content/60">Fecha</p>
                                        <p className="font-semibold">{formatDate(event.startTime)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card bg-base-200">
                            <div className="card-body p-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-secondary/20 p-3 rounded-xl">
                                        <Clock className="w-6 h-6 text-secondary" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-base-content/60">Duración</p>
                                        <p className="font-semibold">
                                            {event.endTime ? `Hasta ${formatDate(event.endTime)}` : 'Por confirmar'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar - Purchase Card */}
                <div className="lg:col-span-1">
                    <div className="card bg-base-200 sticky top-24">
                        <div className="card-body">
                            <h3 className="card-title text-xl">Comprar entradas</h3>

                            <div className="divider my-2" />

                            <p className="text-base-content/60 mb-4">
                                Selecciona tus asientos y asegura tu lugar en este evento.
                            </p>

                            <Link
                                href={`/events/${event.id}/seat-map`}
                                className="btn btn-primary btn-lg w-full"
                            >
                                <Ticket className="w-5 h-5" />
                                Seleccionar asientos
                            </Link>

                            <div className="mt-4 text-sm text-base-content/50 text-center">
                                <p>🔒 Compra 100% segura</p>
                                <p>⏱️ Reserva garantizada por 10 min</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
