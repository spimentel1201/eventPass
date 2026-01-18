'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Calendar,
    Building2,
    Ticket,
    Settings,
    Menu,
    X,
    LogOut,
    User,
    ChevronDown,
    Shield,
    ShoppingCart,
    CalendarCheck,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

// Menu items for USER role (end users who buy tickets - Clientes)
const userMenuItems = [
    { href: '/dashboard', label: 'Panel', icon: LayoutDashboard },
    { href: '/dashboard/my-tickets', label: 'Mis Tickets', icon: Ticket },
    { href: '/dashboard/my-orders', label: 'Mis Compras', icon: ShoppingCart },
    { href: '/dashboard/my-events', label: 'Próximos Eventos', icon: CalendarCheck },
];

// Menu items for STAFF role (Organizers - create events)
const staffMenuItems = [
    { href: '/dashboard', label: 'Panel', icon: LayoutDashboard },
    { href: '/dashboard/events', label: 'Mis Eventos', icon: Calendar },
    { href: '/dashboard/venues', label: 'Recintos', icon: Building2 },
    { href: '/dashboard/orders', label: 'Ventas', icon: ShoppingCart },
    { href: '/dashboard/validate', label: 'Validar Tickets', icon: Ticket },
    { href: '/dashboard/settings', label: 'Configuración', icon: Settings },
];

// Menu items for ADMIN role (Platform administrators)
const adminMenuItems = [
    { href: '/dashboard', label: 'Panel', icon: LayoutDashboard },
    { href: '/dashboard/admin/users', label: 'Usuarios', icon: Shield },
    { href: '/dashboard/events', label: 'Eventos', icon: Calendar },
    { href: '/dashboard/venues', label: 'Recintos', icon: Building2 },
    { href: '/dashboard/admin/orders', label: 'Órdenes', icon: ShoppingCart },
    { href: '/dashboard/settings', label: 'Configuración', icon: Settings },
];

function getMenuItemsForRole(role: string | undefined) {
    switch (role) {
        case 'ADMIN':
            return adminMenuItems;
        case 'STAFF':
            return staffMenuItems;
        case 'USER':
        default:
            return userMenuItems;
    }
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const pathname = usePathname();
    const { user, logout } = useAuthStore();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const menuItems = getMenuItemsForRole(user?.role);

    const handleLogout = () => {
        logout();
        window.location.href = '/login';
    };

    const getRoleBadge = () => {
        switch (user?.role) {
            case 'ADMIN':
                return <span className="badge badge-error badge-sm">Admin</span>;
            case 'STAFF':
                return <span className="badge badge-primary badge-sm">Organizador</span>;
            default:
                return <span className="badge badge-ghost badge-sm">Cliente</span>;
        }
    };

    return (
        <div className="min-h-screen bg-base-100 flex">
            {/* Sidebar - Desktop */}
            <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
                <div className="flex flex-col flex-grow bg-base-200 border-r border-base-300">
                    {/* Logo */}
                    <div className="flex items-center h-16 px-6 border-b border-base-300">
                        <Link href="/dashboard" className="flex items-center gap-2">
                            <Ticket className="w-8 h-8 text-primary" />
                            <span className="text-xl font-bold">
                                <span className="text-primary">Neon</span>
                                <span className="text-secondary">Pass</span>
                            </span>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 py-4 px-3 space-y-1">
                        {menuItems.map((item) => {
                            const isActive = pathname === item.href ||
                                (item.href !== '/dashboard' && pathname.startsWith(item.href));
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive
                                        ? 'bg-primary text-primary-content'
                                        : 'hover:bg-base-300 text-base-content/70 hover:text-base-content'
                                        }`}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User */}
                    <div className="p-4 border-t border-base-300">
                        <div className="flex items-center gap-3">
                            <div className="avatar placeholder">
                                <div className="w-10 rounded-full bg-primary text-primary-content">
                                    <span>{user?.fullName?.charAt(0) || 'U'}</span>
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{user?.fullName || 'Usuario'}</p>
                                <div className="flex items-center gap-2">
                                    {getRoleBadge()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Mobile sidebar */}
            <div className={`lg:hidden fixed inset-0 z-50 ${sidebarOpen ? '' : 'pointer-events-none'}`}>
                {/* Overlay */}
                <div
                    className={`absolute inset-0 bg-black/50 transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0'
                        }`}
                    onClick={() => setSidebarOpen(false)}
                />

                {/* Sidebar */}
                <aside
                    className={`absolute left-0 top-0 bottom-0 w-64 bg-base-200 transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                        }`}
                >
                    <div className="flex items-center justify-between h-16 px-4 border-b border-base-300">
                        <span className="text-xl font-bold">
                            <span className="text-primary">Neon</span>
                            <span className="text-secondary">Pass</span>
                        </span>
                        <button className="btn btn-ghost btn-sm btn-circle" onClick={() => setSidebarOpen(false)}>
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <nav className="py-4 px-3 space-y-1">
                        {menuItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${isActive ? 'bg-primary text-primary-content' : 'hover:bg-base-300'
                                        }`}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Mobile user section */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-base-300">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="avatar placeholder">
                                <div className="w-10 rounded-full bg-primary text-primary-content">
                                    <span>{user?.fullName?.charAt(0) || 'U'}</span>
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{user?.fullName || 'Usuario'}</p>
                                {getRoleBadge()}
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="btn btn-outline btn-error btn-sm w-full"
                        >
                            <LogOut className="w-4 h-4" />
                            Cerrar sesión
                        </button>
                    </div>
                </aside>
            </div>

            {/* Main content */}
            <div className="lg:pl-64 flex flex-col flex-1">
                {/* Top bar */}
                <header className="sticky top-0 z-40 h-16 bg-base-200 border-b border-base-300 flex items-center px-4 lg:px-6">
                    <button
                        className="lg:hidden btn btn-ghost btn-sm btn-circle mr-2"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    <div className="flex-1" />

                    {/* User dropdown */}
                    <div className="dropdown dropdown-end">
                        <label
                            tabIndex={0}
                            className="btn btn-ghost gap-2"
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                        >
                            <div className="avatar placeholder">
                                <div className="w-8 rounded-full bg-primary text-primary-content">
                                    <span className="text-sm">{user?.fullName?.charAt(0) || 'U'}</span>
                                </div>
                            </div>
                            <span className="hidden sm:inline">{user?.fullName}</span>
                            <ChevronDown className="w-4 h-4" />
                        </label>
                        <ul
                            tabIndex={0}
                            className="dropdown-content menu p-2 shadow-lg bg-base-200 rounded-box w-52 mt-2"
                        >
                            <li>
                                <Link href="/dashboard/profile">
                                    <User className="w-4 h-4" />
                                    Mi Perfil
                                </Link>
                            </li>
                            <li>
                                <Link href="/dashboard/settings">
                                    <Settings className="w-4 h-4" />
                                    Configuración
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
                </header>

                {/* Page content */}
                <main className="flex-1 p-4 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
