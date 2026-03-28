import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/lib/store';
import { FETCH_RESERVATION } from '@/lib/sagas/reservations/reservationsSaga';

export type { ReservationWithPayments } from '@/lib/reducers/reservations/reservationsDataSlice';

/**
 * Redux Saga hook for single reservation with payments
 */
export function useReservation(id: string | null) {
    const dispatch = useDispatch<AppDispatch>();

    const { data, status, error } = useSelector(
        (state: RootState) => state.reservationsData.detail,
    );

    const prevId = useRef<string | null>(undefined);

    useEffect(() => {
        if (!id || id === prevId.current) return;
        prevId.current = id;
        dispatch({ type: FETCH_RESERVATION, payload: { id } });
    }, [dispatch, id]);

    return {
        data,
        isLoading: status === 'loading',
        isPending: status === 'loading',
        isError: status === 'failed',
        isSuccess: status === 'succeeded',
        error: error ? new Error(error) : null,
        refetch: () => {
            if (id) {
                dispatch({ type: FETCH_RESERVATION, payload: { id } });
            }
        },
    };
}
