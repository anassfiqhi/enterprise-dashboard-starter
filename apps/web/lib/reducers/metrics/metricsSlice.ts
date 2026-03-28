import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Metrics, BookingMetrics } from '@repo/shared';
import { createAsyncState, type AsyncState } from '../asyncState';

interface MetricsState {
    dashboard: AsyncState<Metrics | null>;
    booking: AsyncState<BookingMetrics | null>;
}

const initialState: MetricsState = {
    dashboard: createAsyncState<Metrics | null>(null),
    booking: createAsyncState<BookingMetrics | null>(null),
};

const metricsSlice = createSlice({
    name: 'metrics',
    initialState,
    reducers: {
        fetchMetricsRequest(state) {
            state.dashboard.status = 'loading';
            state.dashboard.error = null;
        },
        fetchMetricsSuccess(state, action: PayloadAction<Metrics>) {
            state.dashboard.status = 'succeeded';
            state.dashboard.data = action.payload;
            state.dashboard.error = null;
        },
        fetchMetricsFailure(state, action: PayloadAction<string>) {
            state.dashboard.status = 'failed';
            state.dashboard.error = action.payload;
        },

        fetchBookingMetricsRequest(state) {
            state.booking.status = 'loading';
            state.booking.error = null;
        },
        fetchBookingMetricsSuccess(state, action: PayloadAction<BookingMetrics>) {
            state.booking.status = 'succeeded';
            state.booking.data = action.payload;
            state.booking.error = null;
        },
        fetchBookingMetricsFailure(state, action: PayloadAction<string>) {
            state.booking.status = 'failed';
            state.booking.error = action.payload;
        },
    },
});

export const metricsActions = metricsSlice.actions;
export default metricsSlice.reducer;
