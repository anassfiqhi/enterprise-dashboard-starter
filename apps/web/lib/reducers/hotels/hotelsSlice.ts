import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Hotel, RoomType, ActivityType } from '@repo/shared';
import { createAsyncState, type AsyncState, type AsyncStatus } from '../asyncState';

// ============================================================================
// Hotel Domain Types
// ============================================================================

export interface HotelDetail extends Hotel {
    roomTypes: RoomType[];
    activityTypes: ActivityType[];
    totalRooms: number;
    totalActivities: number;
}

// ============================================================================
// State Shape
// ============================================================================

interface HotelsState {
    list: AsyncState<Hotel[]>;
    detail: AsyncState<HotelDetail | null>;
    createHotelStatus: AsyncStatus;
    updateHotelStatus: AsyncStatus;
    deleteHotelStatus: AsyncStatus;
    createRoomTypeStatus: AsyncStatus;
    updateRoomTypeStatus: AsyncStatus;
    deleteRoomTypeStatus: AsyncStatus;
    createActivityTypeStatus: AsyncStatus;
    updateActivityTypeStatus: AsyncStatus;
    deleteActivityTypeStatus: AsyncStatus;
    mutationError: string | null;
}

const initialState: HotelsState = {
    list: createAsyncState<Hotel[]>([]),
    detail: createAsyncState<HotelDetail | null>(null),
    createHotelStatus: 'idle',
    updateHotelStatus: 'idle',
    deleteHotelStatus: 'idle',
    createRoomTypeStatus: 'idle',
    updateRoomTypeStatus: 'idle',
    deleteRoomTypeStatus: 'idle',
    createActivityTypeStatus: 'idle',
    updateActivityTypeStatus: 'idle',
    deleteActivityTypeStatus: 'idle',
    mutationError: null,
};

// ============================================================================
// Slice
// ============================================================================

const hotelsSlice = createSlice({
    name: 'hotels',
    initialState,
    reducers: {
        // ----- List -----
        fetchHotelsRequest(state) {
            state.list.status = 'loading';
            state.list.error = null;
        },
        fetchHotelsSuccess(state, action: PayloadAction<Hotel[]>) {
            state.list.status = 'succeeded';
            state.list.data = action.payload;
            state.list.error = null;
        },
        fetchHotelsFailure(state, action: PayloadAction<string>) {
            state.list.status = 'failed';
            state.list.error = action.payload;
        },

        // ----- Detail -----
        fetchHotelRequest(state) {
            state.detail.status = 'loading';
            state.detail.error = null;
        },
        fetchHotelSuccess(state, action: PayloadAction<HotelDetail>) {
            state.detail.status = 'succeeded';
            state.detail.data = action.payload;
            state.detail.error = null;
        },
        fetchHotelFailure(state, action: PayloadAction<string>) {
            state.detail.status = 'failed';
            state.detail.error = action.payload;
        },

        // ----- Create Hotel -----
        createHotelRequest(state) {
            state.createHotelStatus = 'loading';
            state.mutationError = null;
        },
        createHotelSuccess(state) {
            state.createHotelStatus = 'succeeded';
        },
        createHotelFailure(state, action: PayloadAction<string>) {
            state.createHotelStatus = 'failed';
            state.mutationError = action.payload;
        },

        // ----- Update Hotel -----
        updateHotelRequest(state) {
            state.updateHotelStatus = 'loading';
            state.mutationError = null;
        },
        updateHotelSuccess(state) {
            state.updateHotelStatus = 'succeeded';
        },
        updateHotelFailure(state, action: PayloadAction<string>) {
            state.updateHotelStatus = 'failed';
            state.mutationError = action.payload;
        },

        // ----- Delete Hotel -----
        deleteHotelRequest(state) {
            state.deleteHotelStatus = 'loading';
            state.mutationError = null;
        },
        deleteHotelSuccess(state) {
            state.deleteHotelStatus = 'succeeded';
        },
        deleteHotelFailure(state, action: PayloadAction<string>) {
            state.deleteHotelStatus = 'failed';
            state.mutationError = action.payload;
        },

        // ----- Create Room Type -----
        createRoomTypeRequest(state) {
            state.createRoomTypeStatus = 'loading';
            state.mutationError = null;
        },
        createRoomTypeSuccess(state) {
            state.createRoomTypeStatus = 'succeeded';
        },
        createRoomTypeFailure(state, action: PayloadAction<string>) {
            state.createRoomTypeStatus = 'failed';
            state.mutationError = action.payload;
        },

        // ----- Update Room Type -----
        updateRoomTypeRequest(state) {
            state.updateRoomTypeStatus = 'loading';
            state.mutationError = null;
        },
        updateRoomTypeSuccess(state) {
            state.updateRoomTypeStatus = 'succeeded';
        },
        updateRoomTypeFailure(state, action: PayloadAction<string>) {
            state.updateRoomTypeStatus = 'failed';
            state.mutationError = action.payload;
        },

        // ----- Delete Room Type -----
        deleteRoomTypeRequest(state) {
            state.deleteRoomTypeStatus = 'loading';
            state.mutationError = null;
        },
        deleteRoomTypeSuccess(state) {
            state.deleteRoomTypeStatus = 'succeeded';
        },
        deleteRoomTypeFailure(state, action: PayloadAction<string>) {
            state.deleteRoomTypeStatus = 'failed';
            state.mutationError = action.payload;
        },

        // ----- Create Activity Type -----
        createActivityTypeRequest(state) {
            state.createActivityTypeStatus = 'loading';
            state.mutationError = null;
        },
        createActivityTypeSuccess(state) {
            state.createActivityTypeStatus = 'succeeded';
        },
        createActivityTypeFailure(state, action: PayloadAction<string>) {
            state.createActivityTypeStatus = 'failed';
            state.mutationError = action.payload;
        },

        // ----- Update Activity Type -----
        updateActivityTypeRequest(state) {
            state.updateActivityTypeStatus = 'loading';
            state.mutationError = null;
        },
        updateActivityTypeSuccess(state) {
            state.updateActivityTypeStatus = 'succeeded';
        },
        updateActivityTypeFailure(state, action: PayloadAction<string>) {
            state.updateActivityTypeStatus = 'failed';
            state.mutationError = action.payload;
        },

        // ----- Delete Activity Type -----
        deleteActivityTypeRequest(state) {
            state.deleteActivityTypeStatus = 'loading';
            state.mutationError = null;
        },
        deleteActivityTypeSuccess(state) {
            state.deleteActivityTypeStatus = 'succeeded';
        },
        deleteActivityTypeFailure(state, action: PayloadAction<string>) {
            state.deleteActivityTypeStatus = 'failed';
            state.mutationError = action.payload;
        },

        // ----- Reset -----
        resetMutationStatus(state) {
            state.createHotelStatus = 'idle';
            state.updateHotelStatus = 'idle';
            state.deleteHotelStatus = 'idle';
            state.createRoomTypeStatus = 'idle';
            state.updateRoomTypeStatus = 'idle';
            state.deleteRoomTypeStatus = 'idle';
            state.createActivityTypeStatus = 'idle';
            state.updateActivityTypeStatus = 'idle';
            state.deleteActivityTypeStatus = 'idle';
            state.mutationError = null;
        },
    },
});

export const hotelsActions = hotelsSlice.actions;
export default hotelsSlice.reducer;
