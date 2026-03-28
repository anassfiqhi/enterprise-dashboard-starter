import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/lib/store';
import { authClient } from '@/lib/auth-client';
import { FETCH_RESERVATIONS } from '@/lib/sagas/reservations/reservationsSaga';

/**
 * Redux Saga hook for reservations list with filters
 * Automatically scopes to the current active hotel
 */
export function useReservations() {
    const dispatch = useDispatch<AppDispatch>();
    const filters = useSelector((state: RootState) => state.filters.reservations);
    const { data: activeOrg } = authClient.useActiveOrganization();
    const hotelId = activeOrg?.id;

    const { data: listData, status, error } = useSelector(
        (state: RootState) => state.reservationsData.list,
    );

    const prevParams = useRef<string>('');

    useEffect(() => {
        if (!hotelId) return;
        const paramsKey = JSON.stringify({ hotelId, ...filters });
        if (paramsKey === prevParams.current) return;
        prevParams.current = paramsKey;
        dispatch({
            type: FETCH_RESERVATIONS,
            payload: {
                hotelId,
                page: filters.page,
                pageSize: filters.pageSize,
                search: filters.search,
                status: filters.status,
                checkInFrom: filters.checkInFrom,
                checkInTo: filters.checkInTo,
                sort: filters.sort,
            },
        });
    }, [dispatch, hotelId, filters]);

    return {
        data: {
            data: listData.items,
            meta: listData.meta,
        },
        isLoading: status === 'loading',
        isPending: status === 'loading',
        isError: status === 'failed',
        isSuccess: status === 'succeeded',
        error: error ? new Error(error) : null,
        refetch: () => {
            if (hotelId) {
                dispatch({
                    type: FETCH_RESERVATIONS,
                    payload: {
                        hotelId,
                        page: filters.page,
                        pageSize: filters.pageSize,
                        search: filters.search,
                        status: filters.status,
                        checkInFrom: filters.checkInFrom,
                        checkInTo: filters.checkInTo,
                        sort: filters.sort,
                    },
                });
            }
        },
    };
}
