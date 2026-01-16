'use client';

import { useState, useRef, useEffect } from 'react';
import { Stage, Layer } from 'react-konva';
import { SectionRenderer } from './SectionRenderer';
import { ZoomControls } from './ZoomControls';
import { KONVA_COLORS } from './constants';
import type { SeatingMap, Section, Seat } from '@/types';
import type Konva from 'konva';

interface VenueMapProps {
    seatingMap: SeatingMap;
    selectedSeats: string[];
    onSeatClick: (seat: Seat, section: Section) => void;
    onSectionClick?: (section: Section) => void;
    hoveredSeat?: Seat | null;
    onSeatHover?: (seat: Seat | null) => void;
}

export function VenueMap({
    seatingMap,
    selectedSeats,
    onSeatClick,
    onSectionClick,
    hoveredSeat,
    onSeatHover,
}: VenueMapProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const stageRef = useRef<Konva.Stage>(null);

    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [activeSection, setActiveSection] = useState<string | null>(null);

    // Get canvas dimensions from layout or use defaults
    const canvasWidth = seatingMap.venueLayout?.canvas?.width || 1200;
    const canvasHeight = seatingMap.venueLayout?.canvas?.height || 800;

    // Resize handler
    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const { width } = containerRef.current.getBoundingClientRect();
                const aspectRatio = canvasHeight / canvasWidth;
                setDimensions({
                    width: width,
                    height: Math.min(width * aspectRatio, 600),
                });
                // Auto-fit scale
                setScale(Math.min(width / canvasWidth, 600 / canvasHeight));
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, [canvasWidth, canvasHeight]);

    const handleZoomIn = () => setScale((s) => Math.min(s * 1.2, 3));
    const handleZoomOut = () => setScale((s) => Math.max(s / 1.2, 0.3));
    const handleReset = () => {
        setScale(Math.min(dimensions.width / canvasWidth, 600 / canvasHeight));
        setPosition({ x: 0, y: 0 });
        setActiveSection(null);
    };

    const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
        e.evt.preventDefault();
        const scaleBy = 1.1;
        const stage = stageRef.current;
        if (!stage) return;

        const oldScale = scale;
        const pointer = stage.getPointerPosition();
        if (!pointer) return;

        const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
        const clampedScale = Math.max(0.3, Math.min(3, newScale));

        setScale(clampedScale);
    };

    const handleSectionClick = (section: Section) => {
        setActiveSection(section.id);
        onSectionClick?.(section);
    };

    return (
        <div ref={containerRef} className="relative bg-base-300 rounded-2xl overflow-hidden">
            {/* Zoom Controls */}
            <ZoomControls
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onReset={handleReset}
                scale={scale}
            />

            {/* Canvas */}
            <Stage
                ref={stageRef}
                width={dimensions.width}
                height={dimensions.height}
                scaleX={scale}
                scaleY={scale}
                x={position.x}
                y={position.y}
                draggable
                onDragEnd={(e) => {
                    setPosition({
                        x: e.target.x(),
                        y: e.target.y(),
                    });
                }}
                onWheel={handleWheel}
            >
                <Layer>
                    {/* Background */}
                    {/* Render sections */}
                    {seatingMap.sections.map((section) => (
                        <SectionRenderer
                            key={section.id}
                            section={section}
                            isActive={activeSection === section.id}
                            selectedSeats={selectedSeats}
                            onSectionClick={() => handleSectionClick(section)}
                            onSeatClick={(seat) => onSeatClick(seat, section)}
                            onSeatHover={onSeatHover}
                        />
                    ))}
                </Layer>
            </Stage>

            {/* Hovered seat tooltip */}
            {hoveredSeat && (
                <div className="absolute bottom-4 left-4 bg-base-200 p-3 rounded-lg shadow-lg">
                    <p className="text-sm font-semibold">
                        Fila {hoveredSeat.rowLabel} - Asiento {hoveredSeat.numberLabel}
                    </p>
                    <p className="text-xs text-base-content/60">
                        Click para {selectedSeats.includes(hoveredSeat.id) ? 'deseleccionar' : 'seleccionar'}
                    </p>
                </div>
            )}
        </div>
    );
}
