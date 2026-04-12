import reducer, { invitationsActions } from '../invitationsSlice';

const mockInvitations = [
  {
    id: 'inv_1',
    email: 'new@test.com',
    role: 'staff',
    status: 'pending',
    organizationId: 'hotel_1',
  },
];

describe('invitationsSlice', () => {
  const initialState = reducer(undefined, { type: '@@INIT' });

  it('returns correct initial state', () => {
    expect(initialState).toMatchObject({
      list: { status: 'idle', data: [], error: null },
      inviteStatus: 'idle',
      cancelStatus: 'idle',
      mutationError: null,
    });
  });

  describe('fetchInvitations', () => {
    it('sets loading', () => {
      expect(reducer(initialState, invitationsActions.fetchInvitationsRequest()).list.status).toBe(
        'loading'
      );
    });

    it('stores invitations on success', () => {
      const state = reducer(
        initialState,
        invitationsActions.fetchInvitationsSuccess(
          mockInvitations as unknown as Parameters<
            typeof invitationsActions.fetchInvitationsSuccess
          >[0]
        )
      );
      expect(state.list.status).toBe('succeeded');
      expect(state.list.data).toEqual(mockInvitations);
    });

    it('stores error on failure', () => {
      const state = reducer(initialState, invitationsActions.fetchInvitationsFailure('Error'));
      expect(state.list.status).toBe('failed');
    });
  });

  describe('invite', () => {
    it('sets loading', () => {
      expect(reducer(initialState, invitationsActions.inviteRequest()).inviteStatus).toBe(
        'loading'
      );
    });

    it('sets succeeded', () => {
      expect(reducer(initialState, invitationsActions.inviteSuccess()).inviteStatus).toBe(
        'succeeded'
      );
    });

    it('sets failed', () => {
      const state = reducer(initialState, invitationsActions.inviteFailure('Already invited'));
      expect(state.inviteStatus).toBe('failed');
      expect(state.mutationError).toBe('Already invited');
    });
  });

  describe('cancelInvitation', () => {
    it('sets loading', () => {
      expect(reducer(initialState, invitationsActions.cancelRequest()).cancelStatus).toBe(
        'loading'
      );
    });

    it('sets succeeded', () => {
      expect(reducer(initialState, invitationsActions.cancelSuccess()).cancelStatus).toBe(
        'succeeded'
      );
    });
  });
});
