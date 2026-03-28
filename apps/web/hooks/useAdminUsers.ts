"use client";

import { useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/lib/store';
import {
    FETCH_ADMIN_USERS,
    FETCH_ADMIN_USER,
    TOGGLE_SUPER_ADMIN,
    FETCH_USER_MEMBERSHIPS,
    ADD_USER_TO_ORG,
    UPDATE_ADMIN_MEMBER_ROLE,
    REMOVE_USER_FROM_ORG,
} from '@/lib/sagas/admin/adminSaga';
import { adminActions } from '@/lib/reducers/admin/adminSlice';

export type { Membership } from '@/lib/reducers/admin/adminSlice';

interface AdminUsersFilters {
    search?: string;
    limit?: number;
    offset?: number;
}

/**
 * Redux Saga hook for listing all users (super admin)
 */
export function useAdminUsers(filters: AdminUsersFilters = {}) {
    const { search, limit = 20, offset = 0 } = filters;
    const dispatch = useDispatch<AppDispatch>();

    const { data, status, error } = useSelector(
        (state: RootState) => state.admin.users
    );

    const prevParams = useRef<string>('');

    useEffect(() => {
        const paramsKey = JSON.stringify({ search, limit, offset });
        if (paramsKey === prevParams.current) return;
        prevParams.current = paramsKey;
        dispatch({
            type: FETCH_ADMIN_USERS,
            payload: { search, limit, offset },
        });
    }, [dispatch, search, limit, offset]);

    return {
        data,
        isLoading: status === 'loading',
        isPending: status === 'loading',
        isError: status === 'failed',
        isSuccess: status === 'succeeded',
        error: error ? new Error(error) : null,
        refetch: () => {
            dispatch({
                type: FETCH_ADMIN_USERS,
                payload: { search, limit, offset },
            });
        },
    };
}

/**
 * Redux Saga hook for fetching a single user (super admin)
 */
export function useAdminUser(userId: string | null) {
    const dispatch = useDispatch<AppDispatch>();

    const { data, status, error } = useSelector(
        (state: RootState) => state.admin.user
    );

    const prevParams = useRef<string>('');

    useEffect(() => {
        if (!userId) return;
        if (userId === prevParams.current) return;
        prevParams.current = userId;
        dispatch({
            type: FETCH_ADMIN_USER,
            payload: { userId },
        });
    }, [dispatch, userId]);

    return {
        data,
        isLoading: status === 'loading',
        isPending: status === 'loading',
        isError: status === 'failed',
        isSuccess: status === 'succeeded',
        error: error ? new Error(error) : null,
        refetch: () => {
            if (userId) {
                dispatch({
                    type: FETCH_ADMIN_USER,
                    payload: { userId },
                });
            }
        },
    };
}

/**
 * Redux Saga mutation hook to toggle super admin status
 */
export function useToggleSuperAdmin() {
    const dispatch = useDispatch<AppDispatch>();

    const toggleStatus = useSelector(
        (state: RootState) => state.admin.toggleSuperAdminStatus
    );

    return {
        mutate: useCallback(
            ({ userId, isAdmin }: { userId: string; isAdmin: boolean }) => {
                dispatch({
                    type: TOGGLE_SUPER_ADMIN,
                    payload: { userId, isAdmin },
                });
            },
            [dispatch]
        ),
        mutateAsync: useCallback(
            ({ userId, isAdmin }: { userId: string; isAdmin: boolean }): Promise<unknown> => {
                return new Promise((resolve, reject) => {
                    dispatch({
                        type: TOGGLE_SUPER_ADMIN,
                        payload: { userId, isAdmin, resolve, reject },
                    });
                });
            },
            [dispatch]
        ),
        isPending: toggleStatus === 'loading',
        isError: toggleStatus === 'failed',
        isSuccess: toggleStatus === 'succeeded',
        reset: () => dispatch(adminActions.resetMutationStatus()),
    };
}

/**
 * Redux Saga hook for fetching a user's org memberships
 */
export function useUserMemberships(userId: string | null) {
    const dispatch = useDispatch<AppDispatch>();

    const { data, status, error } = useSelector(
        (state: RootState) => state.admin.memberships
    );

    const prevParams = useRef<string>('');

    useEffect(() => {
        if (!userId) return;
        if (userId === prevParams.current) return;
        prevParams.current = userId;
        dispatch({
            type: FETCH_USER_MEMBERSHIPS,
            payload: { userId },
        });
    }, [dispatch, userId]);

    return {
        data,
        isLoading: status === 'loading',
        isPending: status === 'loading',
        isError: status === 'failed',
        isSuccess: status === 'succeeded',
        error: error ? new Error(error) : null,
        refetch: () => {
            if (userId) {
                dispatch({
                    type: FETCH_USER_MEMBERSHIPS,
                    payload: { userId },
                });
            }
        },
    };
}

/**
 * Redux Saga mutation hook to add a user to an organization
 */
export function useAddUserToOrg() {
    const dispatch = useDispatch<AppDispatch>();

    const addStatus = useSelector(
        (state: RootState) => state.admin.addToOrgStatus
    );

    return {
        mutate: useCallback(
            ({
                userId,
                organizationId,
                role,
            }: {
                userId: string;
                organizationId: string;
                role: 'admin' | 'staff';
            }) => {
                dispatch({
                    type: ADD_USER_TO_ORG,
                    payload: { userId, organizationId, role },
                });
            },
            [dispatch]
        ),
        mutateAsync: useCallback(
            ({
                userId,
                organizationId,
                role,
            }: {
                userId: string;
                organizationId: string;
                role: 'admin' | 'staff';
            }): Promise<unknown> => {
                return new Promise((resolve, reject) => {
                    dispatch({
                        type: ADD_USER_TO_ORG,
                        payload: { userId, organizationId, role, resolve, reject },
                    });
                });
            },
            [dispatch]
        ),
        isPending: addStatus === 'loading',
        isError: addStatus === 'failed',
        isSuccess: addStatus === 'succeeded',
        reset: () => dispatch(adminActions.resetMutationStatus()),
    };
}

/**
 * Redux Saga mutation hook to update a user's role in an organization
 */
export function useUpdateMemberRole() {
    const dispatch = useDispatch<AppDispatch>();

    const updateStatus = useSelector(
        (state: RootState) => state.admin.updateRoleStatus
    );

    return {
        mutate: useCallback(
            ({
                userId,
                membershipId,
                role,
            }: {
                userId: string;
                membershipId: string;
                role: 'admin' | 'staff';
            }) => {
                dispatch({
                    type: UPDATE_ADMIN_MEMBER_ROLE,
                    payload: { userId, membershipId, role },
                });
            },
            [dispatch]
        ),
        mutateAsync: useCallback(
            ({
                userId,
                membershipId,
                role,
            }: {
                userId: string;
                membershipId: string;
                role: 'admin' | 'staff';
            }): Promise<unknown> => {
                return new Promise((resolve, reject) => {
                    dispatch({
                        type: UPDATE_ADMIN_MEMBER_ROLE,
                        payload: { userId, membershipId, role, resolve, reject },
                    });
                });
            },
            [dispatch]
        ),
        isPending: updateStatus === 'loading',
        isError: updateStatus === 'failed',
        isSuccess: updateStatus === 'succeeded',
        reset: () => dispatch(adminActions.resetMutationStatus()),
    };
}

/**
 * Redux Saga mutation hook to remove a user from an organization
 */
export function useRemoveUserFromOrg() {
    const dispatch = useDispatch<AppDispatch>();

    const removeStatus = useSelector(
        (state: RootState) => state.admin.removeFromOrgStatus
    );

    return {
        mutate: useCallback(
            ({ userId, membershipId }: { userId: string; membershipId: string }) => {
                dispatch({
                    type: REMOVE_USER_FROM_ORG,
                    payload: { userId, membershipId },
                });
            },
            [dispatch]
        ),
        mutateAsync: useCallback(
            ({
                userId,
                membershipId,
            }: {
                userId: string;
                membershipId: string;
            }): Promise<unknown> => {
                return new Promise((resolve, reject) => {
                    dispatch({
                        type: REMOVE_USER_FROM_ORG,
                        payload: { userId, membershipId, resolve, reject },
                    });
                });
            },
            [dispatch]
        ),
        isPending: removeStatus === 'loading',
        isError: removeStatus === 'failed',
        isSuccess: removeStatus === 'succeeded',
        reset: () => dispatch(adminActions.resetMutationStatus()),
    };
}
