import { call, put } from 'redux-saga/effects';
import {
  fetchMetricsWorker,
  fetchBookingMetricsWorker,
  FETCH_METRICS,
  FETCH_BOOKING_METRICS,
} from '../metricsSaga';
import { metricsActions } from '@/lib/reducers/metrics/metricsSlice';
import { mockMetrics, mockBookingMetrics } from '@/__mocks__/fixtures/metrics';
import { apiRequest } from '@/lib/api/apiClient';

jest.mock('@/lib/api/apiClient', () => ({
  apiRequest: jest.fn(),
}));

describe('fetchMetricsWorker', () => {
  const action = { type: FETCH_METRICS, payload: { hotelId: 'hotel_1' } };

  it('happy path', () => {
    const gen = fetchMetricsWorker(action as Parameters<typeof fetchMetricsWorker>[0]);
    expect(gen.next().value).toEqual(put(metricsActions.fetchMetricsRequest()));
    expect(gen.next().value).toEqual(
      call(apiRequest, '/api/v1/metrics', { params: { hotelId: 'hotel_1' } })
    );
    expect(gen.next(mockMetrics).value).toEqual(
      put(metricsActions.fetchMetricsSuccess(mockMetrics))
    );
    expect(gen.next().done).toBe(true);
  });

  it('error path', () => {
    const gen = fetchMetricsWorker(action as Parameters<typeof fetchMetricsWorker>[0]);
    gen.next();
    gen.next();
    expect(gen.throw(new Error('Server error')).value).toEqual(
      put(metricsActions.fetchMetricsFailure('Server error'))
    );
  });
});

describe('fetchBookingMetricsWorker', () => {
  const action = { type: FETCH_BOOKING_METRICS, payload: { hotelId: 'hotel_1' } };

  it('happy path', () => {
    const gen = fetchBookingMetricsWorker(
      action as Parameters<typeof fetchBookingMetricsWorker>[0]
    );
    expect(gen.next().value).toEqual(put(metricsActions.fetchBookingMetricsRequest()));
    expect(gen.next().value).toEqual(
      call(apiRequest, '/api/v1/booking-metrics', { params: { hotelId: 'hotel_1' } })
    );
    expect(gen.next(mockBookingMetrics).value).toEqual(
      put(metricsActions.fetchBookingMetricsSuccess(mockBookingMetrics))
    );
    expect(gen.next().done).toBe(true);
  });

  it('error path', () => {
    const gen = fetchBookingMetricsWorker(
      action as Parameters<typeof fetchBookingMetricsWorker>[0]
    );
    gen.next();
    gen.next();
    expect(gen.throw(new Error('Timeout')).value).toEqual(
      put(metricsActions.fetchBookingMetricsFailure('Timeout'))
    );
  });
});
