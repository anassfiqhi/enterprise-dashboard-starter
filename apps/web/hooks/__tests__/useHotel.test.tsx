import { renderHook } from '@testing-library/react';
import { useHotel } from '../useHotel';
import { createTestStore } from '@/__mocks__/redux/store';
import { Provider } from 'react-redux';
import { FETCH_HOTEL } from '@/lib/sagas/hotels/hotelsSaga';
import { mockHotels } from '@/__mocks__/fixtures/hotels';

describe('useHotel hook', () => {
  it('does not dispatch if hotelId is undefined', () => {
    const store = createTestStore();
    jest.spyOn(store, 'dispatch');
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    renderHook(() => useHotel(undefined), { wrapper });
    expect(store.dispatch).not.toHaveBeenCalled();
  });

  it('dispatches FETCH_HOTEL on mount with valid id', () => {
    const store = createTestStore();
    jest.spyOn(store, 'dispatch');
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    renderHook(() => useHotel('h1'), { wrapper });
    expect(store.dispatch).toHaveBeenCalledWith({ type: FETCH_HOTEL, payload: { hotelId: 'h1' } });
  });

  it('returns data from selector', () => {
    const data = {
      ...mockHotels[0],
      roomTypes: [],
      activityTypes: [],
      totalRooms: 0,
      totalActivities: 0,
    };
    const store = createTestStore({
      hotels: {
        list: { status: 'idle', data: [], error: null },
        detail: { status: 'succeeded', data, error: null },
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
      },
    });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    const { result } = renderHook(() => useHotel('h1'), { wrapper });
    expect(result.current.data).toEqual(data);
    expect(result.current.isSuccess).toBe(true);
  });
});
