import Link from 'next/link';
import { Ticket, Menu } from 'lucide-react';

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
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
                            <li><Link href="/login">Iniciar sesión</Link></li>
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
                    <Link href="/login" className="btn btn-ghost btn-sm">
                        Iniciar sesión
                    </Link>
                    <Link href="/register" className="btn btn-primary btn-sm">
                        Registrarse
                    </Link>
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
