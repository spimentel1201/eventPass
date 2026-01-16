'use client';

import { useState, Suspense } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Loader2,
    Plus,
    Trash2,
    Edit3,
    Settings,
    Save,
} from 'lucide-react';
import { useVenue, useVenueSections, useCreateSection, useUpdateSection, useDeleteSection, useSaveVenueLayout } from '@/hooks/useVenues';
import { VenueCanvasEditorWrapper } from '@/components/features/venues';
import type { Section } from '@/types';

interface SectionFormData {
    name: string;
    type: 'SEATED' | 'STANDING' | 'VIP' | 'DISABLED';
    rows: number;
    seatsPerRow: number;
    basePrice: number;
    color: string;
    x: number;
    y: number;
}

const SECTION_COLORS = [
    { name: 'Azul', value: '#3b82f6' },
    { name: 'Verde', value: '#22c55e' },
    { name: 'Morado', value: '#a855f7' },
    { name: 'Naranja', value: '#f97316' },
    { name: 'Rosa', value: '#ec4899' },
    { name: 'Cyan', value: '#06b6d4' },
];

const SECTION_TYPES = [
    { value: 'SEATED', label: 'Asientos numerados' },
    { value: 'STANDING', label: 'General (sin asientos)' },
    { value: 'VIP', label: 'VIP' },
    { value: 'DISABLED', label: 'Accesibilidad' },
];

const defaultFormData: SectionFormData = {
    name: '',
    type: 'SEATED',
    rows: 10,
    seatsPerRow: 20,
    basePrice: 50,
    color: SECTION_COLORS[0].value,
    x: 100,
    y: 150,
};

