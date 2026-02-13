'use client';

import { useEffect, useState } from 'react';

export function MSWProvider({ children }: { children: React.ReactNode }) {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        async function initMSW() {
            if (process.env.NODE_ENV === 'development') {
                try {
                    const { worker } = await import('@/test/mocks/browser');
                    await worker.start({
                        onUnhandledRequest: 'bypass',
                        serviceWorker: {
                            url: '/mockServiceWorker.js',
                        },
                    });
                    console.log('[MSW] Service worker started successfully');
                } catch (error) {
                    // MSW failed to start, but don't block the app
                    console.warn('[MSW] Failed to start service worker, continuing without mocks:', error);
                }
            }
            setIsReady(true);
        }

        initMSW();
    }, []);

    if (!isReady) {
        return null;
    }

    return <>{children}</>;
}
