import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { authClient } from './lib/auth-client';
import { getSessionCookie } from "better-auth/cookies";
import { logger } from './lib/logger';

// Routes that don't require authentication
const publicRoutes = ['/login'];

// API routes to exclude from auth check (they handle auth themselves)
const excludedPaths = ['/api/auth', '/_next', '/favicon.ico'];

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip proxy for excluded paths
    if (excludedPaths.some(path => pathname.startsWith(path))) {
        return NextResponse.next();
    }

    // Allow public routes
    if (publicRoutes.includes(pathname)) {
        return NextResponse.next();
    }

    // Check for Better Auth session cookie
    // const sessionCookie = request.cookies.get('better-auth.session_token');
    // Cookie-based optimistic check (recommended approach)
    const sessionCookie = getSessionCookie(request);
    logger.info({ sessionCookie }, 'proxy: sessionCookie');
    const session = await authClient.getSession({
        fetchOptions: {
            headers: request.headers,
        },
    });
    logger.info({ session: session.data }, 'proxy: session');
    const orgs = await authClient.organization.list({
        fetchOptions: {
            headers: request.headers,
        },
    });
    logger.info({ orgs: orgs.data }, 'proxy: orgs');
    // If no session and trying to access protected route, redirect to login
    if (!sessionCookie) {
        const loginUrl = new URL('/login', request.url);
        // Preserve the original URL for redirect after login
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }
    // if (!orgs.data) {
    //     const selectOrgUrl = new URL('/select-org', request.url);
    //     // Preserve the original URL for redirect after login
    //     selectOrgUrl.searchParams.set('redirect', pathname);
    //     return NextResponse.redirect(selectOrgUrl);
    // }
    const activeMember = await authClient.organization.getActiveMember({
        fetchOptions: {
            headers: request.headers,
        },
    })
    if (pathname !== '/select-org' && pathname !== '/login' && activeMember.error?.code === 'NO_ACTIVE_ORGANIZATION') {
        logger.warn({ pathname }, 'proxy: NO_ACTIVE_ORGANIZATION, redirecting to /select-org');
        const selectOrgUrl = new URL('/select-org', request.url);
        // Preserve the original URL for redirect after login
        selectOrgUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(selectOrgUrl);
    }

    // User is authenticated, allow access
    return NextResponse.next();
}

export const config = {
    // Match all routes except static files and API routes
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
