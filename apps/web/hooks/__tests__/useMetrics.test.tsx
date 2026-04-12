import { renderHook } from '@testing-library/react';
import { useMetrics } from '../useMetrics';
import { createTestStore } from '@/__mocks__/redux/store';
import { Provider } from 'react-redux';
import { FETCH_METRICS } from '@/lib/sagas/metrics/metricsSaga';
import { mockMetrics } from '@/__mocks__/fixtures/metrics';

describe('useMetrics hook', () => {
  it('dispatches FETCH_METRICS', () => {
    const store = createTestStore({
      auth: { activeOrganizationId: 'org_1' },
    });
    jest.spyOn(store, 'dispatch');
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    renderHook(() => useMetrics(), { wrapper });
    expect(store.dispatch).toHaveBeenCalledWith({
      type: FETCH_METRICS,
      payload: { hotelId: 'org_1' },
    });
  });

  it('returns data from selector', () => {
    const store = createTestStore({
      metrics: {
        dashboard: { status: 'succeeded', data: mockMetrics, error: null },
      },
    });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
    const { result } = renderHook(() => useMetrics(), { wrapper });
    expect(result.current.data).toEqual(mockMetrics);
  });
});
