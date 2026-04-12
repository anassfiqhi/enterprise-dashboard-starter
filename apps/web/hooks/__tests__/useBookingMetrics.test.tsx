import { renderHook } from '@testing-library/react';
import { useBookingMetrics } from '../useBookingMetrics';
import { createTestStore } from '@/__mocks__/redux/store';
import { Provider } from 'react-redux';
import { mockBookingMetrics } from '@/__mocks__/fixtures/metrics';
import { FETCH_BOOKING_METRICS } from '@/lib/sagas/metrics/metricsSaga';

describe('useBookingMetrics hook', () => {
  it('dispatches FETCH_BOOKING_METRICS', () => {
    const store = createTestStore({
      auth: { activeOrganizationId: 'org_1' },
    });
    jest.spyOn(store, 'dispatch');
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    renderHook(() => useBookingMetrics(), { wrapper });
    expect(store.dispatch).toHaveBeenCalledWith({
      type: FETCH_BOOKING_METRICS,
      payload: { hotelId: 'org_1' },
    });
  });

  it('returns data from selector', () => {
    const store = createTestStore({
      metrics: {
        booking: { status: 'succeeded', data: mockBookingMetrics, error: null },
      },
    });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    const { result } = renderHook(() => useBookingMetrics(), { wrapper });
    expect(result.current.data).toEqual(mockBookingMetrics);
    expect(result.current.isSuccess).toBe(true);
  });
});
