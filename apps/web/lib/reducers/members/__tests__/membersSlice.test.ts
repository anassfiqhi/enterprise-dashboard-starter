import reducer, { membersActions } from '../membersSlice';

const mockMembers = [
  {
    id: 'm1',
    userId: 'user_1',
    role: 'admin',
    user: { id: 'user_1', name: 'Alice', email: 'alice@test.com' },
  },
  {
    id: 'm2',
    userId: 'user_2',
    role: 'staff',
    user: { id: 'user_2', name: 'Bob', email: 'bob@test.com' },
  },
];

describe('membersSlice', () => {
  const initialState = reducer(undefined, { type: '@@INIT' });

  it('returns correct initial state', () => {
    expect(initialState).toMatchObject({
      list: { status: 'idle', data: [], error: null },
      updateRoleStatus: 'idle',
      removeStatus: 'idle',
      mutationError: null,
    });
  });

  describe('fetchMembers', () => {
    it('sets loading', () => {
      expect(reducer(initialState, membersActions.fetchMembersRequest()).list.status).toBe(
        'loading'
      );
    });

    it('stores members on success', () => {
      const state = reducer(
        initialState,
        membersActions.fetchMembersSuccess(
          mockMembers as unknown as Parameters<typeof membersActions.fetchMembersSuccess>[0]
        )
      );
      expect(state.list.status).toBe('succeeded');
      expect(state.list.data).toEqual(mockMembers);
    });

    it('stores error on failure', () => {
      const state = reducer(initialState, membersActions.fetchMembersFailure('Error'));
      expect(state.list.status).toBe('failed');
    });
  });

  describe('updateRole', () => {
    it('sets loading', () => {
      expect(reducer(initialState, membersActions.updateRoleRequest()).updateRoleStatus).toBe(
        'loading'
      );
    });

    it('sets succeeded', () => {
      expect(reducer(initialState, membersActions.updateRoleSuccess()).updateRoleStatus).toBe(
        'succeeded'
      );
    });

    it('sets failed', () => {
      const state = reducer(initialState, membersActions.updateRoleFailure('Forbidden'));
      expect(state.updateRoleStatus).toBe('failed');
      expect(state.mutationError).toBe('Forbidden');
    });
  });

  describe('removeMember', () => {
    it('sets loading', () => {
      expect(reducer(initialState, membersActions.removeRequest()).removeStatus).toBe('loading');
    });

    it('sets succeeded', () => {
      expect(reducer(initialState, membersActions.removeSuccess()).removeStatus).toBe('succeeded');
    });
  });
});
