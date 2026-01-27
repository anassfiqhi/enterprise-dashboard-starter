'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Provider } from 'react-redux';
import { store } from '@/lib/store';
import { useState } from 'react';
import { SessionInitializer } from '@/components/SessionInitializer';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { MSWProvider } from '@/components/providers/MSWProvider';

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                retry: 1,
                refetchOnWindowFocus: false,
            },
        },
    }));

    return (
        <ErrorBoundary>
            <MSWProvider>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                    <Provider store={store}>
                        <QueryClientProvider client={queryClient}>
                            <SessionInitializer />
                            {children}
                        </QueryClientProvider>
                    </Provider>
                </ThemeProvider>
            </MSWProvider>
        </ErrorBoundary>
    );
}
