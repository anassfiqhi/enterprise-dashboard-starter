'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Application error:', error);
    }, [error]);

    return (
        <div className="flex items-center justify-center min-h-screen p-4 bg-muted/40">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <AlertCircle className="h-12 w-12 text-destructive" />
                    </div>
                    <CardTitle className="text-2xl">Something went wrong</CardTitle>
                    <CardDescription>
                        An unexpected error occurred. Please try again.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-lg bg-muted p-4 text-sm font-mono text-muted-foreground">
                        <p className="font-semibold text-foreground mb-2">Error details:</p>
                        <p className="break-words">{error.message}</p>
                        {error.digest && (
                            <p className="mt-2 text-xs">Error ID: {error.digest}</p>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                    <Button onClick={() => reset()} className="flex-1">
                        Try Again
                    </Button>
                    <Button
                        onClick={() => window.location.href = '/'}
                        variant="outline"
                        className="flex-1"
                    >
                        Go Home
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
