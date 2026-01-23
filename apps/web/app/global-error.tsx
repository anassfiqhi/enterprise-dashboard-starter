'use client';

import { useEffect } from 'react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Global error:', error);
    }, [error]);

    return (
        <html>
            <body>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    padding: '1rem',
                    fontFamily: 'system-ui, sans-serif'
                }}>
                    <div style={{
                        maxWidth: '32rem',
                        width: '100%',
                        padding: '2rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        backgroundColor: '#fff',
                        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
                    }}>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                            Application Error
                        </h1>
                        <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                            A critical error occurred. Please refresh the page or contact support if the problem persists.
                        </p>
                        <div style={{
                            backgroundColor: '#f9fafb',
                            padding: '1rem',
                            borderRadius: '0.375rem',
                            marginBottom: '1.5rem',
                            fontFamily: 'monospace',
                            fontSize: '0.875rem',
                            color: '#374151'
                        }}>
                            <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Error:</p>
                            <p style={{ wordBreak: 'break-word' }}>{error.message || 'Unknown error'}</p>
                            {error.digest && (
                                <p style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
                                    Error ID: {error.digest}
                                </p>
                            )}
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                                onClick={() => reset()}
                                style={{
                                    flex: 1,
                                    padding: '0.5rem 1rem',
                                    backgroundColor: '#3b82f6',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '0.375rem',
                                    cursor: 'pointer',
                                    fontWeight: '500'
                                }}
                            >
                                Try Again
                            </button>
                            <button
                                onClick={() => window.location.href = '/'}
                                style={{
                                    flex: 1,
                                    padding: '0.5rem 1rem',
                                    backgroundColor: '#fff',
                                    color: '#374151',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '0.375rem',
                                    cursor: 'pointer',
                                    fontWeight: '500'
                                }}
                            >
                                Go Home
                            </button>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    );
}
