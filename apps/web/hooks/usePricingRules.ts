import { useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/lib/store';
import type { PriceAmountType, PricingChannel } from '@repo/shared';
import {
    FETCH_PRICING_RULES,
    CREATE_PRICING_RULE,
    UPDATE_PRICING_RULE,
    DELETE_PRICING_RULE,
} from '@/lib/sagas/pricingRules/pricingRulesSaga';
import { pricingRulesActions } from '@/lib/reducers/pricingRules/pricingRulesSlice';

// Input types for mutations
export interface CreatePricingRuleInput {
    hotelId: string;
    name: string;
    roomTypeId?: string;
    activityTypeId?: string;
    amountType: PriceAmountType;
    amount: number;
    currency: string;
    validFrom?: string;
    validTo?: string;
    minNights?: number;
    maxNights?: number;
    daysOfWeek?: number[];
    channel?: PricingChannel;
    promoCode?: string;
    priority: number;
    isActive: boolean;
}

export interface UpdatePricingRuleInput {
    id: string;
    hotelId: string;
    name?: string;
    roomTypeId?: string;
    activityTypeId?: string;
    amountType?: PriceAmountType;
    amount?: number;
    currency?: string;
    validFrom?: string;
    validTo?: string;
    minNights?: number;
    maxNights?: number;
    daysOfWeek?: number[];
    channel?: PricingChannel;
    promoCode?: string;
    priority?: number;
    isActive?: boolean;
}

export interface DeletePricingRuleInput {
    id: string;
    hotelId: string;
}

export function usePricingRules(hotelId: string | undefined) {
    const dispatch = useDispatch<AppDispatch>();

    const { data, status, error } = useSelector(
        (state: RootState) => state.pricingRules.list
    );

    const prevHotelId = useRef<string | undefined>(undefined);

    useEffect(() => {
        if (!hotelId) return;
        if (hotelId === prevHotelId.current) return;
        prevHotelId.current = hotelId;
        dispatch({
            type: FETCH_PRICING_RULES,
            payload: { hotelId },
        });
    }, [dispatch, hotelId]);

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
                    type: FETCH_PRICING_RULES,
                    payload: { hotelId },
                });
            }
        },
    };
}

export function usePricingRuleMutations() {
    const dispatch = useDispatch<AppDispatch>();
    const createStatus = useSelector((state: RootState) => state.pricingRules.createStatus);
    const updateStatus = useSelector((state: RootState) => state.pricingRules.updateStatus);
    const deleteStatus = useSelector((state: RootState) => state.pricingRules.deleteStatus);

    const createMutateAsync = useCallback(
        (input: CreatePricingRuleInput): Promise<unknown> => {
            const { hotelId, ...body } = input;
            return new Promise((resolve, reject) => {
                dispatch({
                    type: CREATE_PRICING_RULE,
                    payload: { hotelId, body, resolve, reject },
                });
            });
        },
        [dispatch]
    );

    const createMutate = useCallback(
        (input: CreatePricingRuleInput) => {
            const { hotelId, ...body } = input;
            dispatch({
                type: CREATE_PRICING_RULE,
                payload: { hotelId, body },
            });
        },
        [dispatch]
    );

    const updateMutateAsync = useCallback(
        (input: UpdatePricingRuleInput): Promise<unknown> => {
            const { id, hotelId, ...body } = input;
            return new Promise((resolve, reject) => {
                dispatch({
                    type: UPDATE_PRICING_RULE,
                    payload: { hotelId, id, body, resolve, reject },
                });
            });
        },
        [dispatch]
    );

    const updateMutate = useCallback(
        (input: UpdatePricingRuleInput) => {
            const { id, hotelId, ...body } = input;
            dispatch({
                type: UPDATE_PRICING_RULE,
                payload: { hotelId, id, body },
            });
        },
        [dispatch]
    );

    const deleteMutateAsync = useCallback(
        (input: DeletePricingRuleInput): Promise<unknown> => {
            const { id, hotelId } = input;
            return new Promise((resolve, reject) => {
                dispatch({
                    type: DELETE_PRICING_RULE,
                    payload: { hotelId, id, resolve, reject },
                });
            });
        },
        [dispatch]
    );

    const deleteMutate = useCallback(
        (input: DeletePricingRuleInput) => {
            const { id, hotelId } = input;
            dispatch({
                type: DELETE_PRICING_RULE,
                payload: { hotelId, id },
            });
        },
        [dispatch]
    );

    const reset = useCallback(
        () => dispatch(pricingRulesActions.resetMutationStatus()),
        [dispatch]
    );

    return {
        createPricingRule: {
            mutate: createMutate,
            mutateAsync: createMutateAsync,
            isPending: createStatus === 'loading',
            isError: createStatus === 'failed',
            isSuccess: createStatus === 'succeeded',
            reset,
        },
        updatePricingRule: {
            mutate: updateMutate,
            mutateAsync: updateMutateAsync,
            isPending: updateStatus === 'loading',
            isError: updateStatus === 'failed',
            isSuccess: updateStatus === 'succeeded',
            reset,
        },
        deletePricingRule: {
            mutate: deleteMutate,
            mutateAsync: deleteMutateAsync,
            isPending: deleteStatus === 'loading',
            isError: deleteStatus === 'failed',
            isSuccess: deleteStatus === 'succeeded',
            reset,
        },
    };
}
