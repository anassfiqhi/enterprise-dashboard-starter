import reducer, { physicalRoomsActions } from '../physicalRoomsSlice';
import { mockPhysicalRooms } from '@/__mocks__/fixtures/inventory';

describe('physicalRoomsSlice', () => {
  const initialState = reducer(undefined, { type: '@@INIT' });

  it('returns correct initial state', () => {
    expect(initialState).toMatchObject({
      list: { status: 'idle', data: [], error: null },
      createStatus: 'idle',
      updateStatus: 'idle',
      deleteStatus: 'idle',
    });
  });

  describe('fetchPhysicalRooms', () => {
    it('sets loading', () => {
      expect(reducer(initialState, physicalRoomsActions.fetchRequest()).list.status).toBe(
        'loading'
      );
    });

    it('stores rooms on success', () => {
      const state = reducer(initialState, physicalRoomsActions.fetchSuccess(mockPhysicalRooms));
      expect(state.list.status).toBe('succeeded');
      expect(state.list.data).toEqual(mockPhysicalRooms);
    });

    it('stores error on failure', () => {
      const state = reducer(initialState, physicalRoomsActions.fetchFailure('Error'));
      expect(state.list.status).toBe('failed');
    });
  });

  describe('createPhysicalRoom', () => {
    it('sets loading', () => {
      expect(reducer(initialState, physicalRoomsActions.createRequest()).createStatus).toBe(
        'loading'
      );
    });

    it('sets succeeded', () => {
      expect(reducer(initialState, physicalRoomsActions.createSuccess()).createStatus).toBe(
        'succeeded'
      );
    });

    it('sets failed', () => {
      const state = reducer(initialState, physicalRoomsActions.createFailure('Error'));
      expect(state.createStatus).toBe('failed');
    });
  });

  describe('deletePhysicalRoom', () => {
    it('sets loading', () => {
      expect(reducer(initialState, physicalRoomsActions.deleteRequest()).deleteStatus).toBe(
        'loading'
      );
    });

    it('sets succeeded', () => {
      expect(reducer(initialState, physicalRoomsActions.deleteSuccess()).deleteStatus).toBe(
        'succeeded'
      );
    });
  });
});
