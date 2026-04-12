import reducer, { metricsActions } from '../metricsSlice';
import { mockMetrics, mockBookingMetrics } from '@/__mocks__/fixtures/metrics';

describe('metricsSlice', () => {
  const initialState = reducer(undefined, { type: '@@INIT' });

  it('returns correct initial state', () => {
    expect(initialState).toMatchObject({
      dashboard: { status: 'idle', data: null, error: null },
      booking: { status: 'idle', data: null, error: null },
    });
  });

  describe('fetchMetrics', () => {
    it('sets loading', () => {
      expect(reducer(initialState, metricsActions.fetchMetricsRequest()).dashboard.status).toBe(
        'loading'
      );
    });

    it('stores metrics on success', () => {
      const state = reducer(initialState, metricsActions.fetchMetricsSuccess(mockMetrics));
      expect(state.dashboard.status).toBe('succeeded');
      expect(state.dashboard.data).toEqual(mockMetrics);
    });

    it('stores error on failure', () => {
      const state = reducer(initialState, metricsActions.fetchMetricsFailure('Unauthorized'));
      expect(state.dashboard.status).toBe('failed');
      expect(state.dashboard.error).toBe('Unauthorized');
    });
  });

  describe('fetchBookingMetrics', () => {
    it('sets loading', () => {
      expect(
        reducer(initialState, metricsActions.fetchBookingMetricsRequest()).booking.status
      ).toBe('loading');
    });

    it('stores booking metrics on success', () => {
      const state = reducer(
        initialState,
        metricsActions.fetchBookingMetricsSuccess(mockBookingMetrics)
      );
      expect(state.booking.status).toBe('succeeded');
      expect(state.booking.data).toEqual(mockBookingMetrics);
    });

    it('stores error on failure', () => {
      const state = reducer(initialState, metricsActions.fetchBookingMetricsFailure('Error'));
      expect(state.booking.status).toBe('failed');
    });
  });
});
