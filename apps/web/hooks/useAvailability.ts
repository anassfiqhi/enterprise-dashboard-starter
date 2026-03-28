import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/lib/store';
import { authClient } from '@/lib/auth-client';
import { FETCH_AVAILABILITY } from '@/lib/sagas/availability/availabilitySaga';

/**
 * Redux Saga hook for availability data
 * Automatically scopes to the current active hotel
 */
export function useAvailability() {
    const dispatch = useDispatch<AppDispatch>();
    const { viewType, startDate, endDate } = useSelector(
        (state: RootState) => state.filters.availability
    );
    const { data: activeOrg } = authClient.useActiveOrganization();
    const hotelId = activeOrg?.id;

    const { data: listData, status, error } = useSelector(
        (state: RootState) => state.availabilityData
    );

    const prevParams = useRef<string>('');

    useEffect(() => {
        if (!hotelId) return;
        const paramsKey = JSON.stringify({ hotelId, viewType, startDate, endDate });
        if (paramsKey === prevParams.current) return;
        prevParams.current = paramsKey;
        dispatch({
            type: FETCH_AVAILABILITY,
            payload: { hotelId, viewType, startDate, endDate },
        });
    }, [dispatch, hotelId, viewType, startDate, endDate]);

    return {
        data: status === 'succeeded' ? { data: listData.items, meta: listData.meta } : undefined,
        isLoading: status === 'loading',
        isPending: status === 'loading',
        isError: status === 'failed',
        isSuccess: status === 'succeeded',
        error: error ? new Error(error) : null,
        refetch: () => {
            if (hotelId) {
                dispatch({
                    type: FETCH_AVAILABILITY,
                    payload: { hotelId, viewType, startDate, endDate },
                });
            }
        },
    };
}
