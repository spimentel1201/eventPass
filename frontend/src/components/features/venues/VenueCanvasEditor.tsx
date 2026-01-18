'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Stage, Layer, Rect, Text, Group, Line } from 'react-konva';
import type Konva from 'konva';
import type { Section } from '@/types';
import { ZoomIn, ZoomOut, RotateCcw, Move, Pointer, Plus } from 'lucide-react';

interface VenueCanvasEditorProps {
    sections: Section[];
    onSectionSelect: (section: Section | null) => void;
    onSectionMove: (sectionId: string, x: number, y: number) => void;
    onAddSection: () => void;
    selectedSectionId: string | null;
}

const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 800;
const GRID_SIZE = 20;

// Generate grid lines
function GridLines({ width, height }: { width: number; height: number }) {
    const lines = [];

    // Vertical lines
    for (let x = 0; x <= width; x += GRID_SIZE) {
        lines.push(
            <Line
                key={`v-${x}`}
                points={[x, 0, x, height]}
                stroke="#ffffff10"
                strokeWidth={1}
            />
        );
    }

    // Horizontal lines
    for (let y = 0; y <= height; y += GRID_SIZE) {
        lines.push(
            <Line
                key={`h-${y}`}
                points={[0, y, width, y]}
                stroke="#ffffff10"
                strokeWidth={1}
            />
        );
    }

    return <>{lines}</>;
}

// Section shape on canvas
function SectionShape({
    section,
    isSelected,
    onSelect,
    onDragEnd,
}: {
    section: Section;
    isSelected: boolean;
    onSelect: () => void;
    onDragEnd: (x: number, y: number) => void;
}) {
    const config = section.layoutConfig || {};
    const x = config.x || 100;
    const y = config.y || 100;
    const rows = config.rows || 5;
    const seatsPerRow = config.seatsPerRow || 10;
    const color = config.color || '#3b82f6';

    // Calculate dimensions based on seats
    const seatSize = 12;
    const seatGap = 4;
    const padding = 20;
    const width = seatsPerRow * (seatSize + seatGap) + padding * 2;
    const height = rows * (seatSize + seatGap) + padding * 2 + 30; // +30 for label

    return (
        <Group
            x={x}
            y={y}
            draggable
            onClick={onSelect}
            onTap={onSelect}
            onDragEnd={(e) => {
                // Snap to grid
                const newX = Math.round(e.target.x() / GRID_SIZE) * GRID_SIZE;
                const newY = Math.round(e.target.y() / GRID_SIZE) * GRID_SIZE;
                e.target.x(newX);
                e.target.y(newY);
                onDragEnd(newX, newY);
            }}
            onMouseEnter={(e) => {
                const container = e.target.getStage()?.container();
                if (container) container.style.cursor = 'move';
            }}
            onMouseLeave={(e) => {
                const container = e.target.getStage()?.container();
                if (container) container.style.cursor = 'default';
            }}
        >
            {/* Background */}
            <Rect
                width={width}
                height={height}
                fill={`${color}40`}
                stroke={isSelected ? '#ffffff' : color}
                strokeWidth={isSelected ? 3 : 2}
                cornerRadius={8}
                shadowColor={isSelected ? '#ffffff' : 'transparent'}
                shadowBlur={isSelected ? 10 : 0}
            />

            {/* Section name */}
            <Text
                text={section.name}
                x={padding}
                y={10}
                fontSize={14}
                fontStyle="bold"
                fill="#ffffff"
            />

            {/* Mini seat grid */}
            {Array.from({ length: rows }).map((_, rowIdx) =>
                Array.from({ length: seatsPerRow }).map((_, seatIdx) => (
                    <Rect
                        key={`${rowIdx}-${seatIdx}`}
                        x={padding + seatIdx * (seatSize + seatGap)}
                        y={35 + rowIdx * (seatSize + seatGap)}
                        width={seatSize}
                        height={seatSize}
                        fill={color}
                        cornerRadius={2}
                        opacity={0.7}
                    />
                ))
            )}

            {/* Capacity label */}
            <Text
                text={`${rows * seatsPerRow} seats`}
                x={padding}
                y={height - 20}
                fontSize={11}
                fill="#ffffff80"
            />
        </Group>
    );
}

// Stage element
function StageElement() {
    return (
        <Group x={CANVAS_WIDTH / 2 - 200} y={40}>
            <Rect
                width={400}
                height={60}
                fill="#a855f7"
                cornerRadius={10}
                opacity={0.5}
            />
            <Text
                text="ESCENARIO"
                x={150}
                y={20}
                fontSize={20}
                fontStyle="bold"
                fill="#ffffff"
            />
        </Group>
    );
}

