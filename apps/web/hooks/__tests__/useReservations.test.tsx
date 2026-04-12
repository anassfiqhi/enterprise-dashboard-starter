import { renderHook } from '@testing-library/react';
import { useReservations } from '../useReservations';
import { createTestStore } from '@/__mocks__/redux/store';
import { Provider } from 'react-redux';
import { FETCH_RESERVATIONS } from '@/lib/sagas/reservations/reservationsSaga';
import { mockReservations } from '@/__mocks__/fixtures/reservations';

describe('useReservations hook', () => {
  it('dispatches FETCH_RESERVATIONS based on store filters', () => {
    const store = createTestStore({
      auth: { activeOrganizationId: 'org_1' },
      filters: {
        reservations: { page: 1, pageSize: 10, search: 'test', status: 'ALL', sort: 'desc' },
      },
    });
    jest.spyOn(store, 'dispatch');
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    renderHook(() => useReservations(), { wrapper });
    expect(store.dispatch).toHaveBeenCalledWith({
      type: FETCH_RESERVATIONS,
      payload: {
        hotelId: 'org_1',
        page: 1,
        pageSize: 10,
        search: 'test',
        status: 'ALL',
        sort: 'desc',
        checkInFrom: undefined,
        checkInTo: undefined,
      },
    });
  });

  it('returns data correctly nested', () => {
    const store = createTestStore({
      reservationsData: {
        list: {
          status: 'succeeded',
          data: { items: mockReservations, meta: { total: 10 } },
          error: null,
        },
        detail: { status: 'idle', data: null, error: null },
      },
    });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    const { result } = renderHook(() => useReservations(), { wrapper });
    expect(result.current.data.data).toEqual(mockReservations);
    expect(result.current.data.meta?.total).toBe(10);
  });
});
