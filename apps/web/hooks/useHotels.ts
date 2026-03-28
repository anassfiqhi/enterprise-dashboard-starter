import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/lib/store';
import { FETCH_HOTELS } from '@/lib/sagas/hotels/hotelsSaga';

/**
 * Redux Saga hook for hotels list with optional search
 */
export function useHotels(search?: string) {
    const dispatch = useDispatch<AppDispatch>();

    const { data, status, error } = useSelector(
        (state: RootState) => state.hotels.list
    );

    const prevParams = useRef<string | undefined>(undefined);

    useEffect(() => {
        const paramsKey = search ?? '';
        if (paramsKey === prevParams.current) return;
        prevParams.current = paramsKey;
        dispatch({ type: FETCH_HOTELS, payload: { search } });
    }, [dispatch, search]);

    return {
        data,
        isLoading: status === 'loading',
        isPending: status === 'loading',
        isError: status === 'failed',
        isSuccess: status === 'succeeded',
        error: error ? new Error(error) : null,
        refetch: () => {
            dispatch({ type: FETCH_HOTELS, payload: { search } });
        },
    };
}
