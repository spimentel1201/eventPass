/**
 * KONVA_COLORS - Color constants for React-Konva components
 * 
 * IMPORTANT: React Konva renders on HTML5 Canvas, NOT in the DOM.
 * CSS classes DO NOT work. Use these hex values directly.
 */
export const KONVA_COLORS = {
    // Seat states
    AVAILABLE: '#22c55e',      // success - Green
    SOLD: '#ef4444',           // error - Red
    SELECTED: '#3b82f6',       // info - Blue
    RESERVED: '#f59e0b',       // warning - Amber
    BLOCKED: '#94a3b8',        // Gray
    MY_RESERVATION: '#06b6d4', // accent - Cyan

    // Sections
    SECTION_FILL: '#1e293b',   // base-200
    SECTION_STROKE: '#6366f1', // primary - Indigo
    SECTION_HOVER: '#4f46e5',  // primary darker
    SECTION_ACTIVE: '#818cf8', // primary lighter

    // Stage
    BACKGROUND: '#0f172a',     // base-100

    // Text
    TEXT_LIGHT: '#ffffff',
    TEXT_DARK: '#0f172a',

    // VIP/Special
    VIP_FILL: '#7c3aed',       // Violet
    VIP_STROKE: '#8b5cf6',
} as const;

// Seat size constants
export const SEAT_SIZE = {
    RADIUS: 12,
    SPACING: 28,
    STROKE_WIDTH: 1,
    SELECTED_STROKE_WIDTH: 2,
    SHADOW_BLUR: 10,
} as const;

// Section size constants
export const SECTION_SIZE = {
    STROKE_WIDTH: 2,
    CORNER_RADIUS: 4,
} as const;
