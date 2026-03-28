import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createAsyncState, type AsyncState, type AsyncStatus } from '../asyncState';

// ============================================================================
// Types
// ============================================================================

export interface AdminUser {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    role?: string;
    banned?: boolean;
    isAdmin?: boolean;
    createdAt: string;
}

export interface AdminOrganization {
    id: string;
    name: string;
    slug: string;
}

export interface Membership {
    id: string;
    role: string;
    createdAt: string;
    organizationId: string;
    organizationName: string;
    organizationSlug: string;
}

// ============================================================================
// State Shape
// ============================================================================

interface AdminState {
    users: AsyncState<{ users: AdminUser[]; total: number }>;
    user: AsyncState<AdminUser | null>;
    organizations: AsyncState<AdminOrganization[]>;
    memberships: AsyncState<Membership[]>;
    toggleSuperAdminStatus: AsyncStatus;
    addToOrgStatus: AsyncStatus;
    updateRoleStatus: AsyncStatus;
    removeFromOrgStatus: AsyncStatus;
    mutationError: string | null;
}

const initialState: AdminState = {
    users: createAsyncState<{ users: AdminUser[]; total: number }>({ users: [], total: 0 }),
    user: createAsyncState<AdminUser | null>(null),
    organizations: createAsyncState<AdminOrganization[]>([]),
    memberships: createAsyncState<Membership[]>([]),
    toggleSuperAdminStatus: 'idle',
    addToOrgStatus: 'idle',
    updateRoleStatus: 'idle',
    removeFromOrgStatus: 'idle',
    mutationError: null,
};

// ============================================================================
// Slice
// ============================================================================

const adminSlice = createSlice({
    name: 'admin',
    initialState,
    reducers: {
        // ----- Users List -----
        fetchUsersRequest(state) {
            state.users.status = 'loading';
            state.users.error = null;
        },
        fetchUsersSuccess(state, action: PayloadAction<{ users: AdminUser[]; total: number }>) {
            state.users.status = 'succeeded';
            state.users.data = action.payload;
            state.users.error = null;
        },
        fetchUsersFailure(state, action: PayloadAction<string>) {
            state.users.status = 'failed';
            state.users.error = action.payload;
        },

        // ----- Single User -----
        fetchUserRequest(state) {
            state.user.status = 'loading';
            state.user.error = null;
        },
        fetchUserSuccess(state, action: PayloadAction<AdminUser>) {
            state.user.status = 'succeeded';
            state.user.data = action.payload;
            state.user.error = null;
        },
        fetchUserFailure(state, action: PayloadAction<string>) {
            state.user.status = 'failed';
            state.user.error = action.payload;
        },

        // ----- Organizations List -----
        fetchOrganizationsRequest(state) {
            state.organizations.status = 'loading';
            state.organizations.error = null;
        },
        fetchOrganizationsSuccess(state, action: PayloadAction<AdminOrganization[]>) {
            state.organizations.status = 'succeeded';
            state.organizations.data = action.payload;
            state.organizations.error = null;
        },
        fetchOrganizationsFailure(state, action: PayloadAction<string>) {
            state.organizations.status = 'failed';
            state.organizations.error = action.payload;
        },

        // ----- User Memberships -----
        fetchMembershipsRequest(state) {
            state.memberships.status = 'loading';
            state.memberships.error = null;
        },
        fetchMembershipsSuccess(state, action: PayloadAction<Membership[]>) {
            state.memberships.status = 'succeeded';
            state.memberships.data = action.payload;
            state.memberships.error = null;
        },
        fetchMembershipsFailure(state, action: PayloadAction<string>) {
            state.memberships.status = 'failed';
            state.memberships.error = action.payload;
        },

        // ----- Toggle Super Admin -----
        toggleSuperAdminRequest(state) {
            state.toggleSuperAdminStatus = 'loading';
            state.mutationError = null;
        },
        toggleSuperAdminSuccess(state) {
            state.toggleSuperAdminStatus = 'succeeded';
        },
        toggleSuperAdminFailure(state, action: PayloadAction<string>) {
            state.toggleSuperAdminStatus = 'failed';
            state.mutationError = action.payload;
        },

        // ----- Add to Org -----
        addToOrgRequest(state) {
            state.addToOrgStatus = 'loading';
            state.mutationError = null;
        },
        addToOrgSuccess(state) {
            state.addToOrgStatus = 'succeeded';
        },
        addToOrgFailure(state, action: PayloadAction<string>) {
            state.addToOrgStatus = 'failed';
            state.mutationError = action.payload;
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

        // ----- Remove from Org -----
        removeFromOrgRequest(state) {
            state.removeFromOrgStatus = 'loading';
            state.mutationError = null;
        },
        removeFromOrgSuccess(state) {
            state.removeFromOrgStatus = 'succeeded';
        },
        removeFromOrgFailure(state, action: PayloadAction<string>) {
            state.removeFromOrgStatus = 'failed';
            state.mutationError = action.payload;
        },

        // ----- Reset -----
        resetMutationStatus(state) {
            state.toggleSuperAdminStatus = 'idle';
            state.addToOrgStatus = 'idle';
            state.updateRoleStatus = 'idle';
            state.removeFromOrgStatus = 'idle';
            state.mutationError = null;
        },
    },
});

export const adminActions = adminSlice.actions;
export default adminSlice.reducer;
