'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Ticket, Menu, User, LogOut, ShoppingCart } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isAuthenticated, logout } = useAuthStore();
    const { selectedSeats } = useCartStore();
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    const handleLogout = () => {
        logout();
        window.location.href = '/login';
    };

    const cartItemCount = selectedSeats?.length || 0;

    return (
        <div className="min-h-screen bg-base-100 flex flex-col">
            {/* Header */}
            <header className="navbar bg-base-200 shadow-lg sticky top-0 z-50">
                <div className="navbar-start">
                    <div className="dropdown">
                        <label tabIndex={0} className="btn btn-ghost lg:hidden">
                            <Menu className="w-5 h-5" />
                        </label>
                        <ul
                            tabIndex={0}
                            className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-200 rounded-box w-52"
                        >
                            <li><Link href="/events">Eventos</Link></li>
                            {mounted && isAuthenticated ? (
                                <>
                                    <li><Link href="/dashboard">Mi Dashboard</Link></li>
                                    <li><button onClick={handleLogout}>Cerrar sesión</button></li>
                                </>
                            ) : (
                                <li><Link href="/login">Iniciar sesión</Link></li>
                            )}
                        </ul>
                    </div>
                    <Link href="/" className="btn btn-ghost text-xl">
                        <Ticket className="w-6 h-6 text-primary" />
                        <span className="text-primary">Neon</span>
                        <span className="text-secondary">Pass</span>
                    </Link>
                </div>

                <div className="navbar-center hidden lg:flex">
                    <ul className="menu menu-horizontal px-1">
                        <li><Link href="/events" className="font-medium">Eventos</Link></li>
                    </ul>
                </div>

                <div className="navbar-end gap-2">
                    {/* Cart indicator */}
                    {mounted && cartItemCount > 0 && (
                        <Link href="/checkout" className="btn btn-ghost btn-sm btn-circle">
                            <div className="indicator">
                                <ShoppingCart className="w-5 h-5" />
                                <span className="badge badge-sm badge-primary indicator-item">
                                    {cartItemCount}
                                </span>
                            </div>
                        </Link>
                    )}

                    {mounted && isAuthenticated ? (
                        <div className="dropdown dropdown-end">
                            <label tabIndex={0} className="btn btn-ghost gap-2">
                                <div className="avatar placeholder">
                                    <div className="w-8 rounded-full bg-primary text-primary-content">
                                        <span className="text-sm">{user?.fullName?.charAt(0) || 'U'}</span>
                                    </div>
                                </div>
                                <span className="hidden sm:inline max-w-24 truncate">{user?.fullName}</span>
                            </label>
                            <ul
                                tabIndex={0}
                                className="dropdown-content menu p-2 shadow-lg bg-base-200 rounded-box w-52 mt-2"
                            >
                                <li className="menu-title">
                                    <span className="text-xs text-base-content/60">
                                        {user?.email}
                                    </span>
                                </li>
                                <li>
                                    <Link href="/dashboard">
                                        <User className="w-4 h-4" />
                                        Mi Dashboard
                                    </Link>
                                </li>
                                <div className="divider my-1" />
                                <li>
                                    <button onClick={handleLogout} className="text-error">
                                        <LogOut className="w-4 h-4" />
                                        Cerrar sesión
                                    </button>
                                </li>
                            </ul>
                        </div>
                    ) : (
                        <>
                            <Link href="/login" className="btn btn-ghost btn-sm">
                                Iniciar sesión
                            </Link>
                            <Link href="/register" className="btn btn-primary btn-sm">
                                Registrarse
                            </Link>
                        </>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1">
                {children}
            </main>

            {/* Footer */}
            <footer className="footer footer-center p-6 bg-base-200 text-base-content">
                <div>
                    <p className="text-base-content/60">
                        © 2026 NeonPass. Todos los derechos reservados.
                    </p>
                </div>
            </footer>
        </div>
    );
}
