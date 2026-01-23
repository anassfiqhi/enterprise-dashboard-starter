import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePermissions } from '../usePermissions';
import { createReduxWrapper } from '@/test/test-utils';
import { mockAdminPermissions, mockMemberPermissions } from '@/test/mocks/fixtures';

describe('usePermissions', () => {
  describe('with admin permissions', () => {
    const { Wrapper } = createReduxWrapper({
      session: {
        user: { id: 'user_1', name: 'Admin', email: 'admin@example.com' },
        organization: { id: 'org_1', name: 'Test Org', slug: 'test-org' },
        role: 'admin',
        permissions: mockAdminPermissions,
        isLoading: false,
      },
    });

    it('returns permissions from Redux state', () => {
      const { result } = renderHook(() => usePermissions(), { wrapper: Wrapper });
      expect(result.current.permissions).toEqual(mockAdminPermissions);
    });

    it('returns role from Redux state', () => {
      const { result } = renderHook(() => usePermissions(), { wrapper: Wrapper });
      expect(result.current.role).toBe('admin');
    });

    it('returns organization from Redux state', () => {
      const { result } = renderHook(() => usePermissions(), { wrapper: Wrapper });
      expect(result.current.organization).toEqual({ id: 'org_1', name: 'Test Org', slug: 'test-org' });
    });

    describe('hasPermission', () => {
      it('returns true for granted permissions', () => {
        const { result } = renderHook(() => usePermissions(), { wrapper: Wrapper });
        expect(result.current.hasPermission('orders', 'read')).toBe(true);
        expect(result.current.hasPermission('orders', 'create')).toBe(true);
        expect(result.current.hasPermission('orders', 'update')).toBe(true);
        expect(result.current.hasPermission('orders', 'delete')).toBe(true);
        expect(result.current.hasPermission('metrics', 'read')).toBe(true);
      });

      it('returns false for non-granted permissions', () => {
        const { result } = renderHook(() => usePermissions(), { wrapper: Wrapper });
        expect(result.current.hasPermission('metrics', 'create')).toBe(false);
        expect(result.current.hasPermission('metrics', 'delete')).toBe(false);
      });
    });

    describe('hasAllPermissions', () => {
      it('returns true when user has all specified permissions', () => {
        const { result } = renderHook(() => usePermissions(), { wrapper: Wrapper });
        expect(result.current.hasAllPermissions([
          { resource: 'orders', action: 'read' },
          { resource: 'orders', action: 'create' },
        ])).toBe(true);
      });

      it('returns false when user is missing any permission', () => {
        const { result } = renderHook(() => usePermissions(), { wrapper: Wrapper });
        expect(result.current.hasAllPermissions([
          { resource: 'orders', action: 'read' },
          { resource: 'metrics', action: 'delete' },
        ])).toBe(false);
      });
    });

    describe('hasAnyPermission', () => {
      it('returns true when user has any of the specified permissions', () => {
        const { result } = renderHook(() => usePermissions(), { wrapper: Wrapper });
        expect(result.current.hasAnyPermission([
          { resource: 'metrics', action: 'delete' },
          { resource: 'orders', action: 'read' },
        ])).toBe(true);
      });

      it('returns false when user has none of the specified permissions', () => {
        const { result } = renderHook(() => usePermissions(), { wrapper: Wrapper });
        expect(result.current.hasAnyPermission([
          { resource: 'metrics', action: 'delete' },
          { resource: 'metrics', action: 'create' },
        ])).toBe(false);
      });
    });

    describe('hasRole', () => {
      it('returns true for matching role', () => {
        const { result } = renderHook(() => usePermissions(), { wrapper: Wrapper });
        expect(result.current.hasRole('admin')).toBe(true);
      });

      it('returns false for non-matching role', () => {
        const { result } = renderHook(() => usePermissions(), { wrapper: Wrapper });
        expect(result.current.hasRole('owner')).toBe(false);
        expect(result.current.hasRole('member')).toBe(false);
      });
    });

    describe('hasAnyRole', () => {
      it('returns true when user has any of the specified roles', () => {
        const { result } = renderHook(() => usePermissions(), { wrapper: Wrapper });
        expect(result.current.hasAnyRole('admin', 'owner')).toBe(true);
        expect(result.current.hasAnyRole('member', 'admin')).toBe(true);
      });

      it('returns false when user has none of the specified roles', () => {
        const { result } = renderHook(() => usePermissions(), { wrapper: Wrapper });
        expect(result.current.hasAnyRole('owner', 'member')).toBe(false);
      });
    });
  });

  describe('with member permissions', () => {
    const { Wrapper } = createReduxWrapper({
      session: {
        user: { id: 'user_2', name: 'Member', email: 'member@example.com' },
        organization: { id: 'org_1', name: 'Test Org', slug: 'test-org' },
        role: 'member',
        permissions: mockMemberPermissions,
        isLoading: false,
      },
    });

    it('has limited permissions', () => {
      const { result } = renderHook(() => usePermissions(), { wrapper: Wrapper });
      expect(result.current.hasPermission('orders', 'read')).toBe(true);
      expect(result.current.hasPermission('orders', 'create')).toBe(false);
      expect(result.current.hasPermission('orders', 'update')).toBe(false);
      expect(result.current.hasPermission('orders', 'delete')).toBe(false);
    });

    it('has member role', () => {
      const { result } = renderHook(() => usePermissions(), { wrapper: Wrapper });
      expect(result.current.hasRole('member')).toBe(true);
      expect(result.current.hasRole('admin')).toBe(false);
    });
  });

  describe('with no session', () => {
    const { Wrapper } = createReduxWrapper({
      session: {
        user: null,
        organization: null,
        role: null,
        permissions: null,
        isLoading: false,
      },
    });

    it('returns false for all permission checks', () => {
      const { result } = renderHook(() => usePermissions(), { wrapper: Wrapper });
      expect(result.current.hasPermission('orders', 'read')).toBe(false);
      expect(result.current.hasAllPermissions([{ resource: 'orders', action: 'read' }])).toBe(false);
      expect(result.current.hasAnyPermission([{ resource: 'orders', action: 'read' }])).toBe(false);
    });

    it('returns false for all role checks', () => {
      const { result } = renderHook(() => usePermissions(), { wrapper: Wrapper });
      expect(result.current.hasRole('admin')).toBe(false);
      expect(result.current.hasAnyRole('admin', 'member', 'owner')).toBe(false);
    });

    it('returns null for permissions and role', () => {
      const { result } = renderHook(() => usePermissions(), { wrapper: Wrapper });
      expect(result.current.permissions).toBeNull();
      expect(result.current.role).toBeNull();
      expect(result.current.organization).toBeNull();
    });
  });
});
