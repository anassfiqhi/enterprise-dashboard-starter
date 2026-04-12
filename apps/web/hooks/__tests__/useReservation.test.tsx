import { renderHook } from '@testing-library/react';
import { useReservation } from '../useReservation';
import { createTestStore } from '@/__mocks__/redux/store';
import { Provider } from 'react-redux';
import { FETCH_RESERVATION } from '@/lib/sagas/reservations/reservationsSaga';

describe('useReservation hook', () => {
  it('dispatches FETCH_RESERVATION', () => {
    const store = createTestStore();
    jest.spyOn(store, 'dispatch');
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    renderHook(() => useReservation('res_1'), { wrapper });
    expect(store.dispatch).toHaveBeenCalledWith({
      type: FETCH_RESERVATION,
      payload: { id: 'res_1' },
    });
  });

  it('returns data from state', () => {
    const mockRes = { id: 'res_1' };
    const store = createTestStore({
      reservationsData: {
        detail: { status: 'succeeded', data: mockRes, error: null },
      },
    });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    const { result } = renderHook(() => useReservation('res_1'), { wrapper });
    expect(result.current.data).toEqual(mockRes);
  });
});
