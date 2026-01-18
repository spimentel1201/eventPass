'use client';

import { Group, Rect, Text, Circle } from 'react-konva';
import { SeatRenderer } from './SeatRenderer';
import { KONVA_COLORS, SECTION_SIZE } from './constants';
import type { Section, Seat } from '@/types';

interface SectionRendererProps {
    section: Section;
    isActive: boolean;
    selectedSeats: string[];
    onSectionClick: () => void;
    onSeatClick: (seat: Seat) => void;
    onSeatHover?: (seat: Seat | null) => void;
}

export function SectionRenderer({
    section,
    isActive,
    selectedSeats,
    onSectionClick,
    onSeatClick,
    onSeatHover,
}: SectionRendererProps) {
    const layoutConfig = section.layoutConfig;

    // Default position
    const x = layoutConfig?.x ?? layoutConfig?.position?.x ?? 0;
    const y = layoutConfig?.y ?? layoutConfig?.position?.y ?? 0;
    const width = layoutConfig?.width ?? 200;
    const height = layoutConfig?.height ?? 150;

    // Colors
    const fillColor = isActive ? KONVA_COLORS.SECTION_ACTIVE : KONVA_COLORS.SECTION_FILL;
    const strokeColor = KONVA_COLORS.SECTION_STROKE;

    // Determine if section has seats to render
    const seats = section.seats || [];
    const isSeated = section.type === 'SEATED' || section.type === 'VIP' || section.type === 'BOX';

    return (
        <Group x={x} y={y}>
            {/* Section background */}
            <Rect
                width={width}
                height={height}
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth={SECTION_SIZE.STROKE_WIDTH}
                cornerRadius={SECTION_SIZE.CORNER_RADIUS}
                onClick={onSectionClick}
                onTap={onSectionClick}
                shadowColor={isActive ? KONVA_COLORS.SECTION_STROKE : undefined}
                shadowBlur={isActive ? 15 : 0}
                opacity={isActive ? 1 : 0.8}
            />

            {/* Section name label */}
            <Text
                text={section.name}
                x={10}
                y={10}
                fontSize={14}
                fontStyle="bold"
                fill={KONVA_COLORS.TEXT_LIGHT}
            />

            {/* Availability info */}
            <Text
                text={`${section.availableCount ?? 0} disponibles`}
                x={10}
                y={28}
                fontSize={11}
                fill={KONVA_COLORS.AVAILABLE}
            />

            {/* Render seats only when section is active (lazy loading) */}
            {isActive && isSeated && seats.length > 0 && (
                <Group x={10} y={50}>
                    {seats.map((seat) => (
                        <SeatRenderer
                            key={seat.id}
                            seat={seat}
                            isSelected={selectedSeats.includes(seat.id)}
                            onClick={() => onSeatClick(seat)}
                            onHover={(isHover: boolean) => onSeatHover?.(isHover ? seat : null)}
                        />
                    ))}
                </Group>
            )}

            {/* General admission indicator */}
            {section.type === 'GENERAL_ADMISSION' && (
                <Group x={width / 2} y={height / 2}>
                    <Circle
                        radius={30}
                        fill={KONVA_COLORS.AVAILABLE}
                        opacity={0.3}
                    />
                    <Text
                        text={`${section.availableCount}`}
                        x={-20}
                        y={-8}
                        fontSize={16}
                        fontStyle="bold"
                        fill={KONVA_COLORS.TEXT_LIGHT}
                        width={40}
                        align="center"
                    />
                </Group>
            )}
        </Group>
    );
}
