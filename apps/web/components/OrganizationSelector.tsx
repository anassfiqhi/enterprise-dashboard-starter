'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { authClient } from '@/lib/auth-client';
import { Building2, Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Organization {
    id: string;
    name: string;
    slug: string;
}

export function OrganizationSelector() {
    const router = useRouter();
    const organization = useSelector((state: RootState) => state.session.organization);
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        loadOrganizations();
    }, []);

    const loadOrganizations = async () => {
        try {
            const response = await authClient.organization.list();
            if (response.data) {
                setOrganizations(response.data);
            }
        } catch (error) {
            console.error('Failed to load organizations:', error);
        }
    };

    const handleOrganizationChange = async (orgId: string) => {
        if (orgId === organization?.id) return;

        setIsLoading(true);
        try {
            await authClient.organization.setActive({
                organizationId: orgId,
            });

            toast.success('Organization switched successfully');
            router.refresh();
        } catch (error) {
            console.error('Failed to switch organization:', error);
            toast.error('Failed to switch organization');
        } finally {
            setIsLoading(false);
        }
    };

    if (!organization || organizations.length === 0) {
        return null;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    className="w-[200px] justify-between"
                    disabled={isLoading}
                >
                    <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        <span className="truncate">{organization.name}</span>
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[200px]" align="start">
                <DropdownMenuLabel>Switch Organization</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {organizations.map((org) => (
                    <DropdownMenuItem
                        key={org.id}
                        onClick={() => handleOrganizationChange(org.id)}
                        className="cursor-pointer"
                    >
                        <div className="flex items-center justify-between w-full">
                            <span className="truncate">{org.name}</span>
                            {org.id === organization.id && (
                                <Check className="h-4 w-4" />
                            )}
                        </div>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
