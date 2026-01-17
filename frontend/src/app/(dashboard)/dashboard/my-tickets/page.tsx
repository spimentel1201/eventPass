'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Ticket, Download, QrCode, Calendar, MapPin, Clock, Search } from 'lucide-react';

// Mock data - will be replaced with real API
const mockTickets = [
    {
        id: '1',
        eventTitle: 'Perú vs Brasil - Copa América 2026',
        eventDate: '2026-06-17T21:00:00',
        venue: 'Estadio Nacional',
        section: 'Tribuna Norte',
        row: 'F',
        seat: '15',
        price: 275,
        status: 'ACTIVE',
        qrToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    },
    {
        id: '2',
        eventTitle: 'Perú vs Brasil - Copa América 2026',
        eventDate: '2026-06-17T21:00:00',
        venue: 'Estadio Nacional',
        section: 'Tribuna Norte',
        row: 'F',
        seat: '16',
        price: 275,
        status: 'ACTIVE',
        qrToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    },
];

export default function MyTicketsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'all' | 'active' | 'used'>('all');

    const filteredTickets = mockTickets.filter((ticket) => {
        const matchesSearch = ticket.eventTitle.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'all' ||
            (filter === 'active' && ticket.status === 'ACTIVE') ||
            (filter === 'used' && ticket.status === 'USED');
        return matchesSearch && matchesFilter;
    });

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-PE', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
    };

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
                        Todos
                    </button>
                    <button
                        className={`tab ${filter === 'active' ? 'tab-active' : ''}`}
                        onClick={() => setFilter('active')}
                    >
                        Activos
                    </button>
                    <button
                        className={`tab ${filter === 'used' ? 'tab-active' : ''}`}
                        onClick={() => setFilter('used')}
                    >
                        Usados
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
                                        <h3 className="font-bold text-lg">{ticket.eventTitle}</h3>
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
                                                {ticket.venue}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`badge ${ticket.status === 'ACTIVE' ? 'badge-success' : 'badge-ghost'}`}>
                                        {ticket.status === 'ACTIVE' ? 'Activo' : 'Usado'}
                                    </span>
                                </div>

                                {/* Seat Info */}
                                <div className="divider my-2"></div>
                                <div className="flex items-center justify-between">
                                    <div className="flex gap-4">
                                        <div className="text-center">
                                            <p className="text-xs text-base-content/50">Sección</p>
                                            <p className="font-bold">{ticket.section}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-base-content/50">Fila</p>
                                            <p className="font-bold">{ticket.row}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-base-content/50">Asiento</p>
                                            <p className="font-bold">{ticket.seat}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-base-content/50">Precio</p>
                                        <p className="font-bold text-lg">S/ {ticket.price}</p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="card-actions justify-end mt-4">
                                    <button className="btn btn-ghost btn-sm gap-2">
                                        <QrCode className="w-4 h-4" />
                                        Ver QR
                                    </button>
                                    <button className="btn btn-primary btn-sm gap-2">
                                        <Download className="w-4 h-4" />
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
        </div>
    );
}
