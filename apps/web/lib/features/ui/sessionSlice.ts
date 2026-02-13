import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { OrganizationRole } from '@repo/shared';

/**
 * Mutable permissions type for Redux state (avoids readonly conflicts with immer)
 */
export interface MutablePermissions {
    organization?: string[];
    member?: string[];
    invitation?: string[];
    hotel?: string[];
    roomTypes?: string[];
    rooms?: string[];
    activityTypes?: string[];
    activitySlots?: string[];
    inventory?: string[];
    pricingRules?: string[];
    guests?: string[];
    reservations?: string[];
    analytics?: string[];
    auditLogs?: string[];
}

export interface SessionState {
    user: {
        id: string;
        name: string;
        email: string;
        image?: string;
        isSuperAdmin: boolean;
    } | null;
    activeHotel: {
        id: string;
        name: string;
        slug: string;
    } | null;
    hotels: Array<{
        id: string;
        name: string;
        slug: string;
    }>;
    activeMember: {
        id: string;
        role: OrganizationRole;
    } | null;
    permissions: MutablePermissions | null;
    isLoading: boolean;
}

const initialState: SessionState = {
    user: null,
    activeHotel: null,
    hotels: [],
    activeMember: null,
    permissions: null,
    isLoading: false,
};

/**
 * Redux slice for session and hotel-based permissions
 * Stores user info, active hotel, role, and permissions for UI gating
 */
const sessionSlice = createSlice({
    name: 'ui/session',
    initialState,
    reducers: {
        setSession: (state, action: PayloadAction<Omit<SessionState, 'isLoading'>>) => {
            state.user = action.payload.user;
            state.activeHotel = action.payload.activeHotel;
            state.hotels = action.payload.hotels;
            state.activeMember = action.payload.activeMember;
            state.permissions = action.payload.permissions;
        },
        setActiveHotel: (state, action: PayloadAction<SessionState['activeHotel']>) => {
            state.activeHotel = action.payload;
        },
        setHotels: (state, action: PayloadAction<SessionState['hotels']>) => {
            state.hotels = action.payload;
        },
        setActiveMember: (state, action: PayloadAction<SessionState['activeMember']>) => {
            state.activeMember = action.payload;
        },
        setPermissions: (state, action: PayloadAction<SessionState['permissions']>) => {
            state.permissions = action.payload;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        clearSession: (state) => {
            state.user = null;
            state.activeHotel = null;
            state.hotels = [];
            state.activeMember = null;
            state.permissions = null;
        },
    },
});

export const {
    setSession,
    setActiveHotel,
    setHotels,
    setActiveMember,
    setPermissions,
    setLoading,
    clearSession,
} = sessionSlice.actions;

/**
 * Helper selector for permission checking
 * Super Admin bypasses all permission checks
 */
export const hasPermission = (
    state: SessionState,
    resource: keyof MutablePermissions,
    action: string
): boolean => {
    // Super Admin bypasses all permission checks
    if (state.user?.isSuperAdmin) return true;

    if (!state.permissions) return false;
    const resourcePermissions = state.permissions[resource];
    if (!resourcePermissions) return false;
    return resourcePermissions.includes(action);
};

export default sessionSlice.reducer;
