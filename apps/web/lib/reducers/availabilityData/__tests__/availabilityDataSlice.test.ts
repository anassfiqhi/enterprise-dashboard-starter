import reducer, { availabilityDataActions } from '../availabilityDataSlice';
import { generateRoomAvailability } from '@/__mocks__/fixtures/inventory';

describe('availabilityDataSlice', () => {
  const initialState = reducer(undefined, { type: '@@INIT' });

  it('returns correct initial state', () => {
    expect(initialState).toMatchObject({
      status: 'idle',
      data: { items: [], meta: null },
      error: null,
    });
  });

  describe('fetchAvailabilityData', () => {
    it('sets loading', () => {
      expect(reducer(initialState, availabilityDataActions.fetchRequest()).status).toBe('loading');
    });

    it('stores data on success', () => {
      const payload = {
        items: generateRoomAvailability('hotel_1', '2026-04-10'),
        meta: { total: 3 },
      };
      const state = reducer(initialState, availabilityDataActions.fetchSuccess(payload));
      expect(state.status).toBe('succeeded');
      expect(state.data).toEqual(payload);
    });

    it('stores error on failure', () => {
      const state = reducer(initialState, availabilityDataActions.fetchFailure('Not found'));
      expect(state.status).toBe('failed');
      expect(state.error).toBe('Not found');
    });
  });
});
