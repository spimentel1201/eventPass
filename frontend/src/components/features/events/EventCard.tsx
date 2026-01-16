'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Calendar, MapPin, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { EventSummary } from '@/types';

interface EventCardProps {
    event: EventSummary;
}

export function EventCard({ event }: EventCardProps) {
    return (
        <Link href={`/events/${event.id}`}>
            <div className="card bg-base-200 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group">
                {/* Image */}
                <figure className="relative h-48 overflow-hidden">
                    {event.thumbnailUrl ? (
                        <Image
                            src={event.thumbnailUrl}
                            alt={event.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
                            <Calendar className="w-12 h-12 text-primary" />
                        </div>
                    )}
                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                        <span className={`badge ${event.status === 'PUBLISHED' ? 'badge-success' :
                                event.status === 'DRAFT' ? 'badge-warning' :
                                    'badge-error'
                            }`}>
                            {event.status === 'PUBLISHED' ? 'Disponible' :
                                event.status === 'DRAFT' ? 'Borrador' :
                                    event.status === 'CANCELLED' ? 'Cancelado' : 'Finalizado'}
                        </span>
                    </div>
                </figure>

                {/* Content */}
                <div className="card-body p-4">
                    <h3 className="card-title text-lg line-clamp-1">{event.title}</h3>

                    <p className="text-base-content/60 text-sm line-clamp-2">
                        {event.description || 'Sin descripción disponible'}
                    </p>

                    {/* Event Info */}
                    <div className="flex flex-col gap-2 mt-3 text-sm text-base-content/70">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span>{formatDate(event.startTime)}</span>
                        </div>

                        {event.venueName && (
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-secondary" />
                                <span className="line-clamp-1">{event.venueName}</span>
                            </div>
                        )}
                    </div>

                    {/* CTA */}
                    <div className="card-actions justify-end mt-4">
                        <button className="btn btn-primary btn-sm">
                            Ver evento
                        </button>
                    </div>
                </div>
            </div>
        </Link>
    );
}
