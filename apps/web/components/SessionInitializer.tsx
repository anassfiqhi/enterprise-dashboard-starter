'use client';

import { useSession } from '@/hooks/useSession';

/**
 * Component that initializes session on app mount
 * Fetches user data and permissions from backend
 */
export function SessionInitializer() {
  useSession();



  // This component doesn't render anything
  // It just handles the side effect of fetching session
  return null;
}
