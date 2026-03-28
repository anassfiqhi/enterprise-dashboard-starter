import { call, put, takeLatest } from 'redux-saga/effects';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Metrics, BookingMetrics } from '@repo/shared';
import { metricsActions } from '@/lib/reducers/metrics/metricsSlice';
import { apiRequest } from '@/lib/api/apiClient';

export const FETCH_METRICS = 'metrics/saga/fetchMetrics';
export const FETCH_BOOKING_METRICS = 'metrics/saga/fetchBookingMetrics';

function* fetchMetricsWorker(action: PayloadAction<{ hotelId: string }>) {
    try {
        yield put(metricsActions.fetchMetricsRequest());
        const data: Metrics = yield call(apiRequest, '/api/v1/metrics', {
            params: { hotelId: action.payload.hotelId },
        });
        yield put(metricsActions.fetchMetricsSuccess(data));
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to fetch metrics';
        yield put(metricsActions.fetchMetricsFailure(message));
    }
}

function* fetchBookingMetricsWorker(action: PayloadAction<{ hotelId: string }>) {
    try {
        yield put(metricsActions.fetchBookingMetricsRequest());
        const data: BookingMetrics = yield call(apiRequest, '/api/v1/booking-metrics', {
            params: { hotelId: action.payload.hotelId },
        });
        yield put(metricsActions.fetchBookingMetricsSuccess(data));
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to fetch booking metrics';
        yield put(metricsActions.fetchBookingMetricsFailure(message));
    }
}

export function* metricsSaga() {
    yield takeLatest(FETCH_METRICS, fetchMetricsWorker);
    yield takeLatest(FETCH_BOOKING_METRICS, fetchBookingMetricsWorker);
}
