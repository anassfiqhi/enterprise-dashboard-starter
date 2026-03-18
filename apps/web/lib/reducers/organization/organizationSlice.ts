import { Organization } from '@/lib/auth-client';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface OrganizationState {
    organizations: Organization[];
    selectedOrganization: string | null;
}

const initialState: OrganizationState = {
    organizations: [],
    selectedOrganization: null
};

/**
 * Redux slice for organization UI state
 * Stores UI-specific state only, not server data
 */
const organizationSlice = createSlice({
    name: 'organization',
    initialState,
    reducers: {
        setOrganizations: (state, action: PayloadAction<Organization[]>) => {
            state.organizations = action.payload;
        },
        setSelectedOrganization: (state, action: PayloadAction<string>) => {
            state.selectedOrganization = action.payload;
        },
    },
});

export const {
    setOrganizations,
    setSelectedOrganization,
} = organizationSlice.actions;

export default organizationSlice.reducer;
