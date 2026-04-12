import { renderHook } from '@testing-library/react';
import { useAvailability } from '../useAvailability';
import { createTestStore } from '@/__mocks__/redux/store';
import { Provider } from 'react-redux';
import { FETCH_AVAILABILITY } from '@/lib/sagas/availability/availabilitySaga';

describe('useAvailability hook', () => {
  it('dispatches FETCH_AVAILABILITY based on filters in store', () => {
    const store = createTestStore({
      auth: { activeOrganizationId: 'org_1' },
      filters: {
        availability: { viewType: 'ROOM', startDate: '2026-01-01', endDate: '2026-01-31' },
      },
    });
    jest.spyOn(store, 'dispatch');
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    renderHook(() => useAvailability(), { wrapper });

    expect(store.dispatch).toHaveBeenCalledWith({
      type: FETCH_AVAILABILITY,
      payload: {
        hotelId: 'org_1',
        viewType: 'ROOM',
        startDate: '2026-01-01',
        endDate: '2026-01-31',
      },
    });
  });

  it('returns data when succeeded', () => {
    const mockData = { items: [], meta: {} };
    const store = createTestStore({
      availabilityData: { status: 'succeeded', data: mockData, error: null },
    });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    const { result } = renderHook(() => useAvailability(), { wrapper });
    expect(result.current.data).toEqual({ data: [], meta: {} });
    expect(result.current.isSuccess).toBe(true);
  });
});
