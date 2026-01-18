'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, CalendarCheck, Calendar, MapPin, Clock, Ticket, ArrowRight } from 'lucide-react';

// Mock data - will be replaced with real API
const mockUpcomingEvents = [
    {
        id: '1',
        title: 'Perú vs Brasil - Copa América 2026',
        date: '2026-06-17T21:00:00',
        venue: 'Estadio Nacional',
        venueAddress: 'José Díaz s/n, Lima',
        imageUrl: 'https://imgmedia.larepublica.pe/850x501/larepublica/original/2023/09/11/64ff888ff7c70417a65ec268.webp',
        ticketCount: 2,
        section: 'Tribuna Norte',
    },
];

const mockPastEvents = [
    {
        id: '2',
        title: 'Coldplay - Music of the Spheres',
        date: '2025-11-20T20:00:00',
        venue: 'Estadio Nacional',
        venueAddress: 'José Díaz s/n, Lima',
        imageUrl: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800',
        ticketCount: 4,
        section: 'Campo VIP',
    },
];

export default function MyEventsPage() {
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-PE', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
    };

    const getDaysUntil = (dateStr: string) => {
        const eventDate = new Date(dateStr);
        const today = new Date();
        const diffTime = eventDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/dashboard" className="btn btn-ghost btn-sm btn-circle">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <CalendarCheck className="w-6 h-6 text-success" />
                        Mis Eventos
                    </h1>
                    <p className="text-base-content/60">Eventos a los que asistirás</p>
                </div>
            </div>

            {/* Upcoming Events */}
            <section>
                <h2 className="text-xl font-bold mb-4">Próximos Eventos</h2>

                {mockUpcomingEvents.length > 0 ? (
                    <div className="space-y-4">
                        {mockUpcomingEvents.map((event) => {
                            const daysUntil = getDaysUntil(event.date);
                            return (
                                <div key={event.id} className="card bg-base-200 lg:card-side overflow-hidden">
                                    {/* Image */}
                                    <figure className="lg:w-72 h-48 lg:h-auto relative">
                                        <Image
                                            src={event.imageUrl}
                                            alt={event.title}
                                            fill
                                            className="object-cover"
                                        />
                                        {daysUntil > 0 && daysUntil <= 30 && (
                                            <div className="absolute top-3 left-3 badge badge-warning gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {daysUntil} días
                                            </div>
                                        )}
                                    </figure>

                                    {/* Content */}
                                    <div className="card-body">
                                        <h3 className="card-title text-xl">{event.title}</h3>

                                        <div className="space-y-2 text-sm">
                                            <p className="flex items-center gap-2 text-base-content/70">
                                                <Calendar className="w-4 h-4 text-primary" />
                                                {formatDate(event.date)}
                                            </p>
                                            <p className="flex items-center gap-2 text-base-content/70">
                                                <Clock className="w-4 h-4 text-primary" />
                                                {formatTime(event.date)}
                                            </p>
                                            <p className="flex items-center gap-2 text-base-content/70">
                                                <MapPin className="w-4 h-4 text-primary" />
                                                {event.venue} • {event.venueAddress}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-4 mt-4">
                                            <div className="badge badge-primary gap-1">
                                                <Ticket className="w-3 h-3" />
                                                {event.ticketCount} tickets
                                            </div>
                                            <span className="text-sm text-base-content/60">{event.section}</span>
                                        </div>

                                        <div className="card-actions justify-end mt-4">
                                            <Link
                                                href={`/events/${event.id}`}
                                                className="btn btn-ghost btn-sm"
                                            >
                                                Ver evento
                                            </Link>
                                            <Link
                                                href="/dashboard/my-tickets"
                                                className="btn btn-primary btn-sm gap-2"
                                            >
                                                Ver mis tickets
                                                <ArrowRight className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="card bg-base-200">
                        <div className="card-body items-center text-center py-12">
                            <CalendarCheck className="w-16 h-16 text-base-content/20 mb-4" />
                            <h3 className="text-xl font-bold">No tienes eventos próximos</h3>
                            <p className="text-base-content/60 mb-4">
                                Explora los eventos disponibles y compra tus entradas
                            </p>
                            <Link href="/events" className="btn btn-primary">
                                Explorar eventos
                            </Link>
                        </div>
                    </div>
                )}
            </section>

            {/* Past Events */}
            <section>
                <h2 className="text-xl font-bold mb-4 text-base-content/70">Eventos Pasados</h2>

                {mockPastEvents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {mockPastEvents.map((event) => (
                            <div key={event.id} className="card bg-base-200/50 opacity-70">
                                <div className="card-body">
                                    <h3 className="card-title text-base">{event.title}</h3>
                                    <p className="text-sm text-base-content/60">
                                        {formatDate(event.date)} • {event.venue}
                                    </p>
                                    <div className="badge badge-ghost badge-sm">
                                        {event.ticketCount} tickets
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-base-content/50 text-sm">No tienes eventos pasados</p>
                )}
            </section>
        </div>
    );
}
