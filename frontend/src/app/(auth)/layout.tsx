export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-base-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-primary">
                        Neon<span className="text-secondary">Pass</span>
                    </h1>
                    <p className="text-base-content/60 mt-2">
                        High Performance Ticketing
                    </p>
                </div>

                {/* Auth Card */}
                <div className="card bg-base-200 shadow-xl">
                    <div className="card-body">
                        {children}
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-base-content/40 text-sm mt-6">
                    © 2026 NeonPass. Todos los derechos reservados.
                </p>
            </div>
        </div>
    );
}
