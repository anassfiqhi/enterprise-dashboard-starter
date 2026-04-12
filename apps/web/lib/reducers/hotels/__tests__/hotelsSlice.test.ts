import reducer, { hotelsActions } from '../hotelsSlice';
import { mockHotels, mockHotelDetail } from '@/__mocks__/fixtures/hotels';

describe('hotelsSlice', () => {
  const initialState = reducer(undefined, { type: '@@INIT' });

  it('returns correct initial state', () => {
    expect(initialState).toMatchObject({
      list: { status: 'idle', data: [], error: null },
      detail: { status: 'idle', data: null, error: null },
      createHotelStatus: 'idle',
      updateHotelStatus: 'idle',
      deleteHotelStatus: 'idle',
      createRoomTypeStatus: 'idle',
      updateRoomTypeStatus: 'idle',
      deleteRoomTypeStatus: 'idle',
      createActivityTypeStatus: 'idle',
      updateActivityTypeStatus: 'idle',
      deleteActivityTypeStatus: 'idle',
      mutationError: null,
    });
  });

  // ─── List ─────────────────────────────────────────────────────────────────

  describe('fetchHotels', () => {
    it('sets list.status to loading on request', () => {
      const state = reducer(initialState, hotelsActions.fetchHotelsRequest());
      expect(state.list.status).toBe('loading');
      expect(state.list.error).toBeNull();
    });

    it('stores hotels on success', () => {
      const state = reducer(initialState, hotelsActions.fetchHotelsSuccess(mockHotels));
      expect(state.list.status).toBe('succeeded');
      expect(state.list.data).toEqual(mockHotels);
      expect(state.list.error).toBeNull();
    });

    it('stores error on failure', () => {
      const state = reducer(initialState, hotelsActions.fetchHotelsFailure('Network error'));
      expect(state.list.status).toBe('failed');
      expect(state.list.error).toBe('Network error');
    });
  });

  // ─── Detail ───────────────────────────────────────────────────────────────

  describe('fetchHotel', () => {
    it('sets detail.status to loading on request', () => {
      const state = reducer(initialState, hotelsActions.fetchHotelRequest());
      expect(state.detail.status).toBe('loading');
    });

    it('stores detail on success', () => {
      const state = reducer(initialState, hotelsActions.fetchHotelSuccess(mockHotelDetail));
      expect(state.detail.status).toBe('succeeded');
      expect(state.detail.data).toEqual(mockHotelDetail);
    });

    it('stores error on failure', () => {
      const state = reducer(initialState, hotelsActions.fetchHotelFailure('Not found'));
      expect(state.detail.status).toBe('failed');
      expect(state.detail.error).toBe('Not found');
    });
  });

  // ─── Create Hotel ─────────────────────────────────────────────────────────

  describe('createHotel', () => {
    it('sets createHotelStatus to loading', () => {
      expect(reducer(initialState, hotelsActions.createHotelRequest()).createHotelStatus).toBe(
        'loading'
      );
    });

    it('sets createHotelStatus to succeeded', () => {
      expect(reducer(initialState, hotelsActions.createHotelSuccess()).createHotelStatus).toBe(
        'succeeded'
      );
    });

    it('sets createHotelStatus to failed with error', () => {
      const state = reducer(initialState, hotelsActions.createHotelFailure('Already exists'));
      expect(state.createHotelStatus).toBe('failed');
      expect(state.mutationError).toBe('Already exists');
    });
  });

  // ─── Update Hotel ─────────────────────────────────────────────────────────

  describe('updateHotel', () => {
    it('sets updateHotelStatus to loading', () => {
      expect(reducer(initialState, hotelsActions.updateHotelRequest()).updateHotelStatus).toBe(
        'loading'
      );
    });

    it('sets updateHotelStatus to succeeded', () => {
      expect(reducer(initialState, hotelsActions.updateHotelSuccess()).updateHotelStatus).toBe(
        'succeeded'
      );
    });

    it('sets updateHotelStatus to failed', () => {
      const state = reducer(initialState, hotelsActions.updateHotelFailure('Forbidden'));
      expect(state.updateHotelStatus).toBe('failed');
      expect(state.mutationError).toBe('Forbidden');
    });
  });

  // ─── Delete Hotel ─────────────────────────────────────────────────────────

  describe('deleteHotel', () => {
    it('sets deleteHotelStatus to loading', () => {
      expect(reducer(initialState, hotelsActions.deleteHotelRequest()).deleteHotelStatus).toBe(
        'loading'
      );
    });

    it('sets deleteHotelStatus to succeeded', () => {
      expect(reducer(initialState, hotelsActions.deleteHotelSuccess()).deleteHotelStatus).toBe(
        'succeeded'
      );
    });

    it('sets deleteHotelStatus to failed', () => {
      const state = reducer(initialState, hotelsActions.deleteHotelFailure('Cannot delete'));
      expect(state.deleteHotelStatus).toBe('failed');
    });
  });

  // ─── Room Type mutations ───────────────────────────────────────────────────

  describe('createRoomType', () => {
    it('sets createRoomTypeStatus to loading', () => {
      expect(
        reducer(initialState, hotelsActions.createRoomTypeRequest()).createRoomTypeStatus
      ).toBe('loading');
    });

    it('sets createRoomTypeStatus to succeeded', () => {
      expect(
        reducer(initialState, hotelsActions.createRoomTypeSuccess()).createRoomTypeStatus
      ).toBe('succeeded');
    });

    it('sets createRoomTypeStatus to failed', () => {
      expect(
        reducer(initialState, hotelsActions.createRoomTypeFailure('Error')).createRoomTypeStatus
      ).toBe('failed');
    });
  });

  describe('updateRoomType', () => {
    it('sets updateRoomTypeStatus to loading', () => {
      expect(
        reducer(initialState, hotelsActions.updateRoomTypeRequest()).updateRoomTypeStatus
      ).toBe('loading');
    });

    it('sets updateRoomTypeStatus to succeeded', () => {
      expect(
        reducer(initialState, hotelsActions.updateRoomTypeSuccess()).updateRoomTypeStatus
      ).toBe('succeeded');
    });
  });

  describe('deleteRoomType', () => {
    it('sets deleteRoomTypeStatus to loading', () => {
      expect(
        reducer(initialState, hotelsActions.deleteRoomTypeRequest()).deleteRoomTypeStatus
      ).toBe('loading');
    });

    it('sets deleteRoomTypeStatus to succeeded', () => {
      expect(
        reducer(initialState, hotelsActions.deleteRoomTypeSuccess()).deleteRoomTypeStatus
      ).toBe('succeeded');
    });
  });

  // ─── Activity Type mutations ───────────────────────────────────────────────

  describe('createActivityType', () => {
    it('sets createActivityTypeStatus to loading', () => {
      expect(
        reducer(initialState, hotelsActions.createActivityTypeRequest()).createActivityTypeStatus
      ).toBe('loading');
    });

    it('sets createActivityTypeStatus to succeeded', () => {
      expect(
        reducer(initialState, hotelsActions.createActivityTypeSuccess()).createActivityTypeStatus
      ).toBe('succeeded');
    });
  });

  describe('deleteActivityType', () => {
    it('sets deleteActivityTypeStatus to loading', () => {
      expect(
        reducer(initialState, hotelsActions.deleteActivityTypeRequest()).deleteActivityTypeStatus
      ).toBe('loading');
    });
  });

  // ─── Reset ────────────────────────────────────────────────────────────────

  describe('resetMutationStatus', () => {
    it('resets all mutation statuses to idle', () => {
      const withErrors = {
        ...initialState,
        createHotelStatus: 'failed' as const,
        updateHotelStatus: 'succeeded' as const,
        deleteHotelStatus: 'loading' as const,
        mutationError: 'some error',
      };
      const state = reducer(withErrors, hotelsActions.resetMutationStatus());
      expect(state.createHotelStatus).toBe('idle');
      expect(state.updateHotelStatus).toBe('idle');
      expect(state.deleteHotelStatus).toBe('idle');
      expect(state.mutationError).toBeNull();
    });
  });
});
