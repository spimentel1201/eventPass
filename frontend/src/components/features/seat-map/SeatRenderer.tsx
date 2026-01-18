'use client';

import { Circle } from 'react-konva';
import { KONVA_COLORS, SEAT_SIZE } from './constants';
import type { Seat, SeatStatus } from '@/types';

interface SeatRendererProps {
    seat: Seat;
    isSelected: boolean;
    onClick: () => void;
    onHover?: (isHover: boolean) => void;
}

// Get color based on seat status
function getSeatColor(status: SeatStatus, isSelected: boolean): string {
    if (isSelected) return KONVA_COLORS.SELECTED;

    switch (status) {
        case 'AVAILABLE':
            return KONVA_COLORS.AVAILABLE;
        case 'SOLD':
            return KONVA_COLORS.SOLD;
        case 'RESERVED':
            return KONVA_COLORS.RESERVED;
        case 'LOCKED':
            return KONVA_COLORS.BLOCKED;
        default:
            return KONVA_COLORS.AVAILABLE;
    }
}

export function SeatRenderer({
    seat,
    isSelected,
    onClick,
    onHover,
}: SeatRendererProps) {
    const status = seat.status || 'AVAILABLE';
    const isClickable = status === 'AVAILABLE' || isSelected;
    const color = getSeatColor(status, isSelected);

    return (
        <Circle
            x={seat.xPosition}
            y={seat.yPosition}
            radius={SEAT_SIZE.RADIUS}
            fill={color}
            stroke={isSelected ? KONVA_COLORS.TEXT_LIGHT : undefined}
            strokeWidth={isSelected ? SEAT_SIZE.SELECTED_STROKE_WIDTH : SEAT_SIZE.STROKE_WIDTH}
            shadowColor={isSelected ? color : undefined}
            shadowBlur={isSelected ? SEAT_SIZE.SHADOW_BLUR : 0}
            opacity={isClickable ? 1 : 0.7}
            onClick={isClickable ? onClick : undefined}
            onTap={isClickable ? onClick : undefined}
            onMouseEnter={(e) => {
                if (isClickable) {
                    const container = e.target.getStage()?.container();
                    if (container) container.style.cursor = 'pointer';
                    onHover?.(true);
                }
            }}
            onMouseLeave={(e) => {
                const container = e.target.getStage()?.container();
                if (container) container.style.cursor = 'default';
                onHover?.(false);
            }}
        />
    );
}
