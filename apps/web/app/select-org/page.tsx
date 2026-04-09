'use client';

import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

export default function SelectOrgPage() {
    const router = useRouter();
    const { data: organizations, isPending, error } = authClient.useListOrganizations();
    const [selectingOrgId, setSelectingOrgId] = useState<string | null>(null);

    const handleSelectOrg = async (orgId: string) => {
        setSelectingOrgId(orgId);
        await authClient.organization.setActive({
            organizationId: orgId,
        });
        router.push('/');
        router.refresh();
    };

    if (isPending) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-muted/40">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-2xl">Select Organization</CardTitle>
                        <CardDescription>
                            Choose the organization you want to access
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Skeleton className="h-16 w-full rounded-lg" />
                        <Skeleton className="h-16 w-full rounded-lg" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-muted/40">
                <Card className="w-full max-w-md border-destructive">
                    <CardHeader>
                        <CardTitle className="text-destructive">Error</CardTitle>
                        <CardDescription>{error.message}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => window.location.reload()}>Try Again</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl">Select Organization</CardTitle>
                    <CardDescription>
                        Choose the organization you want to access
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {!organizations?.length ? (
                        <div className="text-center py-6 space-y-4">
                            <p className="text-muted-foreground">You don&apos;t have any organizations yet.</p>
                        </div>
                    ) : (
                        <div className="grid gap-2">
                            {organizations.map((org) => (
                                <Button
                                    key={org.id}
                                    variant="outline"
                                    className="h-16 p-4 flex items-center justify-between group hover:border-primary"
                                    onClick={() => handleSelectOrg(org.id)}
                                    disabled={!!selectingOrgId}
                                >
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={org.logo || ''} alt={org.name} />
                                            <AvatarFallback className="bg-primary/10 text-primary">
                                                {org.name.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="text-left">
                                            <p className="font-medium">{org.name}</p>
                                            <p className="text-xs text-muted-foreground capitalize">Member</p>
                                        </div>
                                    </div>
                                    {selectingOrgId === org.id ? (
                                        <span className="loading loading-spinner loading-sm" />
                                    ) : (
                                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                    )}
                                </Button>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
