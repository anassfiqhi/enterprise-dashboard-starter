import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RoomAvailability, ActivitySlotAvailability } from '@repo/shared';
import { createAsyncState, type AsyncState } from '../asyncState';

type AvailabilityData = RoomAvailability[] | ActivitySlotAvailability[];

interface AvailabilityListData {
    items: AvailabilityData;
    meta: Record<string, unknown> | null;
}

type AvailabilityDataState = AsyncState<AvailabilityListData>;

const initialState: AvailabilityDataState = createAsyncState<AvailabilityListData>({
    items: [],
    meta: null,
});

const availabilityDataSlice = createSlice({
    name: 'availabilityData',
    initialState,
    reducers: {
        fetchRequest(state) {
            state.status = 'loading';
            state.error = null;
        },
        fetchSuccess(state, action: PayloadAction<AvailabilityListData>) {
            state.status = 'succeeded';
            state.data = action.payload;
            state.error = null;
        },
        fetchFailure(state, action: PayloadAction<string>) {
            state.status = 'failed';
            state.error = action.payload;
        },
    },
});

export const availabilityDataActions = availabilityDataSlice.actions;
export default availabilityDataSlice.reducer;
