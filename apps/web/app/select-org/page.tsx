'use client';

import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { Building2, ArrowRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type Organization = {
    id: string;
    name: string;
    slug: string;
    createdAt: Date;
    logo?: string | null | undefined;
    metadata?: any;
}
type OrganizationError = {
    code?: string | undefined;
    message?: string | undefined;
    status: number;
    statusText: string;
}

export default function SelectOrgPage() {
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<OrganizationError | null>(null);

    useEffect(() => {
        startTransition(async () => {
            const { data, error } = await authClient.organization.list();
            console.log(data);
            if (error) {
                setError(error);
            } else {
                setOrganizations(data || []);
            }
        });
    }, []);

    const router = useRouter();
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
                        <CardTitle>Loading organizations...</CardTitle>
                    </CardHeader>
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
                    {organizations?.length === 0 ? (
                        <div className="text-center py-6 space-y-4">
                            <p className="text-muted-foreground">You don't have any organizations yet.</p>
                            {/* Optionally add a create organization button here if the flow supports it */}
                        </div>
                    ) : (
                        <div className="grid gap-2">
                            {organizations?.map((org) => (
                                <Button
                                    key={org.id}
                                    variant="outline"
                                    className="h-auto p-4 flex items-center justify-between group hover:border-primary"
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
