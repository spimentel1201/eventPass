'use client';

import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface ZoomControlsProps {
    onZoomIn: () => void;
    onZoomOut: () => void;
    onReset: () => void;
    scale: number;
}

export function ZoomControls({ onZoomIn, onZoomOut, onReset, scale }: ZoomControlsProps) {
    const zoomPercentage = Math.round(scale * 100);

    return (
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
            <div className="join join-vertical bg-base-200 shadow-lg">
                <button
                    className="btn btn-sm join-item"
                    onClick={onZoomIn}
                    title="Acercar"
                >
                    <ZoomIn className="w-4 h-4" />
                </button>

                <button
                    className="btn btn-sm join-item pointer-events-none"
                    title="Zoom actual"
                >
                    <span className="text-xs">{zoomPercentage}%</span>
                </button>

                <button
                    className="btn btn-sm join-item"
                    onClick={onZoomOut}
                    title="Alejar"
                >
                    <ZoomOut className="w-4 h-4" />
                </button>

                <button
                    className="btn btn-sm join-item"
                    onClick={onReset}
                    title="Restablecer vista"
                >
                    <Maximize2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
