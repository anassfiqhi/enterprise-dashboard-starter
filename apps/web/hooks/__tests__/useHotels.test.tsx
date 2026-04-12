import { renderHook } from '@testing-library/react';
import { useHotels } from '../useHotels';
import { createTestStore } from '@/__mocks__/redux/store';
import { Provider } from 'react-redux';
import { FETCH_HOTELS } from '@/lib/sagas/hotels/hotelsSaga';
import { mockHotels } from '@/__mocks__/fixtures/hotels';

describe('useHotels hook', () => {
  it('dispatches FETCH_HOTELS and defaults to idle/loading', () => {
    const store = createTestStore();
    jest.spyOn(store, 'dispatch');

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    const { result } = renderHook(() => useHotels(), { wrapper });

    expect(store.dispatch).toHaveBeenCalledWith({
      type: FETCH_HOTELS,
      payload: { search: undefined },
    });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toEqual([]);
  });

  it('selects loaded data from state', () => {
    const store = createTestStore({
      hotels: {
        list: { status: 'succeeded', data: mockHotels, error: null },
        detail: { status: 'idle', data: null, error: null },
      },
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    const { result } = renderHook(() => useHotels(), { wrapper });

    expect(result.current.isSuccess).toBe(true);
    expect(result.current.data).toEqual(mockHotels);
  });

  it('provides a refetch function', () => {
    const store = createTestStore();
    const dispatchSpy = jest.spyOn(store, 'dispatch');

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    const { result } = renderHook(() => useHotels('query'), { wrapper });

    // Initial call on mount
    expect(dispatchSpy).toHaveBeenCalledWith({ type: FETCH_HOTELS, payload: { search: 'query' } });
    dispatchSpy.mockClear();

    result.current.refetch();
    expect(dispatchSpy).toHaveBeenCalledWith({ type: FETCH_HOTELS, payload: { search: 'query' } });
  });
});
