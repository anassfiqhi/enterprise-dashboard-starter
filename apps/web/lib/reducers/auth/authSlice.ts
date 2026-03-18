import { Session, User } from '@/lib/auth-client';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * Minimal auth state for Redux
 * Session data is managed by Better Auth hooks (useSession)
 * This slice only tracks app initialization state
 */
export interface AuthState {
    session: Session['session'] | null;
    user: User | null;
}

const initialState: AuthState = {
    session: null,
    user: null,
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
        setSession: (state, action: PayloadAction<Session['session']>) => {
            state.session = action.payload;
        },
        setUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
        },
    },
});

export const {
    setSession,
    setUser,
} = authSlice.actions;

export default authSlice.reducer;
