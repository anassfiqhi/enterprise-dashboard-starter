'use client';

import { ThemeProvider } from 'next-themes';
import { Provider } from 'react-redux';
import { store } from '@/lib/store';
import { SessionInitializer } from '@/components/SessionInitializer';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { MSWProvider } from '@/components/providers/MSWProvider';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ErrorBoundary>
            <MSWProvider>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                    <Provider store={store}>
                        <SessionInitializer />
                        {children}
                    </Provider>
                </ThemeProvider>
            </MSWProvider>
        </ErrorBoundary>
    );
}
