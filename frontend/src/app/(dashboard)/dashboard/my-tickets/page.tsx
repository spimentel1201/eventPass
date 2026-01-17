'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Ticket, Download, QrCode, Calendar, MapPin, Clock, Search, Loader2 } from 'lucide-react';
import { useMyTickets, useDownloadTicket, MyTicket } from '@/hooks/useTickets';

export default function MyTicketsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'all' | 'active' | 'used'>('all');
    const [showQrModal, setShowQrModal] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<MyTicket | null>(null);

    const { data: tickets = [], isLoading, error } = useMyTickets();
    const downloadMutation = useDownloadTicket();

    const filteredTickets = tickets.filter((ticket) => {
        const matchesSearch = ticket.eventTitle?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'all' ||
            (filter === 'active' && ticket.status === 'VALID') ||
            (filter === 'used' && ticket.status === 'USED');
        return matchesSearch && matchesFilter;
    });

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-PE', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const formatTime = (dateStr: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
    };

    const handleDownload = async (ticket: MyTicket) => {
        try {
            await downloadMutation.mutateAsync({
                ticketId: ticket.id,
                filename: `ticket_${ticket.eventTitle?.replace(/\s+/g, '_')}_${ticket.id.substring(0, 8)}.pdf`
            });
        } catch (error) {
            console.error('Error downloading ticket:', error);
        }
    };

    const handleShowQr = (ticket: MyTicket) => {
        setSelectedTicket(ticket);
        setShowQrModal(true);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="card bg-base-200">
                <div className="card-body items-center text-center py-12">
                    <p className="text-error">Error al cargar los tickets</p>
                    <Link href="/dashboard" className="btn btn-primary mt-4">
                        Volver al dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="btn btn-ghost btn-sm btn-circle">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Ticket className="w-6 h-6 text-primary" />
                            Mis Tickets
                        </h1>
                        <p className="text-base-content/60">Gestiona tus entradas</p>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
                    <input
                        type="text"
                        placeholder="Buscar por evento..."
                        className="input input-bordered w-full pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="tabs tabs-boxed bg-base-200">
                    <button
                        className={`tab ${filter === 'all' ? 'tab-active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        Todos ({tickets.length})
                    </button>
                    <button
                        className={`tab ${filter === 'active' ? 'tab-active' : ''}`}
                        onClick={() => setFilter('active')}
                    >
                        Activos ({tickets.filter(t => t.status === 'VALID').length})
                    </button>
                    <button
                        className={`tab ${filter === 'used' ? 'tab-active' : ''}`}
                        onClick={() => setFilter('used')}
                    >
                        Usados ({tickets.filter(t => t.status === 'USED').length})
                    </button>
                </div>
            </div>

            {/* Tickets Grid */}
            {filteredTickets.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filteredTickets.map((ticket) => (
                        <div key={ticket.id} className="card bg-base-200 overflow-hidden">
                            <div className="card-body">
                                {/* Event Info */}
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-bold text-lg">{ticket.eventTitle || 'Evento'}</h3>
                                        <div className="mt-2 space-y-1 text-sm text-base-content/70">
                                            <p className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                {formatDate(ticket.eventDate)}
                                            </p>
                                            <p className="flex items-center gap-2">
                                                <Clock className="w-4 h-4" />
                                                {formatTime(ticket.eventDate)}
                                            </p>
                                            <p className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4" />
                                                {ticket.venueName || 'Venue'}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`badge ${ticket.status === 'VALID' ? 'badge-success' : ticket.status === 'USED' ? 'badge-ghost' : 'badge-error'}`}>
                                        {ticket.status === 'VALID' ? 'Activo' : ticket.status === 'USED' ? 'Usado' : 'Cancelado'}
                                    </span>
                                </div>

                                {/* Seat Info */}
                                <div className="divider my-2"></div>
                                <div className="flex items-center justify-between">
                                    <div className="flex gap-4">
                                        <div className="text-center">
                                            <p className="text-xs text-base-content/50">Sección</p>
                                            <p className="font-bold">{ticket.sectionName || ticket.tierName || 'GA'}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-base-content/50">Fila</p>
                                            <p className="font-bold">{ticket.row || '-'}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-base-content/50">Asiento</p>
                                            <p className="font-bold">{ticket.seatNumber || 'GA'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-base-content/50">Precio</p>
                                        <p className="font-bold text-lg">{ticket.currency} {ticket.price}</p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="card-actions justify-end mt-4">
                                    <button
                                        className="btn btn-ghost btn-sm gap-2"
                                        onClick={() => handleShowQr(ticket)}
                                    >
                                        <QrCode className="w-4 h-4" />
                                        Ver QR
                                    </button>
                                    <button
                                        className="btn btn-primary btn-sm gap-2"
                                        onClick={() => handleDownload(ticket)}
                                        disabled={downloadMutation.isPending}
                                    >
                                        {downloadMutation.isPending ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Download className="w-4 h-4" />
                                        )}
                                        Descargar PDF
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card bg-base-200">
                    <div className="card-body items-center text-center py-12">
                        <Ticket className="w-16 h-16 text-base-content/20 mb-4" />
                        <h3 className="text-xl font-bold">No tienes tickets</h3>
                        <p className="text-base-content/60 mb-4">
                            {searchTerm ? 'No encontramos tickets con esa búsqueda' : 'Compra entradas para tus eventos favoritos'}
                        </p>
                        <Link href="/events" className="btn btn-primary">
                            Explorar eventos
                        </Link>
                    </div>
                </div>
            )}

            {/* QR Modal */}
            {showQrModal && selectedTicket && (
                <dialog className="modal modal-open">
                    <div className="modal-box text-center">
                        <h3 className="font-bold text-lg mb-4">Código QR del Ticket</h3>
                        <p className="text-sm text-base-content/60 mb-4">{selectedTicket.eventTitle}</p>

                        {/* QR Code placeholder - The actual QR would need a QR library */}
                        <div className="bg-white p-4 rounded-lg inline-block mb-4">
                            <div className="w-48 h-48 bg-base-200 flex items-center justify-center rounded">
                                <QrCode className="w-32 h-32 text-base-content/30" />
                            </div>
                        </div>

                        <p className="text-xs text-base-content/50 mb-4">
                            Presenta este código en la entrada del evento
                        </p>

                        <p className="text-xs font-mono text-base-content/40 break-all mb-4">
                            {selectedTicket.qrCodeHash?.substring(0, 40)}...
                        </p>

                        <div className="modal-action justify-center">
                            <button
                                className="btn btn-primary gap-2"
                                onClick={() => handleDownload(selectedTicket)}
                            >
                                <Download className="w-4 h-4" />
                                Descargar PDF
                            </button>
                            <button className="btn" onClick={() => setShowQrModal(false)}>
                                Cerrar
                            </button>
                        </div>
                    </div>
                    <form method="dialog" className="modal-backdrop">
                        <button onClick={() => setShowQrModal(false)}>close</button>
                    </form>
                </dialog>
            )}
        </div>
    );
}
