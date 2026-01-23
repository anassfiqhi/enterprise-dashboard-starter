'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { store } from '@/lib/store';
import { useState } from 'react';
import { SessionInitializer } from '@/components/SessionInitializer';
import { ErrorBoundary } from '@/components/ErrorBoundary';

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
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <SessionInitializer />
                    {children}
                </QueryClientProvider>
            </Provider>
        </ErrorBoundary>
    );
}
