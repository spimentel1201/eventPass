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
    Grid3X3,
    Settings,
} from 'lucide-react';
import { useVenue, useVenueSections, useCreateSection, useUpdateSection, useDeleteSection } from '@/hooks/useVenues';
import type { Section } from '@/types';

interface SectionFormData {
    name: string;
    type: 'SEATED' | 'STANDING' | 'VIP' | 'DISABLED';
    rows: number;
    seatsPerRow: number;
    basePrice: number;
    color: string;
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
};

function VenueLayoutEditorContent({ venueId }: { venueId: string }) {
    const { data: venue, isLoading: venueLoading } = useVenue(venueId);
    const { data: sections, isLoading: sectionsLoading, refetch } = useVenueSections(venueId);
    const createSection = useCreateSection();
    const updateSection = useUpdateSection();
    const deleteSection = useDeleteSection();

    const [showModal, setShowModal] = useState(false);
    const [editingSection, setEditingSection] = useState<Section | null>(null);
    const [formData, setFormData] = useState<SectionFormData>(defaultFormData);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

    const openAddModal = () => {
        setEditingSection(null);
        setFormData(defaultFormData);
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
            refetch();
        } catch (error) {
            console.error('Error deleting section:', error);
        }
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
        <div className="space-y-6">
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
                <button className="btn btn-primary" onClick={openAddModal}>
                    <Plus className="w-4 h-4" />
                    Nueva Sección
                </button>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Canvas Preview */}
                <div className="lg:col-span-2">
                    <div className="card bg-base-200">
                        <div className="card-body">
                            <h2 className="card-title">Vista Previa</h2>

                            <div className="bg-base-300 rounded-xl p-6 min-h-96 relative">
                                {/* Stage */}
                                <div className="w-full h-16 bg-gradient-to-r from-primary/30 via-primary/50 to-primary/30 rounded-lg mb-8 flex items-center justify-center">
                                    <span className="text-primary-content font-bold text-lg">ESCENARIO</span>
                                </div>

                                {/* Sections Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {sections && sections.length > 0 ? (
                                        sections.map((section) => (
                                            <SectionPreviewCard
                                                key={section.id}
                                                section={section}
                                                onEdit={() => openEditModal(section)}
                                                onDelete={() => setShowDeleteConfirm(section.id)}
                                            />
                                        ))
                                    ) : (
                                        <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                                            <Grid3X3 className="w-16 h-16 text-base-content/20 mb-4" />
                                            <p className="text-base-content/60">No hay secciones</p>
                                            <p className="text-sm text-base-content/40">
                                                Agrega secciones para crear la distribución de asientos
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    <div className="card bg-base-200">
                        <div className="card-body">
                            <h2 className="card-title flex items-center gap-2">
                                <Settings className="w-5 h-5" />
                                Secciones ({sections?.length || 0})
                            </h2>

                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {sections && sections.length > 0 ? (
                                    sections.map((section) => (
                                        <SectionListItem
                                            key={section.id}
                                            section={section}
                                            onEdit={() => openEditModal(section)}
                                            onDelete={() => setShowDeleteConfirm(section.id)}
                                        />
                                    ))
                                ) : (
                                    <p className="text-center text-base-content/60 py-4">
                                        Sin secciones
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Venue Info */}
                    <div className="card bg-base-200">
                        <div className="card-body">
                            <h2 className="card-title text-lg">Info del Recinto</h2>
                            <div className="space-y-2 text-sm">
                                <p><strong>Nombre:</strong> {venue.name}</p>
                                <p><strong>Dirección:</strong> {venue.address || 'No especificada'}</p>
                                <p><strong>Capacidad total:</strong> {
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
                                            <span className="label-text">Asientos por fila</span>
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
                                {editingSection ? 'Guardar Cambios' : 'Crear Sección'}
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
                            Esta acción eliminará la sección y todos sus asientos. No se puede deshacer.
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

// Section Preview Card
function SectionPreviewCard({
    section,
    onEdit,
    onDelete
}: {
    section: Section;
    onEdit: () => void;
    onDelete: () => void;
}) {
    const config = section.layoutConfig || {};
    const rows = config.rows || 5;
    const seatsPerRow = config.seatsPerRow || 10;
    const color = config.color || '#3b82f6';

    return (
        <div
            className="p-4 rounded-xl border-2 transition-all hover:scale-102 group relative"
            style={{ borderColor: color, backgroundColor: `${color}20` }}
        >
            {/* Actions */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button
                    className="btn btn-xs btn-ghost btn-circle bg-base-100/80"
                    onClick={onEdit}
                    title="Editar"
                >
                    <Edit3 className="w-3 h-3" />
                </button>
                <button
                    className="btn btn-xs btn-ghost btn-circle bg-base-100/80 text-error"
                    onClick={onDelete}
                    title="Eliminar"
                >
                    <Trash2 className="w-3 h-3" />
                </button>
            </div>

            <div className="flex items-center justify-between mb-2">
                <span className="font-semibold" style={{ color }}>{section.name}</span>
                <span className="badge badge-sm">{section.type}</span>
            </div>

            {/* Mini seat grid preview */}
            <div className="grid gap-0.5" style={{
                gridTemplateColumns: `repeat(${Math.min(seatsPerRow, 10)}, 1fr)`
            }}>
                {Array.from({ length: Math.min(rows * Math.min(seatsPerRow, 10), 50) }).map((_, i) => (
                    <div
                        key={i}
                        className="aspect-square rounded-sm"
                        style={{ backgroundColor: color, opacity: 0.5 }}
                    />
                ))}
            </div>

            <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-base-content/60">
                    {section.capacity || (rows * seatsPerRow)} asientos
                </p>
                {config.basePrice && (
                    <p className="text-xs font-medium" style={{ color }}>
                        S/ {config.basePrice}
                    </p>
                )}
            </div>
        </div>
    );
}

// Section List Item
function SectionListItem({
    section,
    onEdit,
    onDelete
}: {
    section: Section;
    onEdit: () => void;
    onDelete: () => void;
}) {
    const config = section.layoutConfig || {};
    const color = config.color || '#3b82f6';

    return (
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-base-300 transition-colors group">
            <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: color }}
            />
            <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{section.name}</p>
                <p className="text-xs text-base-content/60">
                    {section.capacity || 0} asientos • S/ {config.basePrice || 0}
                </p>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="btn btn-ghost btn-xs btn-circle" onClick={onEdit}>
                    <Edit3 className="w-3 h-3" />
                </button>
                <button className="btn btn-ghost btn-xs btn-circle text-error" onClick={onDelete}>
                    <Trash2 className="w-3 h-3" />
                </button>
            </div>
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
