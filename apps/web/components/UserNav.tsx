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
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { LogOut, User, Building2, Settings } from 'lucide-react';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';

interface UserNavProps {
    user?: {
        name?: string;
        email?: string;
    };
}

export function UserNav({ user }: UserNavProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const organization = useSelector((state: RootState) => state.session.organization);
    const role = useSelector((state: RootState) => state.session.role);

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
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                            {user?.name || 'User'}
                        </p>
                        {user?.email && (
                            <p className="text-xs leading-none text-muted-foreground">
                                {user.email}
                            </p>
                        )}
                        {organization && (
                            <div className="flex items-center gap-1 mt-2 pt-2 border-t">
                                <Building2 className="h-3 w-3 text-muted-foreground" />
                                <p className="text-xs text-muted-foreground">
                                    {organization.name}
                                </p>
                            </div>
                        )}
                        {role && (
                            <p className="text-xs text-muted-foreground capitalize">
                                {role}
                            </p>
                        )}
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                </DropdownMenuItem>
                {organization && (
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
