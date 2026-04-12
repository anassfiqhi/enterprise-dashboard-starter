import { renderHook } from '@testing-library/react';
import { useCurrentUserRole } from '../useCurrentUserRole';
import { authClient } from '@/lib/auth-client';

jest.mock('@/lib/auth-client', () => ({
  authClient: {
    useSession: jest.fn(),
    useActiveMember: jest.fn(),
  },
}));

describe('useCurrentUserRole', () => {
  it('returns super_admin when user.isAdmin is true', () => {
    (authClient.useSession as jest.Mock).mockReturnValue({ data: { user: { isAdmin: true } } });
    (authClient.useActiveMember as jest.Mock).mockReturnValue({ data: null });

    const { result } = renderHook(() => useCurrentUserRole());
    expect(result.current).toBe('super_admin');
  });

  it('returns organization role when not super_admin', () => {
    (authClient.useSession as jest.Mock).mockReturnValue({ data: { user: { isAdmin: false } } });
    (authClient.useActiveMember as jest.Mock).mockReturnValue({ data: { role: 'admin' } });

    const { result } = renderHook(() => useCurrentUserRole());
    expect(result.current).toBe('admin');
  });

  it('returns null when no session or active member', () => {
    (authClient.useSession as jest.Mock).mockReturnValue({ data: null });
    (authClient.useActiveMember as jest.Mock).mockReturnValue({ data: null });

    const { result } = renderHook(() => useCurrentUserRole());
    expect(result.current).toBe(null);
  });
});
