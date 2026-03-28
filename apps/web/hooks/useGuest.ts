import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/lib/store';
import { FETCH_GUEST } from '@/lib/sagas/guests/guestsSaga';

export type { GuestDetail, GuestStats } from '@/lib/reducers/guests/guestsSlice';

/**
 * Redux Saga hook for single guest with reservation history
 */
export function useGuest(guestId: string | undefined) {
    const dispatch = useDispatch<AppDispatch>();

    const { data, status, error } = useSelector(
        (state: RootState) => state.guests.detail
    );

    const prevGuestId = useRef<string | undefined>(undefined);

    useEffect(() => {
        if (!guestId || guestId === prevGuestId.current) return;
        prevGuestId.current = guestId;
        dispatch({ type: FETCH_GUEST, payload: { guestId } });
    }, [dispatch, guestId]);

    return {
        data,
        isLoading: status === 'loading',
        isPending: status === 'loading',
        isError: status === 'failed',
        isSuccess: status === 'succeeded',
        error: error ? new Error(error) : null,
        refetch: () => {
            if (guestId) {
                dispatch({ type: FETCH_GUEST, payload: { guestId } });
            }
        },
    };
}
