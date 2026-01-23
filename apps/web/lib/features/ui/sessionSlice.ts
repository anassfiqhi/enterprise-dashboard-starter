import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { OrganizationRole } from '@repo/shared';

// Mutable version of OrganizationPermissions for Redux state
export interface MutableOrganizationPermissions {
    organization?: string[];
    member?: string[];
    invitation?: string[];
    orders?: string[];
    metrics?: string[];
}

export interface SessionState {
    user: {
        id: string;
        name: string;
        email: string;
    } | null;
    organization: {
        id: string;
        name: string;
        slug: string;
    } | null;
    role: OrganizationRole | null;
    permissions: MutableOrganizationPermissions | null;
    isLoading: boolean;
}

const initialState: SessionState = {
    user: null,
    organization: null,
    role: null,
    permissions: null,
    isLoading: false,
};

/**
 * Redux slice for session and organization-based permissions (SPEC Section 8.2)
 * Stores user info, active organization, role, and permissions for UI gating
 */
const sessionSlice = createSlice({
    name: 'ui/session',
    initialState,
    reducers: {
        setSession: (state, action: PayloadAction<Omit<SessionState, 'isLoading'>>) => {
            state.user = action.payload.user;
            state.organization = action.payload.organization;
            state.role = action.payload.role;
            state.permissions = action.payload.permissions;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        clearSession: (state) => {
            state.user = null;
            state.organization = null;
            state.role = null;
            state.permissions = null;
        },
    },
});

export const { setSession, setLoading, clearSession } = sessionSlice.actions;

// Helper selector for permission checking
export const hasPermission = (
    state: SessionState,
    resource: keyof MutableOrganizationPermissions,
    action: string
): boolean => {
    if (!state.permissions) return false;
    const resourcePermissions = state.permissions[resource];
    if (!resourcePermissions) return false;
    return resourcePermissions.includes(action);
};

export default sessionSlice.reducer;
