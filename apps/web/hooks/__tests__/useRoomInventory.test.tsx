import { renderHook, act } from '@testing-library/react';
import { useRoomInventory, useInventoryMutations } from '../useRoomInventory';
import { createTestStore } from '@/__mocks__/redux/store';
import { Provider } from 'react-redux';
import { FETCH_INVENTORY, UPDATE_INVENTORY } from '@/lib/sagas/inventory/inventorySaga';

describe('useRoomInventory hooks', () => {
  describe('useRoomInventory', () => {
    it('dispatches FETCH_INVENTORY', () => {
      const store = createTestStore();
      jest.spyOn(store, 'dispatch');
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <Provider store={store}>{children}</Provider>
      );
      renderHook(() => useRoomInventory('h1', '2026-01-01', '2026-01-31'), { wrapper });
      expect(store.dispatch).toHaveBeenCalledWith({
        type: FETCH_INVENTORY,
        payload: {
          hotelId: 'h1',
          startDate: '2026-01-01',
          endDate: '2026-01-31',
          roomTypeId: undefined,
        },
      });
    });
  });

  describe('useInventoryMutations', () => {
    it('dispatches UPDATE_INVENTORY', async () => {
      const store = createTestStore();
      jest.spyOn(store, 'dispatch');
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <Provider store={store}>{children}</Provider>
      );
      const { result } = renderHook(() => useInventoryMutations(), { wrapper });

      const input = { hotelId: 'h1', updates: [] };
      await act(async () => {
        result.current.updateInventory.mutateAsync(input);
      });

      expect(store.dispatch).toHaveBeenCalledWith({
        type: UPDATE_INVENTORY,
        payload: {
          hotelId: 'h1',
          updates: [],
          resolve: expect.any(Function),
          reject: expect.any(Function),
        },
      });
    });
  });
});
