'use client';

import { useSession } from '@/hooks/useSession';
import { useEffect } from 'react';

/**
 * Component that initializes session on app mount
 * Fetches user data and permissions from backend
 */
export function SessionInitializer() {
  const { data, isLoading, isError } = useSession();

  useEffect(() => {
    if (data) {
      console.log('Session initialized:', data.user.email);
    }
  }, [data]);

  // This component doesn't render anything
  // It just handles the side effect of fetching session
  return null;
}
