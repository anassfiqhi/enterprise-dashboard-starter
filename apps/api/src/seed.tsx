//@ts-ignore
import React, { useState } from 'react';
import { render, Box, Text } from 'ink';
import { TextInput, PasswordInput } from '@inkjs/ui';
import { auth } from './auth.js';
import { db, orders } from './db/index.js';

function SeedApp() {
    const [step, setStep] = useState<'email' | 'password' | 'name' | 'submitting' | 'seeding_orders' | 'done'>('email');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

    const handleEmailSubmit = (value: string) => {
        setEmail(value);
        setStep('password');
    };

    const handlePasswordSubmit = (value: string) => {
        setPassword(value);
        setStep('name');
    };

    const handleNameSubmit = async (value: string) => {
        setName(value || 'Admin User');
        setStep('submitting');

        try {
            // Create user
            await auth.api.signUpEmail({
                body: {
                    email,
                    password,
                    name: value || 'Admin User',
                },
            });

            // Seed orders
            setStep('seeding_orders');
            const sampleOrders = Array.from({ length: 50 }).map((_, i) => ({
                id: `ord_${String(i + 1).padStart(5, '0')}`,
                status: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'][i % 5] as any,
                customer: `Customer ${i + 1}`,
                amount: (Math.floor(Math.random() * 1000) + 100).toString(),
                createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
            }));

            await db.insert(orders).values(sampleOrders).onConflictDoNothing();

            setResult({
                success: true,
                message: `✅ User created: ${email}\n✅ Seeded 50 sample orders`,
            });
        } catch (e: any) {
            setResult({
                success: false,
                message: `ℹ️  Error: ${e.message || 'User might already exist'}`,
            });
        } finally {
            setStep('done');
            setTimeout(() => process.exit(0), 1500);
        }
    };

    if (step === 'done' && result) {
        return (
            <Box flexDirection="column" padding={1}>
                <Text color={result.success ? 'green' : 'red'}>{result.message}</Text>
            </Box>
        );
    }

    if (step === 'submitting') {
        return (
            <Box flexDirection="column" padding={1}>
                <Text color="yellow">Creating user...</Text>
            </Box>
        );
    }

    if (step === 'seeding_orders') {
        return (
            <Box flexDirection="column" padding={1}>
                <Text color="yellow">Seeding orders...</Text>
            </Box>
        );
    }

    return (
        <Box flexDirection="column" padding={1}>
            <Text bold color="cyan">
                🌱 Seed User
            </Text>
            <Box marginTop={1}>
                {step === 'email' && (
                    <Box flexDirection="column">
                        <Text dimColor>Enter email:</Text>
                        <TextInput placeholder="admin@example.com" onSubmit={handleEmailSubmit} />
                    </Box>
                )}
                {step === 'password' && (
                    <Box flexDirection="column">
                        <Text dimColor>Email: {email}</Text>
                        <Text dimColor>Enter password:</Text>
                        <PasswordInput onSubmit={handlePasswordSubmit} />
                    </Box>
                )}
                {step === 'name' && (
                    <Box flexDirection="column">
                        <Text dimColor>Email: {email}</Text>
                        <Text dimColor>Enter name (optional):</Text>
                        <TextInput placeholder="Admin User" onSubmit={handleNameSubmit} />
                    </Box>
                )}
            </Box>
        </Box>
    );
}

render(<SeedApp />);
