'use client';

import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();

    // Get redirect URL from query params, default to dashboard
    const redirectTo = searchParams.get('redirect') || '/';

    // Clear error when user starts typing
    useEffect(() => {
        if (error) setError(null);
    }, [email, password]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            await authClient.signIn.email({
                email,
                password
            }, {
                onSuccess: async () => {
                    // After login, get user's organizations and set the first one as active
                    try {
                        const orgs = await authClient.organization.list();

                        if (orgs.data && orgs.data.length > 0) {
                            // Set the first organization as active
                            await authClient.organization.setActive({
                                organizationId: orgs.data[0].id
                            });
                        }
                    } catch (orgError) {
                        console.error('Failed to set active organization:', orgError);
                        // Continue anyway - user can select org later
                    }

                    // Redirect to the intended page or dashboard
                    router.push(redirectTo);
                    router.refresh(); // Refresh to update session state
                },
                onError: (ctx: { error: { message: string } }) => {
                    setError(ctx.error.message || 'Login failed. Please check your credentials.');
                    setIsLoading(false);
                }
            });
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
            setIsLoading(false);
        }
    };

    const handleSignUp = async () => {
        setError(null);
        setIsLoading(true);

        try {
            await authClient.signUp.email({
                email,
                password,
                name: email.split('@')[0] // Use email prefix as name
            }, {
                onSuccess: async (context) => {
                    // After signup, create an organization and set it as active
                    try {
                        const orgName = `${email.split('@')[0]}'s Organization`;
                        const orgSlug = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-');

                        const org = await authClient.organization.create({
                            name: orgName,
                            slug: orgSlug,
                        });

                        if (org.data) {
                            await authClient.organization.setActive({
                                organizationId: org.data.id
                            });
                        }
                    } catch (orgError) {
                        console.error('Failed to create organization:', orgError);
                        // Continue anyway
                    }

                    // Redirect to dashboard
                    router.push(redirectTo);
                    router.refresh();
                },
                onError: (ctx: { error: { message: string } }) => {
                    setError(ctx.error.message || 'Sign up failed. Please try again.');
                    setIsLoading(false);
                }
            });
        } catch (err) {
            setError('An unexpected error occurred during sign up.');
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-muted/40">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">Enterprise Dashboard</CardTitle>
                    <CardDescription>
                        Enter your credentials to access the dashboard
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin}>
                    <CardContent className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="admin@example.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                disabled={isLoading}
                                required
                                autoComplete="email"
                                autoFocus
                                data-lpignore="true"
                                data-1p-ignore
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                disabled={isLoading}
                                required
                                autoComplete="current-password"
                                data-lpignore="true"
                                data-1p-ignore
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2">
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading || !email || !password}
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={handleSignUp}
                            disabled={isLoading || !email || !password}
                        >
                            {isLoading ? 'Creating account...' : 'Sign Up (Dev)'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-muted/40">
                <Card className="w-full max-w-md">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold">Enterprise Dashboard</CardTitle>
                        <CardDescription>Loading...</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}
