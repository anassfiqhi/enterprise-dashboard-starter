import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/lib/store';
import { FETCH_HOTEL } from '@/lib/sagas/hotels/hotelsSaga';

export type { HotelDetail } from '@/lib/reducers/hotels/hotelsSlice';

/**
 * Redux Saga hook for single hotel with room types and activities
 */
export function useHotel(hotelId: string | undefined) {
    const dispatch = useDispatch<AppDispatch>();

    const { data, status, error } = useSelector(
        (state: RootState) => state.hotels.detail
    );

    const prevHotelId = useRef<string | undefined>(undefined);

    useEffect(() => {
        if (!hotelId || hotelId === prevHotelId.current) return;
        prevHotelId.current = hotelId;
        dispatch({ type: FETCH_HOTEL, payload: { hotelId } });
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
                dispatch({ type: FETCH_HOTEL, payload: { hotelId } });
            }
        },
    };
}
