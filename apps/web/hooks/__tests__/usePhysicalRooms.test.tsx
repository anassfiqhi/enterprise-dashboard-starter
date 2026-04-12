import { renderHook, act } from '@testing-library/react';
import { usePhysicalRooms, usePhysicalRoomMutations } from '../usePhysicalRooms';
import { createTestStore } from '@/__mocks__/redux/store';
import { Provider } from 'react-redux';
import {
  FETCH_PHYSICAL_ROOMS,
  CREATE_PHYSICAL_ROOM,
} from '@/lib/sagas/physicalRooms/physicalRoomsSaga';

describe('usePhysicalRooms hooks', () => {
  describe('usePhysicalRooms', () => {
    it('dispatches FETCH_PHYSICAL_ROOMS', () => {
      const store = createTestStore();
      jest.spyOn(store, 'dispatch');
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <Provider store={store}>{children}</Provider>
      );
      renderHook(() => usePhysicalRooms('h1', 'rt1'), { wrapper });
      expect(store.dispatch).toHaveBeenCalledWith({
        type: FETCH_PHYSICAL_ROOMS,
        payload: { hotelId: 'h1', roomTypeId: 'rt1' },
      });
    });
  });

  describe('usePhysicalRoomMutations', () => {
    it('dispatches CREATE_PHYSICAL_ROOM', async () => {
      const store = createTestStore();
      jest.spyOn(store, 'dispatch');
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <Provider store={store}>{children}</Provider>
      );
      const { result } = renderHook(() => usePhysicalRoomMutations(), { wrapper });

      const input = { hotelId: 'h1', roomTypeId: 'rt1', code: '101' };
      await act(async () => {
        result.current.createPhysicalRoom.mutateAsync(input);
      });

      expect(store.dispatch).toHaveBeenCalledWith({
        type: CREATE_PHYSICAL_ROOM,
        payload: {
          hotelId: 'h1',
          roomTypeId: 'rt1',
          body: { code: '101' },
          resolve: expect.any(Function),
          reject: expect.any(Function),
        },
      });
    });
  });
});
