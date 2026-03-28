import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { PromoCode } from '@repo/shared';
import { createAsyncState, type AsyncState, type AsyncStatus } from '../asyncState';

export interface ValidatePromoCodeResult {
    valid: boolean;
    reason?: string;
    promo?: PromoCode;
    discountAmount?: number;
    finalAmount?: number;
}

interface PromoCodesState {
    list: AsyncState<PromoCode[]>;
    validation: AsyncState<ValidatePromoCodeResult | null>;
    createStatus: AsyncStatus;
    updateStatus: AsyncStatus;
    deleteStatus: AsyncStatus;
    mutationError: string | null;
}

const initialState: PromoCodesState = {
    list: createAsyncState<PromoCode[]>([]),
    validation: createAsyncState<ValidatePromoCodeResult | null>(null),
    createStatus: 'idle',
    updateStatus: 'idle',
    deleteStatus: 'idle',
    mutationError: null,
};

const promoCodesSlice = createSlice({
    name: 'promoCodes',
    initialState,
    reducers: {
        // Fetch promo codes
        fetchPromoCodesRequest(state) {
            state.list.status = 'loading';
            state.list.error = null;
        },
        fetchPromoCodesSuccess(state, action: PayloadAction<PromoCode[]>) {
            state.list.status = 'succeeded';
            state.list.data = action.payload;
            state.list.error = null;
        },
        fetchPromoCodesFailure(state, action: PayloadAction<string>) {
            state.list.status = 'failed';
            state.list.error = action.payload;
        },

        // Validate promo code
        validatePromoCodeRequest(state) {
            state.validation.status = 'loading';
            state.validation.error = null;
        },
        validatePromoCodeSuccess(state, action: PayloadAction<ValidatePromoCodeResult | null>) {
            state.validation.status = 'succeeded';
            state.validation.data = action.payload;
            state.validation.error = null;
        },
        validatePromoCodeFailure(state, action: PayloadAction<string>) {
            state.validation.status = 'failed';
            state.validation.error = action.payload;
        },

        // Create promo code
        createPromoCodeRequest(state) {
            state.createStatus = 'loading';
            state.mutationError = null;
        },
        createPromoCodeSuccess(state) {
            state.createStatus = 'succeeded';
        },
        createPromoCodeFailure(state, action: PayloadAction<string>) {
            state.createStatus = 'failed';
            state.mutationError = action.payload;
        },

        // Update promo code
        updatePromoCodeRequest(state) {
            state.updateStatus = 'loading';
            state.mutationError = null;
        },
        updatePromoCodeSuccess(state) {
            state.updateStatus = 'succeeded';
        },
        updatePromoCodeFailure(state, action: PayloadAction<string>) {
            state.updateStatus = 'failed';
            state.mutationError = action.payload;
        },

        // Delete promo code
        deletePromoCodeRequest(state) {
            state.deleteStatus = 'loading';
            state.mutationError = null;
        },
        deletePromoCodeSuccess(state) {
            state.deleteStatus = 'succeeded';
        },
        deletePromoCodeFailure(state, action: PayloadAction<string>) {
            state.deleteStatus = 'failed';
            state.mutationError = action.payload;
        },

        // Reset mutation status
        resetMutationStatus(state) {
            state.createStatus = 'idle';
            state.updateStatus = 'idle';
            state.deleteStatus = 'idle';
            state.mutationError = null;
        },
    },
});

export const promoCodesActions = promoCodesSlice.actions;
export default promoCodesSlice.reducer;
