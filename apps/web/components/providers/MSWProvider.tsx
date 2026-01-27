'use client';

import { useEffect, useState } from 'react';

export function MSWProvider({ children }: { children: React.ReactNode }) {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        async function initMSW() {
            if (process.env.NODE_ENV === 'development') {
                const { worker } = await import('@/test/mocks/browser');
                await worker.start({
                    onUnhandledRequest: 'bypass',
                    serviceWorker: {
                        url: '/mockServiceWorker.js',
                    },
                });
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
