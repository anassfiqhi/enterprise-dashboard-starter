'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { RoleBadge } from '@/components/ui/role-badge';
import { authClient, User } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { LogOut, Building2, Settings, UserIcon } from 'lucide-react';
import { useState } from 'react';


interface UserNavProps {
    user?: User
}

export function UserNav({ user }: UserNavProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const { data: activeOrg } = authClient.useActiveOrganization();
    const activeHotel = activeOrg;
    // We can get the active member role from useListOrganizations or just assume for now
    // Better Auth doesn't expose activeMember directly in one hook easily without iteration
    // For now we'll just skip the activeMember role display or fetch it properly if critical
    const { data: activeMember } = authClient.useActiveMember(); // simplified for now to avoid complex hook logic in this refactor
    const { data: session } = authClient.useSession();
    const isAdmin = user?.role === 'admin';

    const handleLogout = async () => {
        setIsLoading(true);
        try {
            await authClient.signOut({
                fetchOptions: {
                    onSuccess: () => {
                        router.push('/login');
                        router.refresh();
                    },
                    onError: (error) => {
                        console.error('Logout failed:', error);
                        setIsLoading(false);
                    },
                },
            });
        } catch (error) {
            console.error('Logout error:', error);
            setIsLoading(false);
        }
    };

    const initials = user?.name
        ? user.name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
        : user?.email
            ? user.email.slice(0, 2).toUpperCase()
            : 'U';

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                        <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className={`w-56 ${isAdmin ? 'border-blue-500/30 bg-linear-to-br from-blue-500/5 to-transparent' : ''}`}
                align="end"
                forceMount
            >
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <div className="flex items-center gap-2">
                            <p className="text-sm font-medium leading-none">
                                {user?.name || 'User'}
                            </p>
                            {isAdmin && <RoleBadge role="Admin" size="sm" />}
                        </div>
                        {user?.email && (
                            <p className="text-xs leading-none text-muted-foreground">
                                {user.email}
                            </p>
                        )}
                        {isAdmin && (
                            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">
                                System Administrator
                            </p>
                        )}
                        {activeHotel && (
                            <div className="flex items-center gap-1 mt-2 pt-2 border-t">
                                <Building2 className="h-3 w-3 text-muted-foreground" />
                                <p className="text-xs text-muted-foreground">
                                    {activeHotel.name}
                                </p>
                            </div>
                        )}
                        {activeMember?.role && !isAdmin && (
                            <RoleBadge role={activeMember.role} size="sm" className="mt-1" />
                        )}
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                </DropdownMenuItem>
                {activeHotel && (
                    <DropdownMenuItem onClick={() => router.push('/settings/members')}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                    </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={handleLogout}
                    disabled={isLoading}
                    className="text-destructive focus:text-destructive"
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{isLoading ? 'Signing out...' : 'Sign out'}</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
