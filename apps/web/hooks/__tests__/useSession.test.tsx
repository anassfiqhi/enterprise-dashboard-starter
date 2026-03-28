import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useSession } from '../useSession';
import { createReduxWrapper } from '@/test/test-utils';
import { server } from '@/test/mocks/server';
import { errorHandlers } from '@/test/mocks/handlers';
import { mockAdminSession } from '@/test/mocks/fixtures';

describe('useSession', () => {
  describe('successful fetch', () => {
    it('fetches session data', async () => {
      const { Wrapper } = createReduxWrapper();
      const { result } = renderHook(() => useSession(), { wrapper: Wrapper });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isSuccess).toBe(true);
      expect(result.current.data).toBeDefined();
      expect(result.current.data?.user.email).toBe('admin@example.com');
    });

    it('returns user, organization, role, and permissions', async () => {
      const { Wrapper } = createReduxWrapper();
      const { result } = renderHook(() => useSession(), { wrapper: Wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.user).toEqual(mockAdminSession.user);
      expect(result.current.data?.organization).toEqual(mockAdminSession.organization);
      expect(result.current.data?.role).toBe('admin');
      expect(result.current.data?.permissions).toBeDefined();
    });
  });

  describe('unauthenticated state', () => {
    it('returns null when user is not authenticated (401)', async () => {
      server.use(errorHandlers.sessionUnauthenticated);

      const { Wrapper } = createReduxWrapper();
      const { result } = renderHook(() => useSession(), { wrapper: Wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toBeNull();
      expect(result.current.isError).toBe(false); // 401 is handled gracefully
    });
  });

  describe('error handling', () => {
    it('does not retry on failure (retry: false)', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch');
      server.use(errorHandlers.sessionServerError);

      const { Wrapper } = createReduxWrapper();
      const { result } = renderHook(() => useSession(), { wrapper: Wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      // Should only call fetch once (no retries)
      const sessionCalls = fetchSpy.mock.calls.filter(
        (call) => call[0].toString().includes('/session')
      );
      expect(sessionCalls.length).toBe(1);

      fetchSpy.mockRestore();
    });
  });
});
