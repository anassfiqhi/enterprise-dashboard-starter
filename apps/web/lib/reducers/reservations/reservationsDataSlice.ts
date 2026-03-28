import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Reservation, Payment } from '@repo/shared';
import { createAsyncState, type AsyncState, type AsyncStatus } from '../asyncState';

// ============================================================================
// Reservation Domain Types
// ============================================================================

export interface ReservationWithPayments extends Reservation {
    payments?: Payment[];
}

// ============================================================================
// State Shape
// ============================================================================

interface ReservationListMeta {
    requestId: string;
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

interface ReservationsDataState {
    list: AsyncState<{
        items: Reservation[];
        meta: ReservationListMeta | null;
    }>;
    detail: AsyncState<ReservationWithPayments | null>;
    createStatus: AsyncStatus;
    updateStatusStatus: AsyncStatus;
    cancelStatus: AsyncStatus;
    refundStatus: AsyncStatus;
    mutationError: string | null;
}

const initialState: ReservationsDataState = {
    list: createAsyncState<{ items: Reservation[]; meta: ReservationListMeta | null }>({
        items: [],
        meta: null,
    }),
    detail: createAsyncState<ReservationWithPayments | null>(null),
    createStatus: 'idle',
    updateStatusStatus: 'idle',
    cancelStatus: 'idle',
    refundStatus: 'idle',
    mutationError: null,
};

// ============================================================================
// Slice
// ============================================================================

const reservationsDataSlice = createSlice({
    name: 'reservationsData',
    initialState,
    reducers: {
        // ----- List -----
        fetchReservationsRequest(state) {
            state.list.status = 'loading';
            state.list.error = null;
        },
        fetchReservationsSuccess(
            state,
            action: PayloadAction<{ items: Reservation[]; meta: ReservationListMeta }>,
        ) {
            state.list.status = 'succeeded';
            state.list.data = action.payload;
            state.list.error = null;
        },
        fetchReservationsFailure(state, action: PayloadAction<string>) {
            state.list.status = 'failed';
            state.list.error = action.payload;
        },

        // ----- Detail -----
        fetchReservationRequest(state) {
            state.detail.status = 'loading';
            state.detail.error = null;
        },
        fetchReservationSuccess(state, action: PayloadAction<ReservationWithPayments>) {
            state.detail.status = 'succeeded';
            state.detail.data = action.payload;
            state.detail.error = null;
        },
        fetchReservationFailure(state, action: PayloadAction<string>) {
            state.detail.status = 'failed';
            state.detail.error = action.payload;
        },

        // ----- Create -----
        createReservationRequest(state) {
            state.createStatus = 'loading';
            state.mutationError = null;
        },
        createReservationSuccess(state) {
            state.createStatus = 'succeeded';
        },
        createReservationFailure(state, action: PayloadAction<string>) {
            state.createStatus = 'failed';
            state.mutationError = action.payload;
        },

        // ----- Update Status -----
        updateReservationStatusRequest(state) {
            state.updateStatusStatus = 'loading';
            state.mutationError = null;
        },
        updateReservationStatusSuccess(state) {
            state.updateStatusStatus = 'succeeded';
        },
        updateReservationStatusFailure(state, action: PayloadAction<string>) {
            state.updateStatusStatus = 'failed';
            state.mutationError = action.payload;
        },

        // ----- Cancel -----
        cancelReservationRequest(state) {
            state.cancelStatus = 'loading';
            state.mutationError = null;
        },
        cancelReservationSuccess(state) {
            state.cancelStatus = 'succeeded';
        },
        cancelReservationFailure(state, action: PayloadAction<string>) {
            state.cancelStatus = 'failed';
            state.mutationError = action.payload;
        },

        // ----- Refund -----
        refundReservationRequest(state) {
            state.refundStatus = 'loading';
            state.mutationError = null;
        },
        refundReservationSuccess(state) {
            state.refundStatus = 'succeeded';
        },
        refundReservationFailure(state, action: PayloadAction<string>) {
            state.refundStatus = 'failed';
            state.mutationError = action.payload;
        },

        // ----- SSE Patch -----
        patchReservationDetail(
            state,
            action: PayloadAction<{ id: string; patch: Record<string, unknown> }>,
        ) {
            if (state.detail.data && state.detail.data.id === action.payload.id) {
                Object.assign(state.detail.data, action.payload.patch);
            }
            // Also patch the item in the list if present
            const idx = state.list.data.items.findIndex((r) => r.id === action.payload.id);
            if (idx !== -1) {
                Object.assign(state.list.data.items[idx], action.payload.patch);
            }
        },

        // ----- Reset -----
        resetMutationStatus(state) {
            state.createStatus = 'idle';
            state.updateStatusStatus = 'idle';
            state.cancelStatus = 'idle';
            state.refundStatus = 'idle';
            state.mutationError = null;
        },
    },
});

export const reservationsDataActions = reservationsDataSlice.actions;
export default reservationsDataSlice.reducer;