export default function VenueCanvasEditor({
    sections,
    onSectionSelect,
    onSectionMove,
    onAddSection,
    selectedSectionId,
}: VenueCanvasEditorProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const stageRef = useRef<Konva.Stage>(null);

    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
    const [scale, setScale] = useState(0.8);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [tool, setTool] = useState<'select' | 'pan'>('select');

    // Resize handler
    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const { width } = containerRef.current.getBoundingClientRect();
                const aspectRatio = CANVAS_HEIGHT / CANVAS_WIDTH;
                setDimensions({
                    width: width,
                    height: Math.min(width * aspectRatio, 600),
                });
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    const handleZoomIn = () => setScale((s) => Math.min(s * 1.2, 2));
    const handleZoomOut = () => setScale((s) => Math.max(s / 1.2, 0.3));
    const handleReset = () => {
        setScale(0.8);
        setPosition({ x: 0, y: 0 });
    };

    const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
        e.evt.preventDefault();
        const scaleBy = 1.05;
        const oldScale = scale;
        const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
        setScale(Math.max(0.3, Math.min(2, newScale)));
    }, [scale]);

    const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
        // Click on empty space deselects
        if (e.target === e.target.getStage()) {
            onSectionSelect(null);
        }
    };

    return (
        <div className="space-y-3">
            {/* Toolbar */}
            <div className="flex items-center justify-between bg-base-300 rounded-lg p-2">
                <div className="flex gap-1">
                    <button
                        className={`btn btn-sm ${tool === 'select' ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setTool('select')}
                        title="Seleccionar y mover"
                    >
                        <Pointer className="w-4 h-4" />
                    </button>
                    <button
                        className={`btn btn-sm ${tool === 'pan' ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setTool('pan')}
                        title="Mover canvas"
                    >
                        <Move className="w-4 h-4" />
                    </button>
                    <div className="divider divider-horizontal mx-1" />
                    <button
                        className="btn btn-sm btn-ghost"
                        onClick={handleZoomIn}
                        title="Acercar"
                    >
                        <ZoomIn className="w-4 h-4" />
                    </button>
                    <button
                        className="btn btn-sm btn-ghost"
                        onClick={handleZoomOut}
                        title="Alejar"
                    >
                        <ZoomOut className="w-4 h-4" />
                    </button>
                    <button
                        className="btn btn-sm btn-ghost"
                        onClick={handleReset}
                        title="Reset vista"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-sm text-base-content/60">
                        {Math.round(scale * 100)}%
                    </span>
                    <button className="btn btn-sm btn-primary" onClick={onAddSection}>
                        <Plus className="w-4 h-4" />
                        Sección
                    </button>
                </div>
            </div>

            {/* Canvas */}
            <div
                ref={containerRef}
                className="bg-base-300 rounded-xl overflow-hidden border border-base-content/10"
            >
                <Stage
                    ref={stageRef}
                    width={dimensions.width}
                    height={dimensions.height}
                    scaleX={scale}
                    scaleY={scale}
                    x={position.x}
                    y={position.y}
                    draggable={tool === 'pan'}
                    onDragEnd={(e) => {
                        if (tool === 'pan') {
                            setPosition({
                                x: e.target.x(),
                                y: e.target.y(),
                            });
                        }
                    }}
                    onWheel={handleWheel}
                    onClick={handleStageClick}
                >
                    <Layer>
                        {/* Background */}
                        <Rect
                            x={0}
                            y={0}
                            width={CANVAS_WIDTH}
                            height={CANVAS_HEIGHT}
                            fill="#1a1a2e"
                        />

                        {/* Grid */}
                        <GridLines width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />

                        {/* Stage/Escenario */}
                        <StageElement />

                        {/* Sections */}
                        {sections.map((section) => (
                            <SectionShape
                                key={section.id}
                                section={section}
                                isSelected={selectedSectionId === section.id}
                                onSelect={() => onSectionSelect(section)}
                                onDragEnd={(x, y) => onSectionMove(section.id, x, y)}
                            />
                        ))}
                    </Layer>
                </Stage>
            </div>

            {/* Instructions */}
            <div className="text-xs text-base-content/50 flex gap-4">
                <span>🖱️ Click para seleccionar</span>
                <span>✋ Arrastra para mover secciones</span>
                <span>🔍 Scroll para zoom</span>
            </div>
        </div>
    );
}
