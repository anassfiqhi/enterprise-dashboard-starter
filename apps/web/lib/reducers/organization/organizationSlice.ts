import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum InvitationStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    REJECTED = 'rejected',
    EXPIRED = 'expired',
}

export interface Organization {
    id: string;
    name: string;
    slug: string;
    createdAt: Date;
    logo?: string | null | undefined;
    metadata?: Record<string, unknown>;
    members: {
        id: string;
        organizationId: string;
        role: 'admin' | 'staff';
        createdAt: Date;
        userId: string;
        user: {
            id: string;
            email: string;
            name: string;
            image?: string | undefined;
        };
    }[];
    invitations: {
        id: string;
        organizationId: string;
        email: string;
        role: 'admin' | 'staff';
        status: InvitationStatus;
        inviterId: string;
        expiresAt: Date;
        createdAt: Date;
    }[];
}

export interface ActiveMember {
    id: string;
    role: 'admin' | 'staff';
}

/**
 * Organization UI state for Redux
 * 
 * NOTE: Organization data is NOT stored here.
 * Use Better Auth hooks to access organization data:
 * - authClient.useActiveOrganization() for active organization
 * - authClient.useListOrganizations() for organizations list
 * - authClient.useActiveMember() for active member
 * 
 * This slice only tracks UI-specific state.
 */
export interface OrganizationState {
    organizationSwitcherOpen: boolean;
    lastViewedOrganizationId: string | null;
}

const initialState: OrganizationState = {
    organizationSwitcherOpen: false,
    lastViewedOrganizationId: null,
};

/**
 * Redux slice for organization UI state
 * Stores UI-specific state only, not server data
 */
const organizationSlice = createSlice({
    name: 'organization',
    initialState,
    reducers: {
        setOrganizationSwitcherOpen: (state, action: PayloadAction<boolean>) => {
            state.organizationSwitcherOpen = action.payload;
        },
        toggleOrganizationSwitcher: (state) => {
            state.organizationSwitcherOpen = !state.organizationSwitcherOpen;
        },
        setLastViewedOrganization: (state, action: PayloadAction<string | null>) => {
            state.lastViewedOrganizationId = action.payload;
        },
    },
});

export const {
    setOrganizationSwitcherOpen,
    toggleOrganizationSwitcher,
    setLastViewedOrganization,
} = organizationSlice.actions;

export default organizationSlice.reducer;
