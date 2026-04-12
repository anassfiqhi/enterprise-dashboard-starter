import reducer, { guestsActions } from '../guestsSlice';
import { mockGuests } from '@/__mocks__/fixtures/guests';

describe('guestsSlice', () => {
  const initialState = reducer(undefined, { type: '@@INIT' });

  it('returns correct initial state', () => {
    expect(initialState).toMatchObject({
      list: { status: 'idle', data: { items: [], meta: null }, error: null },
      detail: { status: 'idle', data: null, error: null },
      createStatus: 'idle',
      updateStatus: 'idle',
      deleteStatus: 'idle',
      mutationError: null,
    });
  });

  describe('fetchGuests', () => {
    it('sets loading', () => {
      expect(reducer(initialState, guestsActions.fetchGuestsRequest()).list.status).toBe('loading');
    });

    it('stores guests on success', () => {
      const meta = {
        requestId: '1',
        total: mockGuests.length,
        page: 1,
        pageSize: 20,
        totalPages: 1,
      };
      const state = reducer(
        initialState,
        guestsActions.fetchGuestsSuccess({ items: mockGuests, meta })
      );
      expect(state.list.status).toBe('succeeded');
      expect(state.list.data.items).toEqual(mockGuests);
    });

    it('stores error on failure', () => {
      const state = reducer(initialState, guestsActions.fetchGuestsFailure('Server error'));
      expect(state.list.status).toBe('failed');
      expect(state.list.error).toBe('Server error');
    });
  });

  describe('fetchGuest', () => {
    it('sets loading on request', () => {
      expect(reducer(initialState, guestsActions.fetchGuestRequest()).detail.status).toBe(
        'loading'
      );
    });

    it('stores guest detail on success', () => {
      const guestDetail = { ...mockGuests[0], reservations: [] };
      const state = reducer(
        initialState,
        guestsActions.fetchGuestSuccess(
          guestDetail as unknown as Parameters<typeof guestsActions.fetchGuestSuccess>[0]
        )
      );
      expect(state.detail.status).toBe('succeeded');
    });

    it('stores error on failure', () => {
      const state = reducer(initialState, guestsActions.fetchGuestFailure('Not found'));
      expect(state.detail.status).toBe('failed');
    });
  });

  describe('createGuest', () => {
    it('sets loading', () => {
      expect(reducer(initialState, guestsActions.createGuestRequest()).createStatus).toBe(
        'loading'
      );
    });

    it('sets succeeded', () => {
      expect(reducer(initialState, guestsActions.createGuestSuccess()).createStatus).toBe(
        'succeeded'
      );
    });

    it('sets failed with error', () => {
      const state = reducer(initialState, guestsActions.createGuestFailure('Duplicate email'));
      expect(state.createStatus).toBe('failed');
      expect(state.mutationError).toBe('Duplicate email');
    });
  });

  describe('deleteGuest', () => {
    it('sets loading', () => {
      expect(reducer(initialState, guestsActions.deleteGuestRequest()).deleteStatus).toBe(
        'loading'
      );
    });

    it('sets succeeded', () => {
      expect(reducer(initialState, guestsActions.deleteGuestSuccess()).deleteStatus).toBe(
        'succeeded'
      );
    });
  });

  describe('resetMutationStatus', () => {
    it('resets all mutation statuses', () => {
      const withMutations = {
        ...initialState,
        createStatus: 'succeeded' as const,
        mutationError: 'err',
      };
      const state = reducer(withMutations, guestsActions.resetMutationStatus());
      expect(state.createStatus).toBe('idle');
      expect(state.mutationError).toBeNull();
    });
  });
});
