'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';

interface ImageInfo {
    url: string;
    alt?: string;
}

interface EventGalleryProps {
    images: ImageInfo[];
    eventTitle: string;
}

export default function EventGallery({ images, eventTitle }: EventGalleryProps) {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    if (!images || images.length === 0) return null;

    const openLightbox = (index: number) => setSelectedIndex(index);
    const closeLightbox = () => setSelectedIndex(null);

    const goNext = () => {
        if (selectedIndex !== null) {
            setSelectedIndex((selectedIndex + 1) % images.length);
        }
    };

    const goPrev = () => {
        if (selectedIndex !== null) {
            setSelectedIndex((selectedIndex - 1 + images.length) % images.length);
        }
    };

    return (
        <section className="py-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                📸 Galería
            </h2>

            {/* Thumbnail Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {images.slice(0, 8).map((image, index) => (
                    <button
                        key={index}
                        onClick={() => openLightbox(index)}
                        className="relative aspect-video rounded-xl overflow-hidden group cursor-pointer"
                    >
                        <Image
                            src={image.url}
                            alt={image.alt || `${eventTitle} - Foto ${index + 1}`}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                            <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        {/* Show "+X more" on last visible item if there are more */}
                        {index === 7 && images.length > 8 && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <span className="text-2xl font-bold text-white">
                                    +{images.length - 8}
                                </span>
                            </div>
                        )}
                    </button>
                ))}
            </div>

            {/* Lightbox Modal */}
            {selectedIndex !== null && (
                <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
                    {/* Close Button */}
                    <button
                        onClick={closeLightbox}
                        className="absolute top-4 right-4 btn btn-circle btn-ghost text-white"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    {/* Navigation Buttons */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={goPrev}
                                className="absolute left-4 btn btn-circle btn-ghost text-white"
                            >
                                <ChevronLeft className="w-8 h-8" />
                            </button>
                            <button
                                onClick={goNext}
                                className="absolute right-4 btn btn-circle btn-ghost text-white"
                            >
                                <ChevronRight className="w-8 h-8" />
                            </button>
                        </>
                    )}

                    {/* Image */}
                    <div className="relative w-full max-w-5xl max-h-[80vh] mx-4">
                        <Image
                            src={images[selectedIndex].url}
                            alt={images[selectedIndex].alt || `${eventTitle} - Foto ${selectedIndex + 1}`}
                            width={1200}
                            height={800}
                            className="object-contain w-full h-auto max-h-[80vh] rounded-lg"
                        />
                    </div>

                    {/* Counter */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
                        {selectedIndex + 1} / {images.length}
                    </div>
                </div>
            )}
        </section>
    );
}
