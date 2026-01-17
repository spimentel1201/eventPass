'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Share2, Heart } from 'lucide-react';
import { useEvent } from '@/hooks/useEvents';
import EventHero from '@/components/events/EventHero';
import EventGallery from '@/components/events/EventGallery';
import EventMedia from '@/components/events/EventMedia';
import EventPricing from '@/components/events/EventPricing';
import EventInfo from '@/components/events/EventInfo';

export default function EventDetailPage() {
    const params = useParams();
    const eventId = params.eventId as string;
    const { data: event, isLoading, error } = useEvent(eventId);

    if (isLoading) {
        return (
            <div className="min-h-screen">
                {/* Hero Skeleton */}
                <div className="skeleton h-[400px] md:h-[500px] w-full" />

                {/* Content Skeleton */}
                <div className="container mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-4">
                            <div className="skeleton h-8 w-3/4" />
                            <div className="skeleton h-4 w-full" />
                            <div className="skeleton h-4 w-2/3" />
                            <div className="skeleton h-32 w-full rounded-xl mt-6" />
                        </div>
                        <div className="skeleton h-64 rounded-xl" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <div className="text-8xl mb-6">🎫</div>
                <h2 className="text-3xl font-bold mb-3">Evento no encontrado</h2>
                <p className="text-base-content/60 mb-8 max-w-md mx-auto">
                    El evento que buscas no existe, ha sido eliminado o aún no está disponible.
                </p>
                <Link href="/events" className="btn btn-primary btn-lg">
                    <ArrowLeft className="w-5 h-5" />
                    Ver todos los eventos
                </Link>
            </div>
        );
    }

    // Extract media from event (metadata or direct properties)
    const media = event.media || {};
    const galleryImages = media.images?.gallery || [];
    const youtubeVideoId = media.videos?.trailer?.videoId;
    const spotifyPlaylistId = media.audio?.playlist?.playlistId;

    // Extract additional info from metadata
    const metadata = event.metadata || {};
    const ageRestriction = metadata.ageRestriction;
    const policies = metadata.policies || [];
    const includes = metadata.includes || [];
    const additionalInfo = metadata.additionalInfo;

    // Mock price range (in real app, this would come from ticket tiers)
    const priceRange = {
        min: 50,
        max: 250,
        currency: 'PEN',
    };

    return (
        <div className="min-h-screen">
            {/* Navigation Bar (floating) */}
            <div className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-b from-base-100/90 to-transparent pointer-events-none">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between pointer-events-auto">
                    <Link href="/events" className="btn btn-ghost btn-sm gap-2 bg-base-200/80 backdrop-blur-sm">
                        <ArrowLeft className="w-4 h-4" />
                        Eventos
                    </Link>

                    <div className="flex gap-2">
                        <button className="btn btn-ghost btn-sm btn-circle bg-base-200/80 backdrop-blur-sm">
                            <Heart className="w-4 h-4" />
                        </button>
                        <button className="btn btn-ghost btn-sm btn-circle bg-base-200/80 backdrop-blur-sm">
                            <Share2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Hero Section */}
            <EventHero
                title={event.title}
                bannerUrl={event.images?.banner?.url}
                startTime={event.startTime}
                endTime={event.endTime}
                venueName={event.venue?.name}
                venueAddress={event.venue?.address}
                status={event.status}
            />

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Event Info */}
                        <EventInfo
                            description={event.description}
                            ageRestriction={ageRestriction}
                            policies={policies}
                            includes={includes}
                            additionalInfo={additionalInfo}
                        />

                        {/* Gallery */}
                        {galleryImages.length > 0 && (
                            <EventGallery
                                images={galleryImages}
                                eventTitle={event.title}
                            />
                        )}

                        {/* Multimedia */}
                        <EventMedia
                            youtubeVideoId={youtubeVideoId}
                            spotifyPlaylistId={spotifyPlaylistId}
                            title={event.title}
                        />

                        {/* Venue Map Placeholder */}
                        {event.venue && (
                            <section className="py-8">
                                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                    📍 Ubicación
                                </h2>
                                <div className="card bg-base-200">
                                    <div className="card-body">
                                        <h3 className="card-title">{event.venue.name}</h3>
                                        {event.venue.address && (
                                            <p className="text-base-content/70">{event.venue.address}</p>
                                        )}
                                        {/* Map placeholder */}
                                        <div className="aspect-video bg-base-300 rounded-xl mt-4 flex items-center justify-center">
                                            <span className="text-base-content/40">Mapa próximamente</span>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Right Column - Pricing Card */}
                    <div className="lg:col-span-1">
                        <EventPricing
                            eventId={event.id}
                            status={event.status}
                            priceRange={priceRange}
                            sectionsCount={event.venue?.sectionsCount || 0}
                        />
                    </div>
                </div>
            </div>

            {/* Mobile Fixed CTA */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-base-100 border-t border-base-300 z-40">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className="text-sm text-base-content/60">Desde</p>
                        <p className="text-xl font-bold text-primary">S/ {priceRange.min}</p>
                    </div>
                    <Link
                        href={`/events/${event.id}/seat-map`}
                        className="btn btn-primary flex-1"
                    >
                        Comprar Entradas
                    </Link>
                </div>
            </div>

            {/* Bottom Padding for Mobile CTA */}
            <div className="lg:hidden h-24" />
        </div>
    );
}
