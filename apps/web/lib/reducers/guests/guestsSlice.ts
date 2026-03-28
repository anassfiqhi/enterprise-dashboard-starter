import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Guest, Reservation } from '@repo/shared';
import { createAsyncState, type AsyncState, type AsyncStatus } from '../asyncState';

// ============================================================================
// Guest Domain Types
// ============================================================================

export interface GuestWithStats extends Guest {
    reservationCount: number;
    totalSpent: number;
    lastStay?: string;
}

export interface GuestStats {
    totalReservations: number;
    confirmedReservations: number;
    cancelledReservations: number;
    totalSpent: number;
    averageSpent: number;
}

export interface GuestDetail extends Guest {
    reservations: Reservation[];
    stats: GuestStats;
}

// ============================================================================
// State Shape
// ============================================================================

interface GuestListMeta {
    requestId: string;
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

interface GuestsState {
    list: AsyncState<{
        items: GuestWithStats[];
        meta: GuestListMeta | null;
    }>;
    detail: AsyncState<GuestDetail | null>;
    createStatus: AsyncStatus;
    updateStatus: AsyncStatus;
    deleteStatus: AsyncStatus;
    mutationError: string | null;
}

const initialState: GuestsState = {
    list: createAsyncState<{ items: GuestWithStats[]; meta: GuestListMeta | null }>({
        items: [],
        meta: null,
    }),
    detail: createAsyncState<GuestDetail | null>(null),
    createStatus: 'idle',
    updateStatus: 'idle',
    deleteStatus: 'idle',
    mutationError: null,
};

// ============================================================================
// Slice
// ============================================================================

const guestsSlice = createSlice({
    name: 'guests',
    initialState,
    reducers: {
        // ----- List -----
        fetchGuestsRequest(state) {
            state.list.status = 'loading';
            state.list.error = null;
        },
        fetchGuestsSuccess(
            state,
            action: PayloadAction<{ items: GuestWithStats[]; meta: GuestListMeta }>,
        ) {
            state.list.status = 'succeeded';
            state.list.data = action.payload;
            state.list.error = null;
        },
        fetchGuestsFailure(state, action: PayloadAction<string>) {
            state.list.status = 'failed';
            state.list.error = action.payload;
        },

        // ----- Detail -----
        fetchGuestRequest(state) {
            state.detail.status = 'loading';
            state.detail.error = null;
        },
        fetchGuestSuccess(state, action: PayloadAction<GuestDetail>) {
            state.detail.status = 'succeeded';
            state.detail.data = action.payload;
            state.detail.error = null;
        },
        fetchGuestFailure(state, action: PayloadAction<string>) {
            state.detail.status = 'failed';
            state.detail.error = action.payload;
        },

        // ----- Create -----
        createGuestRequest(state) {
            state.createStatus = 'loading';
            state.mutationError = null;
        },
        createGuestSuccess(state) {
            state.createStatus = 'succeeded';
        },
        createGuestFailure(state, action: PayloadAction<string>) {
            state.createStatus = 'failed';
            state.mutationError = action.payload;
        },

        // ----- Update -----
        updateGuestRequest(state) {
            state.updateStatus = 'loading';
            state.mutationError = null;
        },
        updateGuestSuccess(state) {
            state.updateStatus = 'succeeded';
        },
        updateGuestFailure(state, action: PayloadAction<string>) {
            state.updateStatus = 'failed';
            state.mutationError = action.payload;
        },

        // ----- Delete -----
        deleteGuestRequest(state) {
            state.deleteStatus = 'loading';
            state.mutationError = null;
        },
        deleteGuestSuccess(state) {
            state.deleteStatus = 'succeeded';
        },
        deleteGuestFailure(state, action: PayloadAction<string>) {
            state.deleteStatus = 'failed';
            state.mutationError = action.payload;
        },

        // ----- Reset -----
        resetMutationStatus(state) {
            state.createStatus = 'idle';
            state.updateStatus = 'idle';
            state.deleteStatus = 'idle';
            state.mutationError = null;
        },
    },
});

export const guestsActions = guestsSlice.actions;
export default guestsSlice.reducer;
