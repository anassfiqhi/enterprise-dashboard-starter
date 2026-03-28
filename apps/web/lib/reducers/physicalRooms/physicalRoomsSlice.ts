import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { PhysicalRoom } from '@repo/shared';
import { createAsyncState, type AsyncState, type AsyncStatus } from '../asyncState';

interface PhysicalRoomsState {
    list: AsyncState<PhysicalRoom[]>;
    createStatus: AsyncStatus;
    updateStatus: AsyncStatus;
    deleteStatus: AsyncStatus;
    mutationError: string | null;
}

const initialState: PhysicalRoomsState = {
    list: createAsyncState<PhysicalRoom[]>([]),
    createStatus: 'idle',
    updateStatus: 'idle',
    deleteStatus: 'idle',
    mutationError: null,
};

const physicalRoomsSlice = createSlice({
    name: 'physicalRooms',
    initialState,
    reducers: {
        fetchRequest(state) {
            state.list.status = 'loading';
            state.list.error = null;
        },
        fetchSuccess(state, action: PayloadAction<PhysicalRoom[]>) {
            state.list.status = 'succeeded';
            state.list.data = action.payload;
            state.list.error = null;
        },
        fetchFailure(state, action: PayloadAction<string>) {
            state.list.status = 'failed';
            state.list.error = action.payload;
        },

        createRequest(state) {
            state.createStatus = 'loading';
            state.mutationError = null;
        },
        createSuccess(state) {
            state.createStatus = 'succeeded';
        },
        createFailure(state, action: PayloadAction<string>) {
            state.createStatus = 'failed';
            state.mutationError = action.payload;
        },

        updateRequest(state) {
            state.updateStatus = 'loading';
            state.mutationError = null;
        },
        updateSuccess(state) {
            state.updateStatus = 'succeeded';
        },
        updateFailure(state, action: PayloadAction<string>) {
            state.updateStatus = 'failed';
            state.mutationError = action.payload;
        },

        deleteRequest(state) {
            state.deleteStatus = 'loading';
            state.mutationError = null;
        },
        deleteSuccess(state) {
            state.deleteStatus = 'succeeded';
        },
        deleteFailure(state, action: PayloadAction<string>) {
            state.deleteStatus = 'failed';
            state.mutationError = action.payload;
        },

        resetMutationStatus(state) {
            state.createStatus = 'idle';
            state.updateStatus = 'idle';
            state.deleteStatus = 'idle';
            state.mutationError = null;
        },
    },
});

export const physicalRoomsActions = physicalRoomsSlice.actions;
export default physicalRoomsSlice.reducer;
