import reducer, { adminActions, type AdminUser, type AdminOrganization } from '../adminSlice';

const mockUsers: AdminUser[] = [
  { id: 'u1', name: 'Alice', email: 'alice@test.com', createdAt: '2024-01-01T00:00:00Z' },
  {
    id: 'u2',
    name: 'Bob',
    email: 'bob@test.com',
    banned: false,
    createdAt: '2024-02-01T00:00:00Z',
  },
];

const mockOrganizations: AdminOrganization[] = [
  { id: 'org_1', name: 'Grand Hotel', slug: 'grand-hotel' },
];

describe('adminSlice', () => {
  const initialState = reducer(undefined, { type: '@@INIT' });

  it('returns correct initial state', () => {
    expect(initialState).toMatchObject({
      users: { status: 'idle', data: { users: [], total: 0 }, error: null },
      user: { status: 'idle', data: null, error: null },
      organizations: { status: 'idle', data: [], error: null },
      memberships: { status: 'idle', data: [], error: null },
      toggleSuperAdminStatus: 'idle',
      addToOrgStatus: 'idle',
      updateRoleStatus: 'idle',
      removeFromOrgStatus: 'idle',
      mutationError: null,
    });
  });

  describe('fetchUsers', () => {
    it('sets loading', () => {
      expect(reducer(initialState, adminActions.fetchUsersRequest()).users.status).toBe('loading');
    });

    it('stores users on success', () => {
      const payload = { users: mockUsers, total: 2 };
      const state = reducer(initialState, adminActions.fetchUsersSuccess(payload));
      expect(state.users.status).toBe('succeeded');
      expect(state.users.data).toEqual(payload);
    });

    it('stores error on failure', () => {
      const state = reducer(initialState, adminActions.fetchUsersFailure('Forbidden'));
      expect(state.users.status).toBe('failed');
    });
  });

  describe('fetchOrganizations', () => {
    it('sets loading', () => {
      expect(
        reducer(initialState, adminActions.fetchOrganizationsRequest()).organizations.status
      ).toBe('loading');
    });

    it('stores organizations on success', () => {
      const state = reducer(
        initialState,
        adminActions.fetchOrganizationsSuccess(mockOrganizations)
      );
      expect(state.organizations.status).toBe('succeeded');
      expect(state.organizations.data).toEqual(mockOrganizations);
    });

    it('stores error on failure', () => {
      const state = reducer(initialState, adminActions.fetchOrganizationsFailure('Error'));
      expect(state.organizations.status).toBe('failed');
    });
  });

  describe('toggleSuperAdmin', () => {
    it('sets loading', () => {
      expect(
        reducer(initialState, adminActions.toggleSuperAdminRequest()).toggleSuperAdminStatus
      ).toBe('loading');
    });

    it('sets succeeded', () => {
      expect(
        reducer(initialState, adminActions.toggleSuperAdminSuccess()).toggleSuperAdminStatus
      ).toBe('succeeded');
    });

    it('sets failed with error', () => {
      const state = reducer(initialState, adminActions.toggleSuperAdminFailure('Forbidden'));
      expect(state.toggleSuperAdminStatus).toBe('failed');
      expect(state.mutationError).toBe('Forbidden');
    });
  });

  describe('addToOrg', () => {
    it('sets loading', () => {
      expect(reducer(initialState, adminActions.addToOrgRequest()).addToOrgStatus).toBe('loading');
    });

    it('sets succeeded', () => {
      expect(reducer(initialState, adminActions.addToOrgSuccess()).addToOrgStatus).toBe(
        'succeeded'
      );
    });
  });

  describe('updateRole', () => {
    it('sets loading', () => {
      expect(reducer(initialState, adminActions.updateRoleRequest()).updateRoleStatus).toBe(
        'loading'
      );
    });

    it('sets succeeded', () => {
      expect(reducer(initialState, adminActions.updateRoleSuccess()).updateRoleStatus).toBe(
        'succeeded'
      );
    });
  });

  describe('removeFromOrg', () => {
    it('sets loading', () => {
      expect(reducer(initialState, adminActions.removeFromOrgRequest()).removeFromOrgStatus).toBe(
        'loading'
      );
    });

    it('sets succeeded', () => {
      expect(reducer(initialState, adminActions.removeFromOrgSuccess()).removeFromOrgStatus).toBe(
        'succeeded'
      );
    });
  });

  describe('resetMutationStatus', () => {
    it('resets all mutation statuses and clears error', () => {
      let state = reducer(initialState, adminActions.toggleSuperAdminFailure('Error'));
      state = reducer(state, adminActions.resetMutationStatus());
      expect(state.toggleSuperAdminStatus).toBe('idle');
      expect(state.addToOrgStatus).toBe('idle');
      expect(state.updateRoleStatus).toBe('idle');
      expect(state.removeFromOrgStatus).toBe('idle');
      expect(state.mutationError).toBeNull();
    });
  });
});
