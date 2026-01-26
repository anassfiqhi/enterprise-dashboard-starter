'use client';

import { usePathname } from 'next/navigation';
import { AppSidebar } from './app-sidebar';
import { SiteHeader } from './site-header';
import { SidebarInset } from '@/components/ui/sidebar';

interface LayoutWrapperProps {
    children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
    const pathname = usePathname();

    // Don't show sidebar on login or accept-invitation pages
    const isFullscreenPage = pathname === '/login' || pathname?.startsWith('/accept-invitation');

    if (isFullscreenPage) {
        return <main className="min-h-svh w-full">{children}</main>;
    }

    return (
        <>
            <AppSidebar variant="floating" />
            <SidebarInset>
                <SiteHeader />
                {children}
            </SidebarInset>
        </>
    );
}
