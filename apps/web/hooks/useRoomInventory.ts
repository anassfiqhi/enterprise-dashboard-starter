import { useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/lib/store';
import type { InventoryUpdate } from '@repo/shared';
import { FETCH_INVENTORY, UPDATE_INVENTORY } from '@/lib/sagas/inventory/inventorySaga';
import { inventoryActions } from '@/lib/reducers/inventory/inventorySlice';

export interface BulkInventoryUpdateInput {
    hotelId: string;
    updates: InventoryUpdate[];
}

export function useRoomInventory(
    hotelId: string | undefined,
    startDate?: string,
    endDate?: string,
    roomTypeId?: string
) {
    const dispatch = useDispatch<AppDispatch>();

    const { data, status, error } = useSelector(
        (state: RootState) => state.inventory.list
    );

    const prevParams = useRef<string>('');

    useEffect(() => {
        if (!hotelId) return;
        const paramsKey = JSON.stringify({ hotelId, startDate, endDate, roomTypeId });
        if (paramsKey === prevParams.current) return;
        prevParams.current = paramsKey;
        dispatch({
            type: FETCH_INVENTORY,
            payload: { hotelId, startDate, endDate, roomTypeId },
        });
    }, [dispatch, hotelId, startDate, endDate, roomTypeId]);

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
                    type: FETCH_INVENTORY,
                    payload: { hotelId, startDate, endDate, roomTypeId },
                });
            }
        },
    };
}

export function useInventoryMutations() {
    const dispatch = useDispatch<AppDispatch>();
    const updateStatus = useSelector((state: RootState) => state.inventory.updateStatus);

    const mutateAsync = useCallback(
        (input: BulkInventoryUpdateInput): Promise<unknown> => {
            return new Promise((resolve, reject) => {
                dispatch({
                    type: UPDATE_INVENTORY,
                    payload: { ...input, resolve, reject },
                });
            });
        },
        [dispatch]
    );

    const mutate = useCallback(
        (input: BulkInventoryUpdateInput) => {
            dispatch({
                type: UPDATE_INVENTORY,
                payload: input,
            });
        },
        [dispatch]
    );

    return {
        updateInventory: {
            mutate,
            mutateAsync,
            isPending: updateStatus === 'loading',
            isError: updateStatus === 'failed',
            isSuccess: updateStatus === 'succeeded',
            reset: () => dispatch(inventoryActions.resetMutationStatus()),
        },
    };
}
