import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const protectedRoutes = ['/dashboard', '/admin', '/checkout', '/orders'];

// Routes only for non-authenticated users
const authRoutes = ['/login', '/register'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check for auth token in cookies (set by client after login)
    const token = request.cookies.get('accessToken')?.value;
    const isAuthenticated = !!token;

    // Redirect authenticated users away from auth pages
    if (isAuthenticated && authRoutes.some((route) => pathname.startsWith(route))) {
        return NextResponse.redirect(new URL('/events', request.url));
    }

    // Redirect unauthenticated users from protected routes
    if (!isAuthenticated && protectedRoutes.some((route) => pathname.startsWith(route))) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/admin/:path*',
        '/checkout/:path*',
        '/orders/:path*',
        '/login',
        '/register',
    ],
};
