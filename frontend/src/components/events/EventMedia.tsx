'use client';

import { Play, Music } from 'lucide-react';

interface EventMediaProps {
    youtubeVideoId?: string;
    spotifyPlaylistId?: string;
    title: string;
}

export default function EventMedia({ youtubeVideoId, spotifyPlaylistId, title }: EventMediaProps) {
    if (!youtubeVideoId && !spotifyPlaylistId) return null;

    return (
        <section className="py-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                🎬 Multimedia
            </h2>

            <div className={`grid gap-6 ${youtubeVideoId && spotifyPlaylistId ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
                {/* YouTube Video */}
                {youtubeVideoId && (
                    <div className="card bg-base-200 overflow-hidden">
                        <div className="card-body p-4">
                            <h3 className="card-title text-lg flex items-center gap-2">
                                <Play className="w-5 h-5 text-error" />
                                Video Oficial
                            </h3>
                        </div>
                        <div className="aspect-video w-full">
                            <iframe
                                src={`https://www.youtube.com/embed/${youtubeVideoId}?rel=0&modestbranding=1`}
                                title={`${title} - Video`}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="w-full h-full"
                            />
                        </div>
                    </div>
                )}

                {/* Spotify Playlist */}
                {spotifyPlaylistId && (
                    <div className="card bg-base-200 overflow-hidden">
                        <div className="card-body p-4">
                            <h3 className="card-title text-lg flex items-center gap-2">
                                <Music className="w-5 h-5 text-success" />
                                Playlist del Artista
                            </h3>
                        </div>
                        <div className="h-[352px]">
                            <iframe
                                src={`https://open.spotify.com/embed/playlist/${spotifyPlaylistId}?utm_source=generator&theme=0`}
                                title={`${title} - Spotify Playlist`}
                                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                loading="lazy"
                                className="w-full h-full border-0"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Alternative: Single Spotify Track embed example */}
            {/* 
            <iframe 
                src="https://open.spotify.com/embed/track/TRACK_ID?theme=0" 
                width="100%" 
                height="152" 
                frameBorder="0" 
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            />
            */}
        </section>
    );
}
