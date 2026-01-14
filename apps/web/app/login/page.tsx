'use client';

import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleLogin = async () => {
        await authClient.signIn.email({
            email,
            password
        }, {
            onSuccess: () => {
                router.push('/orders');
            },
            onError: (ctx: { error: { message: string } }) => {
                alert(ctx.error.message);
            }
        });
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
            <h1 className="text-2xl font-bold">Login</h1>
            <input
                className="border p-2 rounded"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
            />
            <input
                className="border p-2 rounded"
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
            />
            <Button onClick={handleLogin}>Sign In</Button>
            <Button variant="link" onClick={() => {
                authClient.signUp.email({
                    email,
                    password,
                    name: 'Test User'
                });
            }}>Sign Up (Dev)</Button>
        </div>
    );
}
