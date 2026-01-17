'use client';

import Image from 'next/image';
import { Calendar, MapPin, Clock, Ticket } from 'lucide-react';

interface EventHeroProps {
    title: string;
    bannerUrl?: string;
    startTime: string;
    endTime?: string;
    venueName?: string;
    venueAddress?: string;
    status: string;
}

export default function EventHero({
    title,
    bannerUrl,
    startTime,
    endTime,
    venueName,
    venueAddress,
    status,
}: EventHeroProps) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-PE', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('es-PE', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="relative w-full min-h-[400px] md:min-h-[500px] lg:min-h-[600px]">
            {/* Background Image */}
            {bannerUrl ? (
                <Image
                    src={bannerUrl}
                    alt={title}
                    fill
                    className="object-cover"
                    priority
                />
            ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-secondary/30 to-accent/20" />
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-base-100 via-base-100/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-base-100/90 via-transparent to-transparent" />

            {/* Content */}
            <div className="absolute inset-0 flex items-end">
                <div className="container mx-auto px-4 pb-8 md:pb-12">
                    <div className="max-w-3xl">
                        {/* Status Badge */}
                        <div className="mb-4">
                            <span className={`badge badge-lg ${status === 'PUBLISHED' ? 'badge-success' :
                                    status === 'DRAFT' ? 'badge-warning' : 'badge-error'
                                }`}>
                                {status === 'PUBLISHED' ? '🎫 Entradas disponibles' :
                                    status === 'DRAFT' ? '📝 Próximamente' : status}
                            </span>
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                            {title}
                        </h1>

                        {/* Info Pills */}
                        <div className="flex flex-wrap gap-3 md:gap-4">
                            {/* Date */}
                            <div className="flex items-center gap-2 bg-base-200/80 backdrop-blur-sm px-4 py-2 rounded-full">
                                <Calendar className="w-5 h-5 text-primary" />
                                <span className="font-medium">{formatDate(startTime)}</span>
                            </div>

                            {/* Time */}
                            <div className="flex items-center gap-2 bg-base-200/80 backdrop-blur-sm px-4 py-2 rounded-full">
                                <Clock className="w-5 h-5 text-secondary" />
                                <span className="font-medium">
                                    {formatTime(startTime)}
                                    {endTime && ` - ${formatTime(endTime)}`}
                                </span>
                            </div>

                            {/* Venue */}
                            {venueName && (
                                <div className="flex items-center gap-2 bg-base-200/80 backdrop-blur-sm px-4 py-2 rounded-full">
                                    <MapPin className="w-5 h-5 text-accent" />
                                    <span className="font-medium">{venueName}</span>
                                </div>
                            )}
                        </div>

                        {/* Venue Address */}
                        {venueAddress && (
                            <p className="mt-4 text-base-content/60 text-sm md:text-base">
                                📍 {venueAddress}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-4 right-4 opacity-20">
                <Ticket className="w-32 h-32 md:w-48 md:h-48 text-primary rotate-12" />
            </div>
        </div>
    );
}
