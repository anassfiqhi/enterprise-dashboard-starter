import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * Minimal auth state for Redux
 * Session data is managed by Better Auth hooks (useSession)
 * This slice only tracks app initialization state
 */
export interface AuthState {
    isInitializing: boolean;
}

const initialState: AuthState = {
    isInitializing: true,
};

/**
 * Redux slice for auth initialization state
 * 
 * NOTE: User session data is NOT stored here.
 * Use authClient.useSession() hook to access session data.
 * 
 * This slice only tracks whether the app has completed
 * its initial authentication check.
 */
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setInitializing: (state, action: PayloadAction<boolean>) => {
            state.isInitializing = action.payload;
        },
        completeInitialization: (state) => {
            state.isInitializing = false;
        },
    },
});

export const {
    setInitializing,
    completeInitialization,
} = authSlice.actions;

export default authSlice.reducer;
