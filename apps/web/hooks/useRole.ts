import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/lib/store';
import { FETCH_ROLE } from '@/lib/sagas/auth/roleSaga';

export function useRole() {
    const dispatch = useDispatch<AppDispatch>();

    const { data, status, error } = useSelector(
        (state: RootState) => state.role
    );

    useEffect(() => {
        if (status === 'idle') {
            dispatch({ type: FETCH_ROLE });
        }
    }, [dispatch, status]);

    return {
        data,
        isLoading: status === 'loading',
        isPending: status === 'loading',
        isError: status === 'failed',
        isSuccess: status === 'succeeded',
        error: error ? new Error(error) : null,
        refetch: () => {
            dispatch({ type: FETCH_ROLE });
        },
    };
}
