import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { completeInitialization } from '@/lib/reducers/auth/authSlice';
import { authClient } from '@/lib/auth-client';

/**
 * Hook to fetch current session using Better Auth
 * 
 * This hook wraps Better Auth's native useSession hook and tracks
 * app initialization state in Redux.
 * 
 * NOTE: Session data is NOT synced to Redux. Use the returned data directly.
 * 
 * @returns Session data with user and session info, loading states, and error
 */
export function useSession() {
  const dispatch = useDispatch();

  // Use Better Auth's native hook
  const sessionQuery = authClient.useSession();
  const { isPending, isRefetching } = sessionQuery;

  // Track initialization completion
  useEffect(() => {
    if (!isPending && !isRefetching) {
      dispatch(completeInitialization());
    }
  }, [isPending, isRefetching, dispatch]);

  return sessionQuery;
}
