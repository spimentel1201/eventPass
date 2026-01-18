'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

interface UseAuthGuardOptions {
    requiredRole?: string | string[];
    redirectTo?: string;
}

export function useAuthGuard(options: UseAuthGuardOptions = {}) {
    const { requiredRole, redirectTo = '/login' } = options;
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated, user } = useAuthStore();

    useEffect(() => {
        // Not authenticated
        if (!isAuthenticated) {
            router.push(`${redirectTo}?redirect=${encodeURIComponent(pathname)}`);
            return;
        }

        // Check role if required
        if (requiredRole && user) {
            const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
            if (!roles.includes(user.role)) {
                router.push('/unauthorized');
            }
        }
    }, [isAuthenticated, user, requiredRole, router, pathname, redirectTo]);

    return { isAuthenticated, user };
}
