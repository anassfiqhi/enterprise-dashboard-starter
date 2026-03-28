import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createAsyncState, type AsyncState, type AsyncStatus } from '../asyncState';

// ============================================================================
// Types
// ============================================================================

export interface Invitation {
    id: string;
    email: string;
    role: string;
    status: string;
    organizationId: string;
    inviterId: string;
    expiresAt: string | Date;
}

// ============================================================================
// State Shape
// ============================================================================

interface InvitationsState {
    list: AsyncState<Invitation[]>;
    inviteStatus: AsyncStatus;
    cancelStatus: AsyncStatus;
    mutationError: string | null;
}

const initialState: InvitationsState = {
    list: createAsyncState<Invitation[]>([]),
    inviteStatus: 'idle',
    cancelStatus: 'idle',
    mutationError: null,
};

// ============================================================================
// Slice
// ============================================================================

const invitationsSlice = createSlice({
    name: 'invitations',
    initialState,
    reducers: {
        // ----- List -----
        fetchInvitationsRequest(state) {
            state.list.status = 'loading';
            state.list.error = null;
        },
        fetchInvitationsSuccess(state, action: PayloadAction<Invitation[]>) {
            state.list.status = 'succeeded';
            state.list.data = action.payload;
            state.list.error = null;
        },
        fetchInvitationsFailure(state, action: PayloadAction<string>) {
            state.list.status = 'failed';
            state.list.error = action.payload;
        },

        // ----- Invite -----
        inviteRequest(state) {
            state.inviteStatus = 'loading';
            state.mutationError = null;
        },
        inviteSuccess(state) {
            state.inviteStatus = 'succeeded';
        },
        inviteFailure(state, action: PayloadAction<string>) {
            state.inviteStatus = 'failed';
            state.mutationError = action.payload;
        },

        // ----- Cancel -----
        cancelRequest(state) {
            state.cancelStatus = 'loading';
            state.mutationError = null;
        },
        cancelSuccess(state) {
            state.cancelStatus = 'succeeded';
        },
        cancelFailure(state, action: PayloadAction<string>) {
            state.cancelStatus = 'failed';
            state.mutationError = action.payload;
        },

        // ----- Reset -----
        resetMutationStatus(state) {
            state.inviteStatus = 'idle';
            state.cancelStatus = 'idle';
            state.mutationError = null;
        },
    },
});

export const invitationsActions = invitationsSlice.actions;
export default invitationsSlice.reducer;
