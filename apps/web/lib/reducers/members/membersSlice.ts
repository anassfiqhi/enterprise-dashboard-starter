import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Member } from '@/lib/auth-client';
import { createAsyncState, type AsyncState, type AsyncStatus } from '../asyncState';
import { UserWithRole } from 'better-auth/plugins';

// ============================================================================
// State Shape
// ============================================================================
export type MemberWithUserWithRole = Omit<Member, 'user'> & {
    user: UserWithRole;
};

interface MembersState {
    list: AsyncState<MemberWithUserWithRole[]>;
    updateRoleStatus: AsyncStatus;
    removeStatus: AsyncStatus;
    mutationError: string | null;
}

const initialState: MembersState = {
    list: createAsyncState<MemberWithUserWithRole[]>([]),
    updateRoleStatus: 'idle',
    removeStatus: 'idle',
    mutationError: null,
};

// ============================================================================
// Slice
// ============================================================================

const membersSlice = createSlice({
    name: 'members',
    initialState,
    reducers: {
        // ----- List -----
        fetchMembersRequest(state) {
            state.list.status = 'loading';
            state.list.error = null;
        },
        fetchMembersSuccess(state, action: PayloadAction<MemberWithUserWithRole[]>) {
            state.list.status = 'succeeded';
            state.list.data = action.payload;
            state.list.error = null;
        },
        fetchMembersFailure(state, action: PayloadAction<string>) {
            state.list.status = 'failed';
            state.list.error = action.payload;
        },

        // ----- Update Role -----
        updateRoleRequest(state) {
            state.updateRoleStatus = 'loading';
            state.mutationError = null;
        },
        updateRoleSuccess(state) {
            state.updateRoleStatus = 'succeeded';
        },
        updateRoleFailure(state, action: PayloadAction<string>) {
            state.updateRoleStatus = 'failed';
            state.mutationError = action.payload;
        },

        // ----- Remove -----
        removeRequest(state) {
            state.removeStatus = 'loading';
            state.mutationError = null;
        },
        removeSuccess(state) {
            state.removeStatus = 'succeeded';
        },
        removeFailure(state, action: PayloadAction<string>) {
            state.removeStatus = 'failed';
            state.mutationError = action.payload;
        },

        // ----- Reset -----
        resetMutationStatus(state) {
            state.updateRoleStatus = 'idle';
            state.removeStatus = 'idle';
            state.mutationError = null;
        },
    },
});

export const membersActions = membersSlice.actions;
export default membersSlice.reducer;
