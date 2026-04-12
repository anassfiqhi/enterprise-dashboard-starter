import reducer, { inventoryActions } from '../inventorySlice';
import { mockRoomInventory } from '@/__mocks__/fixtures/inventory';

describe('inventorySlice', () => {
  const initialState = reducer(undefined, { type: '@@INIT' });

  it('returns correct initial state', () => {
    expect(initialState).toMatchObject({
      list: { status: 'idle', data: [], error: null },
      updateStatus: 'idle',
    });
  });

  describe('fetchInventory', () => {
    it('sets loading', () => {
      expect(reducer(initialState, inventoryActions.fetchRequest()).list.status).toBe('loading');
    });

    it('stores inventory on success', () => {
      const state = reducer(initialState, inventoryActions.fetchSuccess(mockRoomInventory));
      expect(state.list.status).toBe('succeeded');
      expect(state.list.data).toEqual(mockRoomInventory);
    });

    it('stores error on failure', () => {
      const state = reducer(initialState, inventoryActions.fetchFailure('Error'));
      expect(state.list.status).toBe('failed');
    });
  });

  describe('updateInventory', () => {
    it('sets loading', () => {
      expect(reducer(initialState, inventoryActions.updateRequest()).updateStatus).toBe('loading');
    });

    it('sets succeeded', () => {
      expect(reducer(initialState, inventoryActions.updateSuccess()).updateStatus).toBe(
        'succeeded'
      );
    });

    it('sets failed', () => {
      const state = reducer(initialState, inventoryActions.updateFailure('Error'));
      expect(state.updateStatus).toBe('failed');
    });
  });
});