function VenueLayoutEditorContent({ venueId }: { venueId: string }) {
    const { data: venue, isLoading: venueLoading } = useVenue(venueId);
    const { data: sections, isLoading: sectionsLoading, refetch } = useVenueSections(venueId);
    const createSection = useCreateSection();
    const updateSection = useUpdateSection();
    const deleteSection = useDeleteSection();
    const saveLayout = useSaveVenueLayout();

    const [showModal, setShowModal] = useState(false);
    const [editingSection, setEditingSection] = useState<Section | null>(null);
    const [selectedSection, setSelectedSection] = useState<Section | null>(null);
    const [formData, setFormData] = useState<SectionFormData>(defaultFormData);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    const openAddModal = () => {
        setEditingSection(null);
        // Position new section based on existing sections
        const nextX = 100 + ((sections?.length || 0) % 3) * 250;
        const nextY = 150 + Math.floor((sections?.length || 0) / 3) * 200;
        setFormData({ ...defaultFormData, x: nextX, y: nextY });
        setShowModal(true);
    };

    const openEditModal = (section: Section) => {
        setEditingSection(section);
        const config = section.layoutConfig || {};
        setFormData({
            name: section.name,
            type: (section.type as SectionFormData['type']) || 'SEATED',
            rows: config.rows || 10,
            seatsPerRow: config.seatsPerRow || 20,
            basePrice: config.basePrice || 50,
            color: config.color || SECTION_COLORS[0].value,
            x: config.x || 100,
            y: config.y || 150,
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        try {
            const payload = {
                venueId,
                name: formData.name,
                type: formData.type,
                capacity: formData.type === 'STANDING' ? 0 : formData.rows * formData.seatsPerRow,
                layoutConfig: {
                    rows: formData.rows,
                    seatsPerRow: formData.seatsPerRow,
                    basePrice: formData.basePrice,
                    color: formData.color,
                    x: formData.x,
                    y: formData.y,
                },
            };

            if (editingSection) {
                await updateSection.mutateAsync({
                    sectionId: editingSection.id,
                    ...payload,
                });
            } else {
                await createSection.mutateAsync(payload);
            }

            setShowModal(false);
            setEditingSection(null);
            setFormData(defaultFormData);
            refetch();
        } catch (error) {
            console.error('Error saving section:', error);
        }
    };

    const handleDelete = async (sectionId: string) => {
        try {
            await deleteSection.mutateAsync({ sectionId, venueId });
            setShowDeleteConfirm(null);
            setSelectedSection(null);
            refetch();
        } catch (error) {
            console.error('Error deleting section:', error);
        }
    };

    const handleSectionMove = async (sectionId: string, x: number, y: number) => {
        const section = sections?.find(s => s.id === sectionId);
        if (!section) return;

        const config = section.layoutConfig || {};
        try {
            await updateSection.mutateAsync({
                sectionId,
                venueId,
                layoutConfig: { ...config, x, y },
            });
            setHasUnsavedChanges(true);
            refetch();
        } catch (error) {
            console.error('Error moving section:', error);
        }
    };

    const handleSaveLayout = async () => {
        // Save current layout positions
        setHasUnsavedChanges(false);
    };

    const isLoading = venueLoading || sectionsLoading;
    const isSaving = createSection.isPending || updateSection.isPending;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!venue) {
        return (
            <div className="alert alert-error">
                No se encontró el recinto
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/venues" className="btn btn-ghost btn-sm btn-circle">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">Editor de Layout</h1>
                        <p className="text-base-content/60">{venue.name}</p>
                    </div>
                </div>
                {hasUnsavedChanges && (
                    <button className="btn btn-success" onClick={handleSaveLayout}>
                        <Save className="w-4 h-4" />
                        Guardar Layout
                    </button>
                )}
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
                {/* Canvas Editor */}
                <div className="xl:col-span-3">
                    <div className="card bg-base-200">
                        <div className="card-body p-4">
                            <VenueCanvasEditorWrapper
                                sections={sections || []}
                                selectedSectionId={selectedSection?.id || null}
                                onSectionSelect={setSelectedSection}
                                onSectionMove={handleSectionMove}
                                onAddSection={openAddModal}
                            />
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    {/* Selected Section Info */}
                    {selectedSection && (
                        <div className="card bg-primary/10 border border-primary">
                            <div className="card-body p-4">
                                <h3 className="font-bold text-primary">{selectedSection.name}</h3>
                                <div className="text-sm space-y-1">
                                    <p>Tipo: {selectedSection.type}</p>
                                    <p>Capacidad: {selectedSection.capacity} asientos</p>
                                    <p>Precio: S/ {selectedSection.layoutConfig?.basePrice || 0}</p>
                                </div>
                                <div className="flex gap-2 mt-2">
                                    <button
                                        className="btn btn-sm btn-outline flex-1"
                                        onClick={() => openEditModal(selectedSection)}
                                    >
                                        <Edit3 className="w-3 h-3" />
                                        Editar
                                    </button>
                                    <button
                                        className="btn btn-sm btn-error btn-outline"
                                        onClick={() => setShowDeleteConfirm(selectedSection.id)}
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Sections List */}
                    <div className="card bg-base-200">
                        <div className="card-body p-4">
                            <h2 className="card-title text-base flex items-center gap-2">
                                <Settings className="w-4 h-4" />
                                Secciones ({sections?.length || 0})
                            </h2>

                            <div className="space-y-1 max-h-64 overflow-y-auto">
                                {sections && sections.length > 0 ? (
                                    sections.map((section) => (
                                        <SectionListItem
                                            key={section.id}
                                            section={section}
                                            isSelected={selectedSection?.id === section.id}
                                            onSelect={() => setSelectedSection(section)}
                                            onEdit={() => openEditModal(section)}
                                        />
                                    ))
                                ) : (
                                    <p className="text-center text-base-content/60 py-4 text-sm">
                                        Sin secciones
                                    </p>
                                )}
                            </div>

                            <button className="btn btn-primary btn-sm mt-2" onClick={openAddModal}>
                                <Plus className="w-4 h-4" />
                                Nueva Sección
                            </button>
                        </div>
                    </div>

                    {/* Venue Info */}
                    <div className="card bg-base-200">
                        <div className="card-body p-4">
                            <h2 className="card-title text-base">Info del Recinto</h2>
                            <div className="space-y-1 text-sm">
                                <p><strong>Nombre:</strong> {venue.name}</p>
                                <p><strong>Dirección:</strong> {venue.address || 'No especificada'}</p>
                                <p><strong>Capacidad:</strong> {
                                    sections?.reduce((acc, s) => acc + (s.capacity || 0), 0) || 0
                                } asientos</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg mb-4">
                            {editingSection ? 'Editar Sección' : 'Nueva Sección'}
                        </h3>

                        <div className="space-y-4">
                            {/* Name */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Nombre de la sección</span>
                                </label>
                                <input
                                    type="text"
                                    className="input input-bordered"
                                    placeholder="Ej: Platea Alta, VIP, General..."
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            {/* Type */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Tipo de sección</span>
                                </label>
                                <select
                                    className="select select-bordered"
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value as SectionFormData['type'] })}
                                >
                                    {SECTION_TYPES.map((type) => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Rows & Seats */}
                            {formData.type !== 'STANDING' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text">Filas</span>
                                        </label>
                                        <input
                                            type="number"
                                            className="input input-bordered"
                                            min={1}
                                            max={50}
                                            value={formData.rows}
                                            onChange={(e) => setFormData({ ...formData, rows: parseInt(e.target.value) || 1 })}
                                        />
                                    </div>
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text">Asientos/fila</span>
                                        </label>
                                        <input
                                            type="number"
                                            className="input input-bordered"
                                            min={1}
                                            max={100}
                                            value={formData.seatsPerRow}
                                            onChange={(e) => setFormData({ ...formData, seatsPerRow: parseInt(e.target.value) || 1 })}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Price */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Precio base (S/)</span>
                                </label>
                                <input
                                    type="number"
                                    className="input input-bordered"
                                    min={0}
                                    step={0.01}
                                    value={formData.basePrice}
                                    onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })}
                                />
                            </div>

                            {/* Color */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Color</span>
                                </label>
                                <div className="flex gap-2 flex-wrap">
                                    {SECTION_COLORS.map((color) => (
                                        <button
                                            key={color.value}
                                            type="button"
                                            className={`w-8 h-8 rounded-full border-2 transition-all ${formData.color === color.value ? 'border-white ring-2 ring-primary scale-110' : 'border-transparent hover:scale-105'}`}
                                            style={{ backgroundColor: color.value }}
                                            onClick={() => setFormData({ ...formData, color: color.value })}
                                            title={color.name}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Capacity Preview */}
                            <div className="alert">
                                <div>
                                    <span className="font-bold">Capacidad:</span>{' '}
                                    {formData.type === 'STANDING'
                                        ? 'Sin límite (general)'
                                        : `${formData.rows * formData.seatsPerRow} asientos`}
                                </div>
                            </div>
                        </div>

                        <div className="modal-action">
                            <button
                                className="btn btn-ghost"
                                onClick={() => {
                                    setShowModal(false);
                                    setEditingSection(null);
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleSave}
                                disabled={!formData.name || isSaving}
                            >
                                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                                {editingSection ? 'Guardar' : 'Crear'}
                            </button>
                        </div>
                    </div>
                    <div className="modal-backdrop" onClick={() => {
                        setShowModal(false);
                        setEditingSection(null);
                    }} />
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg">¿Eliminar sección?</h3>
                        <p className="py-4">
                            Esta acción eliminará la sección y todos sus asientos.
                        </p>
                        <div className="modal-action">
                            <button className="btn btn-ghost" onClick={() => setShowDeleteConfirm(null)}>
                                Cancelar
                            </button>
                            <button
                                className="btn btn-error"
                                onClick={() => handleDelete(showDeleteConfirm)}
                                disabled={deleteSection.isPending}
                            >
                                {deleteSection.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                                Eliminar
                            </button>
                        </div>
                    </div>
                    <div className="modal-backdrop" onClick={() => setShowDeleteConfirm(null)} />
                </div>
            )}
        </div>
    );
}

// Section List Item
function SectionListItem({
    section,
    isSelected,
    onSelect,
    onEdit,
}: {
    section: Section;
    isSelected: boolean;
    onSelect: () => void;
    onEdit: () => void;
}) {
    const config = section.layoutConfig || {};
    const color = config.color || '#3b82f6';

    return (
        <div
            className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-primary/20 border border-primary' : 'hover:bg-base-300'}`}
            onClick={onSelect}
        >
            <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: color }}
            />
            <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{section.name}</p>
                <p className="text-xs text-base-content/60">
                    {section.capacity || 0} • S/{config.basePrice || 0}
                </p>
            </div>
            <button
                className="btn btn-ghost btn-xs btn-circle opacity-0 group-hover:opacity-100"
                onClick={(e) => { e.stopPropagation(); onEdit(); }}
            >
                <Edit3 className="w-3 h-3" />
            </button>
        </div>
    );
}

export default function VenueLayoutPage() {
    const params = useParams();
    const venueId = params.venueId as string;

    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        }>
            <VenueLayoutEditorContent venueId={venueId} />
        </Suspense>
    );
}
