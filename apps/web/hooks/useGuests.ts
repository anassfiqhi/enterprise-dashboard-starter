import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/lib/store';
import { authClient } from '@/lib/auth-client';
import { FETCH_GUESTS } from '@/lib/sagas/guests/guestsSaga';

export type { GuestWithStats } from '@/lib/reducers/guests/guestsSlice';

export interface GuestsFilters {
    search?: string;
    page?: number;
    pageSize?: number;
}

/**
 * Redux Saga hook for guests list with search and pagination
 * Automatically scopes to the current active hotel
 */
export function useGuests(filters: GuestsFilters = {}) {
    const { search = '', page = 1, pageSize = 20 } = filters;
    const dispatch = useDispatch<AppDispatch>();
    const { data: activeOrg } = authClient.useActiveOrganization();
    const hotelId = activeOrg?.id;

    const { data: listData, status, error } = useSelector(
        (state: RootState) => state.guests.list
    );

    const prevParams = useRef<string>('');

    useEffect(() => {
        if (!hotelId) return;
        const paramsKey = JSON.stringify({ hotelId, search, page, pageSize });
        if (paramsKey === prevParams.current) return;
        prevParams.current = paramsKey;
        dispatch({
            type: FETCH_GUESTS,
            payload: { hotelId, search, page, pageSize },
        });
    }, [dispatch, hotelId, search, page, pageSize]);

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
                    type: FETCH_GUESTS,
                    payload: { hotelId, search, page, pageSize },
                });
            }
        },
    };
}
