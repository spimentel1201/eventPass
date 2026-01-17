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

            <div className="space-y-6">
                {/* YouTube Video */}
                {youtubeVideoId && (
                    <div className="card bg-base-200 overflow-hidden">
                        <div className="flex items-center gap-2 px-4 py-3 border-b border-base-300">
                            <Play className="w-5 h-5 text-error" />
                            <span className="font-semibold">Video Oficial</span>
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
                        <div className="flex items-center gap-2 px-4 py-3 border-b border-base-300">
                            <Music className="w-5 h-5 text-success" />
                            <span className="font-semibold">Playlist del Artista</span>
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
        </section>
    );
}
