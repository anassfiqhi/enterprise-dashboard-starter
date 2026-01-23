'use client';

import Link from 'next/link';
import { UserNav } from './UserNav';
import { OrganizationSelector } from './OrganizationSelector';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';

export function Header() {
    const user = useSelector((state: RootState) => state.session.user);

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 justify-center items-center">
                <div className="mr-4 flex">
                    <Link href="/" className="mr-6 flex items-center space-x-2">
                        <span className="font-bold">Enterprise Dashboard</span>
                    </Link>
                    <nav className="flex items-center space-x-6 text-sm font-medium">
                        <Link
                            href="/"
                            className="transition-colors hover:text-foreground/80 text-foreground/60"
                        >
                            Dashboard
                        </Link>
                        <Link
                            href="/orders"
                            className="transition-colors hover:text-foreground/80 text-foreground/60"
                        >
                            Orders
                        </Link>
                    </nav>
                </div>
                <div className="ml-auto flex items-center space-x-4">
                    <OrganizationSelector />
                    {user && <UserNav user={user} />}
                </div>
            </div>
        </header>
    );
}
