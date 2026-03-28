"use client";

import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/lib/store';
import { FETCH_ADMIN_ORGANIZATIONS } from '@/lib/sagas/admin/adminSaga';

/**
 * Redux Saga hook for listing all organizations (super admin only)
 * Used for "add to org" dropdown
 */
export function useAdminOrganizations() {
    const dispatch = useDispatch<AppDispatch>();

    const { data, status, error } = useSelector(
        (state: RootState) => state.admin.organizations
    );

    const hasFetched = useRef(false);

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;
        dispatch({ type: FETCH_ADMIN_ORGANIZATIONS });
    }, [dispatch]);

    return {
        data,
        isLoading: status === 'loading',
        isPending: status === 'loading',
        isError: status === 'failed',
        isSuccess: status === 'succeeded',
        error: error ? new Error(error) : null,
        refetch: () => {
            dispatch({ type: FETCH_ADMIN_ORGANIZATIONS });
        },
    };
}
