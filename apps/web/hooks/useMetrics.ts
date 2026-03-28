import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/lib/store';
import { authClient } from '@/lib/auth-client';
import { FETCH_METRICS } from '@/lib/sagas/metrics/metricsSaga';

/**
 * Redux Saga hook for dashboard metrics
 * Automatically scopes to the current active hotel
 */
export function useMetrics() {
    const dispatch = useDispatch<AppDispatch>();
    const { data: activeOrg } = authClient.useActiveOrganization();
    const hotelId = activeOrg?.id;

    const { data, status, error } = useSelector(
        (state: RootState) => state.metrics.dashboard
    );

    const prevHotelId = useRef<string | undefined>(undefined);

    useEffect(() => {
        if (!hotelId || hotelId === prevHotelId.current) return;
        prevHotelId.current = hotelId;
        dispatch({ type: FETCH_METRICS, payload: { hotelId } });
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
                dispatch({ type: FETCH_METRICS, payload: { hotelId } });
            }
        },
    };
}
