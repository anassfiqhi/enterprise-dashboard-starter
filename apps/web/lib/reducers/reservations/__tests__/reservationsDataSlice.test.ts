import reducer, { reservationsDataActions } from '../reservationsDataSlice';
import { mockReservations } from '@/__mocks__/fixtures/reservations';

const mockReservationsPage = {
  items: mockReservations,
  meta: {
    requestId: 'req_1',
    total: mockReservations.length,
    page: 1,
    pageSize: 20,
    totalPages: 1,
  },
};

describe('reservationsDataSlice', () => {
  const initialState = reducer(undefined, { type: '@@INIT' });

  it('returns correct initial state', () => {
    expect(initialState).toMatchObject({
      list: { status: 'idle', error: null },
      detail: { status: 'idle', data: null, error: null },
      createStatus: 'idle',
      cancelStatus: 'idle',
      updateStatusStatus: 'idle',
      refundStatus: 'idle',
      mutationError: null,
    });
  });

  describe('fetchReservations', () => {
    it('sets loading', () => {
      expect(
        reducer(initialState, reservationsDataActions.fetchReservationsRequest()).list.status
      ).toBe('loading');
    });

    it('stores reservations on success', () => {
      const state = reducer(
        initialState,
        reservationsDataActions.fetchReservationsSuccess(mockReservationsPage)
      );
      expect(state.list.status).toBe('succeeded');
    });

    it('stores error on failure', () => {
      const state = reducer(
        initialState,
        reservationsDataActions.fetchReservationsFailure('Error')
      );
      expect(state.list.status).toBe('failed');
      expect(state.list.error).toBe('Error');
    });
  });

  describe('fetchReservation', () => {
    it('sets loading', () => {
      expect(
        reducer(initialState, reservationsDataActions.fetchReservationRequest()).detail.status
      ).toBe('loading');
    });

    it('stores reservation detail on success', () => {
      const detail = { ...mockReservations[0], payments: [] };
      const state = reducer(
        initialState,
        reservationsDataActions.fetchReservationSuccess(
          detail as unknown as Parameters<typeof reservationsDataActions.fetchReservationSuccess>[0]
        )
      );
      expect(state.detail.status).toBe('succeeded');
      expect(state.detail.data).toEqual(detail);
    });
  });

  describe('createReservation', () => {
    it('sets loading', () => {
      expect(
        reducer(initialState, reservationsDataActions.createReservationRequest()).createStatus
      ).toBe('loading');
    });

    it('sets succeeded', () => {
      expect(
        reducer(initialState, reservationsDataActions.createReservationSuccess()).createStatus
      ).toBe('succeeded');
    });

    it('sets failed with error', () => {
      const state = reducer(
        initialState,
        reservationsDataActions.createReservationFailure('Conflict')
      );
      expect(state.createStatus).toBe('failed');
      expect(state.mutationError).toBe('Conflict');
    });
  });

  describe('cancelReservation', () => {
    it('sets loading', () => {
      expect(
        reducer(initialState, reservationsDataActions.cancelReservationRequest()).cancelStatus
      ).toBe('loading');
    });

    it('sets succeeded', () => {
      expect(
        reducer(initialState, reservationsDataActions.cancelReservationSuccess()).cancelStatus
      ).toBe('succeeded');
    });
  });

  describe('patchReservationDetail', () => {
    it('updates detail data when detail is loaded', () => {
      const detailState = {
        ...initialState,
        detail: {
          status: 'succeeded' as const,
          data: { ...mockReservations[0], payments: [] } as unknown as Parameters<
            typeof reservationsDataActions.fetchReservationSuccess
          >[0],
          error: null,
        },
      };
      const state = reducer(
        detailState,
        reservationsDataActions.patchReservationDetail({
          id: 'res_1',
          patch: { status: 'CANCELLED' },
        })
      );
      expect((state.detail.data as Record<string, unknown>)?.status).toBe('CANCELLED');
    });

    it('does nothing when detail is null', () => {
      const state = reducer(
        initialState,
        reservationsDataActions.patchReservationDetail({
          id: 'res_1',
          patch: { status: 'CANCELLED' },
        })
      );
      expect(state.detail.data).toBeNull();
    });
  });

  describe('resetMutationStatus', () => {
    it('resets all statuses to idle', () => {
      const withMutations = {
        ...initialState,
        createStatus: 'succeeded' as const,
        mutationError: 'err',
      };
      const state = reducer(withMutations, reservationsDataActions.resetMutationStatus());
      expect(state.createStatus).toBe('idle');
      expect(state.mutationError).toBeNull();
    });
  });
});
