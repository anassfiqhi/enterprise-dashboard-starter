import { useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/lib/store';
import type { DiscountType } from '@repo/shared';
import { authClient } from '@/lib/auth-client';
import {
    FETCH_PROMO_CODES,
    VALIDATE_PROMO_CODE,
    CREATE_PROMO_CODE,
    UPDATE_PROMO_CODE,
    DELETE_PROMO_CODE,
} from '@/lib/sagas/promoCodes/promoCodesSaga';
import { promoCodesActions } from '@/lib/reducers/promoCodes/promoCodesSlice';

// Re-export ValidatePromoCodeResult from the slice
export type { ValidatePromoCodeResult } from '@/lib/reducers/promoCodes/promoCodesSlice';

// Query options for promo codes
export interface PromoCodesQueryOptions {
    search?: string;
    status?: 'ACTIVE' | 'EXPIRED' | 'EXHAUSTED' | 'INACTIVE';
}

// Validate a promo code for a booking
export interface ValidatePromoCodeOptions {
    code: string;
    amount: number;
    roomTypeId?: string;
}

// Input types for mutations
export interface CreatePromoCodeInput {
    code: string;
    discountType: DiscountType;
    discountValue: number;
    currency?: string;
    minBookingAmount?: number;
    maxDiscountAmount?: number;
    validFrom?: string;
    validTo?: string;
    maxUses?: number;
    maxUsesPerGuest?: number;
    applicableRoomTypeIds?: string[];
    applicableActivityTypeIds?: string[];
    isActive: boolean;
}

export interface UpdatePromoCodeInput {
    id: string;
    code?: string;
    discountType?: DiscountType;
    discountValue?: number;
    currency?: string;
    minBookingAmount?: number;
    maxDiscountAmount?: number;
    validFrom?: string;
    validTo?: string;
    maxUses?: number;
    maxUsesPerGuest?: number;
    applicableRoomTypeIds?: string[];
    applicableActivityTypeIds?: string[];
    isActive?: boolean;
}

/**
 * Hook for fetching promo codes list via Redux Saga
 * Automatically scopes to the current active hotel
 */
export function usePromoCodes(options: PromoCodesQueryOptions = {}) {
    const dispatch = useDispatch<AppDispatch>();
    const { data: activeOrg } = authClient.useActiveOrganization();
    const hotelId = activeOrg?.id;

    const { data, status, error } = useSelector(
        (state: RootState) => state.promoCodes.list
    );

    const prevParams = useRef<string>('');

    useEffect(() => {
        if (!hotelId) return;
        const paramsKey = JSON.stringify({ hotelId, search: options.search, status: options.status });
        if (paramsKey === prevParams.current) return;
        prevParams.current = paramsKey;
        dispatch({
            type: FETCH_PROMO_CODES,
            payload: { hotelId, search: options.search, status: options.status },
        });
    }, [dispatch, hotelId, options.search, options.status]);

    return {
        data,
        isLoading: status === 'loading',
        isPending: status === 'loading',
        isError: status === 'failed',
        isSuccess: status === 'succeeded',
        error: error ? new Error(error) : null,
        refetch: () => {
            if (hotelId) {
                dispatch({
                    type: FETCH_PROMO_CODES,
                    payload: { hotelId, search: options.search, status: options.status },
                });
            }
        },
    };
}

/**
 * Hook for validating a promo code via Redux Saga
 * Automatically scopes to the current active hotel
 */
export function useValidatePromoCode(options: ValidatePromoCodeOptions | null) {
    const dispatch = useDispatch<AppDispatch>();
    const { data: activeOrg } = authClient.useActiveOrganization();
    const hotelId = activeOrg?.id;

    const { data, status, error } = useSelector(
        (state: RootState) => state.promoCodes.validation
    );

    useEffect(() => {
        if (!options?.code || !hotelId) return;
        dispatch({
            type: VALIDATE_PROMO_CODE,
            payload: {
                code: options.code,
                amount: options.amount,
                hotelId,
                roomTypeId: options.roomTypeId,
            },
        });
    }, [dispatch, options?.code, options?.amount, options?.roomTypeId, hotelId]);

    return {
        data,
        isLoading: status === 'loading',
        isPending: status === 'loading',
        isError: status === 'failed',
        isSuccess: status === 'succeeded',
        error: error ? new Error(error) : null,
    };
}

/**
 * Hook for promo code CRUD mutations via Redux Saga
 * Automatically associates promo codes with the current active hotel
 */
export function usePromoCodeMutations() {
    const dispatch = useDispatch<AppDispatch>();
    const { data: activeOrg } = authClient.useActiveOrganization();
    const hotelId = activeOrg?.id;

    const createStatus = useSelector((state: RootState) => state.promoCodes.createStatus);
    const updateStatus = useSelector((state: RootState) => state.promoCodes.updateStatus);
    const deleteStatus = useSelector((state: RootState) => state.promoCodes.deleteStatus);

    // --- Create ---
    const createMutateAsync = useCallback(
        (input: CreatePromoCodeInput): Promise<unknown> => {
            if (!hotelId) return Promise.reject(new Error('No hotel selected'));
            return new Promise((resolve, reject) => {
                dispatch({
                    type: CREATE_PROMO_CODE,
                    payload: { hotelId, input, resolve, reject },
                });
            });
        },
        [dispatch, hotelId]
    );

    const createMutate = useCallback(
        (input: CreatePromoCodeInput) => {
            if (!hotelId) return;
            dispatch({
                type: CREATE_PROMO_CODE,
                payload: { hotelId, input },
            });
        },
        [dispatch, hotelId]
    );

    // --- Update ---
    const updateMutateAsync = useCallback(
        (input: UpdatePromoCodeInput): Promise<unknown> => {
            if (!hotelId) return Promise.reject(new Error('No hotel selected'));
            const { id, ...data } = input;
            return new Promise((resolve, reject) => {
                dispatch({
                    type: UPDATE_PROMO_CODE,
                    payload: { id, data, hotelId, resolve, reject },
                });
            });
        },
        [dispatch, hotelId]
    );

    const updateMutate = useCallback(
        (input: UpdatePromoCodeInput) => {
            if (!hotelId) return;
            const { id, ...data } = input;
            dispatch({
                type: UPDATE_PROMO_CODE,
                payload: { id, data, hotelId },
            });
        },
        [dispatch, hotelId]
    );

    // --- Delete ---
    const deleteMutateAsync = useCallback(
        (id: string): Promise<unknown> => {
            if (!hotelId) return Promise.reject(new Error('No hotel selected'));
            return new Promise((resolve, reject) => {
                dispatch({
                    type: DELETE_PROMO_CODE,
                    payload: { id, hotelId, resolve, reject },
                });
            });
        },
        [dispatch, hotelId]
    );

    const deleteMutate = useCallback(
        (id: string) => {
            if (!hotelId) return;
            dispatch({
                type: DELETE_PROMO_CODE,
                payload: { id, hotelId },
            });
        },
        [dispatch, hotelId]
    );

    return {
        createPromoCode: {
            mutate: createMutate,
            mutateAsync: createMutateAsync,
            isPending: createStatus === 'loading',
            isError: createStatus === 'failed',
            isSuccess: createStatus === 'succeeded',
            reset: () => dispatch(promoCodesActions.resetMutationStatus()),
        },
        updatePromoCode: {
            mutate: updateMutate,
            mutateAsync: updateMutateAsync,
            isPending: updateStatus === 'loading',
            isError: updateStatus === 'failed',
            isSuccess: updateStatus === 'succeeded',
            reset: () => dispatch(promoCodesActions.resetMutationStatus()),
        },
        deletePromoCode: {
            mutate: deleteMutate,
            mutateAsync: deleteMutateAsync,
            isPending: deleteStatus === 'loading',
            isError: deleteStatus === 'failed',
            isSuccess: deleteStatus === 'succeeded',
            reset: () => dispatch(promoCodesActions.resetMutationStatus()),
        },
    };
}
