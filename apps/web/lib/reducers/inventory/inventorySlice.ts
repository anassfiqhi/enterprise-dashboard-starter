import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RoomInventory } from '@repo/shared';
import { createAsyncState, type AsyncState, type AsyncStatus } from '../asyncState';

interface InventoryState {
    list: AsyncState<RoomInventory[]>;
    updateStatus: AsyncStatus;
    mutationError: string | null;
}

const initialState: InventoryState = {
    list: createAsyncState<RoomInventory[]>([]),
    updateStatus: 'idle',
    mutationError: null,
};

const inventorySlice = createSlice({
    name: 'inventory',
    initialState,
    reducers: {
        fetchRequest(state) {
            state.list.status = 'loading';
            state.list.error = null;
        },
        fetchSuccess(state, action: PayloadAction<RoomInventory[]>) {
            state.list.status = 'succeeded';
            state.list.data = action.payload;
            state.list.error = null;
        },
        fetchFailure(state, action: PayloadAction<string>) {
            state.list.status = 'failed';
            state.list.error = action.payload;
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
        resetMutationStatus(state) {
            state.updateStatus = 'idle';
            state.mutationError = null;
        },
    },
});

export const inventoryActions = inventorySlice.actions;
export default inventorySlice.reducer;
