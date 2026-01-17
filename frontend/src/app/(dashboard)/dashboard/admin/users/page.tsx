'use client';

import { useState } from 'react';
import { useAdminUsers, useChangeUserRole, useDeactivateUser } from '@/hooks/useAdmin';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import {
    Users,
    Search,
    ChevronLeft,
    ChevronRight,
    Shield,
    UserCheck,
    UserX,
    AlertCircle,
    MoreVertical,
} from 'lucide-react';

const ROLES = [
    { value: 'ADMIN', label: 'Administrador', color: 'bg-error text-error-content' },
    { value: 'STAFF', label: 'Staff', color: 'bg-warning text-warning-content' },
    { value: 'USER', label: 'Usuario', color: 'bg-info text-info-content' },
];

export default function AdminUsersPage() {
    const { user: currentUser } = useAuthStore();
    const [page, setPage] = useState(0);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [newRole, setNewRole] = useState<string>('');

    const { data, isLoading, error } = useAdminUsers(page, 10);
    const changeRole = useChangeUserRole();
    const deactivateUser = useDeactivateUser();

    // Check if user is admin
    if (currentUser?.role !== 'ADMIN') {
        return (
            <div className="text-center py-16">
                <AlertCircle className="w-16 h-16 mx-auto text-error mb-4" />
                <h2 className="text-2xl font-bold mb-2">Acceso Denegado</h2>
                <p className="text-base-content/60 mb-6">
                    No tienes permisos para acceder a esta sección.
                </p>
                <Link href="/dashboard" className="btn btn-primary">
                    Volver al Dashboard
                </Link>
            </div>
        );
    }

    const handleChangeRole = async (userId: string) => {
        if (!newRole) return;
        try {
            await changeRole.mutateAsync({ userId, role: newRole });
            setSelectedUserId(null);
            setNewRole('');
        } catch (err) {
            console.error('Error changing role:', err);
        }
    };

    const handleDeactivate = async (userId: string) => {
        if (!confirm('¿Estás seguro de desactivar este usuario?')) return;
        try {
            await deactivateUser.mutateAsync(userId);
        } catch (err) {
            console.error('Error deactivating user:', err);
        }
    };

    const getRoleBadge = (role: string) => {
        const roleConfig = ROLES.find((r) => r.value === role);
        return (
            <span className={`badge ${roleConfig?.color || 'bg-base-300 text-base-content'}`}>
                {roleConfig?.label || role}
            </span>
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-PE', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="skeleton h-8 w-48" />
                <div className="skeleton h-96 rounded-xl" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-16">
                <AlertCircle className="w-16 h-16 mx-auto text-error mb-4" />
                <h2 className="text-2xl font-bold mb-2">Error al cargar</h2>
                <p className="text-base-content/60">
                    No se pudieron cargar los usuarios.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Users className="w-8 h-8" />
                        Gestión de Usuarios
                    </h1>
                    <p className="text-base-content/60 mt-1">
                        {data?.totalElements ?? 0} usuarios registrados
                    </p>
                </div>
                <Link href="/dashboard/admin" className="btn btn-ghost">
                    <ChevronLeft className="w-4 h-4" />
                    Volver
                </Link>
            </div>

            {/* Users Table */}
            <div className="card bg-base-200">
                <div className="card-body">
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Usuario</th>
                                    <th>Rol</th>
                                    <th>Registro</th>
                                    <th>Último acceso</th>
                                    <th className="text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data?.content.map((user) => (
                                    <tr key={user.id} className="hover">
                                        <td>
                                            <div>
                                                <p className="font-medium">{user.fullName}</p>
                                                <p className="text-sm text-base-content/60">{user.email}</p>
                                            </div>
                                        </td>
                                        <td>{getRoleBadge(user.role)}</td>
                                        <td className="text-sm">{formatDate(user.createdAt)}</td>
                                        <td className="text-sm">
                                            {user.lastLoginAt ? formatDate(user.lastLoginAt) : '-'}
                                        </td>
                                        <td className="text-right">
                                            <div className="dropdown dropdown-end">
                                                <div tabIndex={0} role="button" className="btn btn-ghost btn-sm btn-circle">
                                                    <MoreVertical className="w-4 h-4" />
                                                </div>
                                                <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-300 rounded-box w-52 z-10">
                                                    <li>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedUserId(user.id);
                                                                setNewRole(user.role);
                                                            }}
                                                        >
                                                            <Shield className="w-4 h-4" />
                                                            Cambiar Rol
                                                        </button>
                                                    </li>
                                                    {user.active && user.id !== currentUser?.id && (
                                                        <li>
                                                            <button
                                                                className="text-error"
                                                                onClick={() => handleDeactivate(user.id)}
                                                            >
                                                                <UserX className="w-4 h-4" />
                                                                Desactivar
                                                            </button>
                                                        </li>
                                                    )}
                                                </ul>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {data && data.totalPages > 1 && (
                        <div className="flex justify-center items-center gap-4 mt-6">
                            <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => setPage((p) => Math.max(0, p - 1))}
                                disabled={page === 0}
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Anterior
                            </button>
                            <span className="text-sm">
                                Página {page + 1} de {data.totalPages}
                            </span>
                            <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => setPage((p) => p + 1)}
                                disabled={page >= data.totalPages - 1}
                            >
                                Siguiente
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Change Role Modal */}
            {selectedUserId && (
                <dialog className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg">Cambiar Rol</h3>
                        <div className="py-4">
                            <select
                                className="select select-bordered w-full"
                                value={newRole}
                                onChange={(e) => setNewRole(e.target.value)}
                            >
                                {ROLES.map((role) => (
                                    <option key={role.value} value={role.value}>
                                        {role.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="modal-action">
                            <button
                                className="btn btn-ghost"
                                onClick={() => {
                                    setSelectedUserId(null);
                                    setNewRole('');
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={() => handleChangeRole(selectedUserId)}
                                disabled={changeRole.isPending}
                            >
                                {changeRole.isPending ? 'Guardando...' : 'Guardar'}
                            </button>
                        </div>
                    </div>
                    <div className="modal-backdrop" onClick={() => setSelectedUserId(null)} />
                </dialog>
            )}
        </div>
    );
}
