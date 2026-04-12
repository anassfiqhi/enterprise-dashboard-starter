import { renderHook, act } from '@testing-library/react';
import { useHotelMutations } from '../useHotelMutations';
import { createTestStore } from '@/__mocks__/redux/store';
import { Provider } from 'react-redux';
import { CREATE_HOTEL, UPDATE_HOTEL, DELETE_HOTEL } from '@/lib/sagas/hotels/hotelsSaga';

describe('useHotelMutations', () => {
  it('dispatches CREATE_HOTEL', async () => {
    const store = createTestStore();
    jest.spyOn(store, 'dispatch');
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    const { result } = renderHook(() => useHotelMutations(), { wrapper });

    const input = { name: 'H1', timezone: 'UTC' };
    await act(async () => {
      result.current.createHotel.mutateAsync(input);
    });

    expect(store.dispatch).toHaveBeenCalledWith({
      type: CREATE_HOTEL,
      payload: { input, resolve: expect.any(Function), reject: expect.any(Function) },
    });
  });

  it('dispatches UPDATE_HOTEL', async () => {
    const store = createTestStore();
    jest.spyOn(store, 'dispatch');
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    const { result } = renderHook(() => useHotelMutations(), { wrapper });

    const input = { id: 'h1', name: 'H2' };
    await act(async () => {
      result.current.updateHotel.mutateAsync(input);
    });

    expect(store.dispatch).toHaveBeenCalledWith({
      type: UPDATE_HOTEL,
      payload: {
        id: 'h1',
        input: { name: 'H2' },
        resolve: expect.any(Function),
        reject: expect.any(Function),
      },
    });
  });

  it('dispatches DELETE_HOTEL', async () => {
    const store = createTestStore();
    jest.spyOn(store, 'dispatch');
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    const { result } = renderHook(() => useHotelMutations(), { wrapper });

    await act(async () => {
      result.current.deleteHotel.mutateAsync('h1');
    });

    expect(store.dispatch).toHaveBeenCalledWith({
      type: DELETE_HOTEL,
      payload: { hotelId: 'h1', resolve: expect.any(Function), reject: expect.any(Function) },
    });
  });
});
