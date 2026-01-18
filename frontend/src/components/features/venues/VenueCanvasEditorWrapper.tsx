'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import type { Section } from '@/types';

// Dynamic import to avoid SSR issues with React-Konva
const VenueCanvasEditor = dynamic(
    () => import('./VenueCanvasEditor'),
    {
        ssr: false,
        loading: () => (
            <div className="flex items-center justify-center h-96 bg-base-300 rounded-xl">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        ),
    }
);

interface VenueCanvasEditorWrapperProps {
    sections: Section[];
    onSectionSelect: (section: Section | null) => void;
    onSectionMove: (sectionId: string, x: number, y: number) => void;
    onAddSection: () => void;
    selectedSectionId: string | null;
}

export default function VenueCanvasEditorWrapper(props: VenueCanvasEditorWrapperProps) {
    return <VenueCanvasEditor {...props} />;
}
