import { describe, it, expect } from 'vitest';
import reducer, {
  setSession,
  setLoading,
  clearSession,
  hasPermission,
  type SessionState,
} from '../sessionSlice';

describe('sessionSlice', () => {
  const initialState: SessionState = {
    user: null,
    organization: null,
    role: null,
    permissions: null,
    isLoading: false,
  };

  const mockSession: Omit<SessionState, 'isLoading'> = {
    user: {
      id: 'user_1',
      name: 'Test User',
      email: 'test@example.com',
    },
    organization: {
      id: 'org_1',
      name: 'Test Organization',
      slug: 'test-org',
    },
    role: 'admin',
    permissions: {
      organization: ['update'],
      member: ['create', 'update', 'delete'],
      invitation: ['create', 'cancel'],
      orders: ['read', 'create', 'update', 'delete'],
      metrics: ['read'],
    },
  };

  it('should return the initial state', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('setSession', () => {
    it('should set all session fields', () => {
      const state = reducer(initialState, setSession(mockSession));

      expect(state.user).toEqual(mockSession.user);
      expect(state.organization).toEqual(mockSession.organization);
      expect(state.role).toBe('admin');
      expect(state.permissions).toEqual(mockSession.permissions);
    });

    it('should not modify isLoading', () => {
      const loadingState = { ...initialState, isLoading: true };
      const state = reducer(loadingState, setSession(mockSession));

      expect(state.isLoading).toBe(true);
    });

    it('should handle session without organization', () => {
      const noOrgSession: Omit<SessionState, 'isLoading'> = {
        user: mockSession.user,
        organization: null,
        role: null,
        permissions: null,
      };
      const state = reducer(initialState, setSession(noOrgSession));

      expect(state.user).toEqual(mockSession.user);
      expect(state.organization).toBeNull();
      expect(state.role).toBeNull();
      expect(state.permissions).toBeNull();
    });
  });

  describe('setLoading', () => {
    it('should set isLoading to true', () => {
      const state = reducer(initialState, setLoading(true));
      expect(state.isLoading).toBe(true);
    });

    it('should set isLoading to false', () => {
      const loadingState = { ...initialState, isLoading: true };
      const state = reducer(loadingState, setLoading(false));
      expect(state.isLoading).toBe(false);
    });

    it('should not affect other state fields', () => {
      const stateWithSession = { ...initialState, ...mockSession, isLoading: false };
      const state = reducer(stateWithSession, setLoading(true));

      expect(state.user).toEqual(mockSession.user);
      expect(state.organization).toEqual(mockSession.organization);
      expect(state.isLoading).toBe(true);
    });
  });

  describe('clearSession', () => {
    it('should clear all session fields except isLoading', () => {
      const stateWithSession = { ...mockSession, isLoading: false };
      const state = reducer(stateWithSession, clearSession());

      expect(state.user).toBeNull();
      expect(state.organization).toBeNull();
      expect(state.role).toBeNull();
      expect(state.permissions).toBeNull();
      expect(state.isLoading).toBe(false);
    });

    it('should preserve isLoading state', () => {
      const stateWithSession = { ...mockSession, isLoading: true };
      const state = reducer(stateWithSession, clearSession());

      expect(state.isLoading).toBe(true);
    });
  });

  describe('hasPermission helper', () => {
    const stateWithPermissions: SessionState = {
      ...mockSession,
      isLoading: false,
    };

    it('should return true for granted permissions', () => {
      expect(hasPermission(stateWithPermissions, 'orders', 'read')).toBe(true);
      expect(hasPermission(stateWithPermissions, 'orders', 'create')).toBe(true);
      expect(hasPermission(stateWithPermissions, 'metrics', 'read')).toBe(true);
    });

    it('should return false for non-granted permissions', () => {
      expect(hasPermission(stateWithPermissions, 'metrics', 'create')).toBe(false);
      expect(hasPermission(stateWithPermissions, 'metrics', 'delete')).toBe(false);
    });

    it('should return false when permissions is null', () => {
      expect(hasPermission(initialState, 'orders', 'read')).toBe(false);
    });

    it('should return false for non-existent resource', () => {
      const stateWithLimitedPermissions: SessionState = {
        ...stateWithPermissions,
        permissions: {
          orders: ['read'],
        },
      };
      expect(hasPermission(stateWithLimitedPermissions, 'metrics', 'read')).toBe(false);
    });
  });

  describe('integration scenarios', () => {
    it('should handle login -> use -> logout flow', () => {
      // Start with no session
      let state = initialState;
      expect(state.user).toBeNull();

      // Login
      state = reducer(state, setLoading(true));
      expect(state.isLoading).toBe(true);

      state = reducer(state, setSession(mockSession));
      state = reducer(state, setLoading(false));

      expect(state.user).toEqual(mockSession.user);
      expect(state.isLoading).toBe(false);
      expect(hasPermission(state, 'orders', 'read')).toBe(true);

      // Logout
      state = reducer(state, setLoading(true));
      state = reducer(state, clearSession());
      state = reducer(state, setLoading(false));

      expect(state.user).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(hasPermission(state, 'orders', 'read')).toBe(false);
    });

    it('should handle organization switching', () => {
      let state = reducer(initialState, setSession(mockSession));

      // Switch organization
      const newOrgSession: Omit<SessionState, 'isLoading'> = {
        ...mockSession,
        organization: {
          id: 'org_2',
          name: 'Second Organization',
          slug: 'second-org',
        },
        role: 'member',
        permissions: {
          orders: ['read'],
          metrics: ['read'],
        },
      };

      state = reducer(state, setSession(newOrgSession));

      expect(state.organization?.id).toBe('org_2');
      expect(state.role).toBe('member');
      expect(hasPermission(state, 'orders', 'create')).toBe(false);
      expect(hasPermission(state, 'orders', 'read')).toBe(true);
    });
  });
});
