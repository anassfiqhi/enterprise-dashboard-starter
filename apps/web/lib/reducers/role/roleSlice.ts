import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createAsyncState, type AsyncState } from '../asyncState';

type RoleState = AsyncState<string | null>;

const initialState: RoleState = createAsyncState<string | null>(null);

const roleSlice = createSlice({
    name: 'role',
    initialState,
    reducers: {
        fetchRoleRequest(state) {
            state.status = 'loading';
            state.error = null;
        },
        fetchRoleSuccess(state, action: PayloadAction<string>) {
            state.status = 'succeeded';
            state.data = action.payload;
            state.error = null;
        },
        fetchRoleFailure(state, action: PayloadAction<string>) {
            state.status = 'failed';
            state.error = action.payload;
        },
    },
});

export const roleActions = roleSlice.actions;
export default roleSlice.reducer;
