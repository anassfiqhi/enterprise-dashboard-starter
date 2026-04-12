'use client';

import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session, isPending: isSessionLoading } = authClient.useSession();
  const { data: activeOrg, isPending: isOrgLoading } = authClient.useActiveOrganization();

  const user = session?.user;
  const activeHotel = activeOrg;
  const isLoading = isSessionLoading || isOrgLoading;

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isLoading && !user) {
      router.push('/login?redirect=/settings/members');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    // Redirect to home if no hotel selected
    if (!isLoading && user && !activeHotel) {
      router.push('/');
    }
  }, [user, activeHotel, isLoading, router]);

  if (isLoading || !user || !activeHotel) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 items-center justify-center">
          <div className="animate-pulse">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-1 gap-4 px-4 py-4 md:gap-6 md:py-6 lg:px-6">
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
