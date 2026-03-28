"use client";

import { useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/lib/store';
import { authClient } from '@/lib/auth-client';
import {
    FETCH_MEMBERS,
    UPDATE_MEMBER_ROLE,
    REMOVE_MEMBER,
} from '@/lib/sagas/members/membersSaga';
import { membersActions } from '@/lib/reducers/members/membersSlice';

/**
 * Redux Saga hook for organization members list
 * Automatically scopes to the current active organization
 */
export function useMembers() {
    const dispatch = useDispatch<AppDispatch>();
    const { data: activeOrg } = authClient.useActiveOrganization();
    const organizationId = activeOrg?.id;

    const { data, status, error } = useSelector(
        (state: RootState) => state.members.list
    );

    const prevParams = useRef<string>('');

    useEffect(() => {
        if (!organizationId) return;
        const paramsKey = organizationId;
        if (paramsKey === prevParams.current) return;
        prevParams.current = paramsKey;
        dispatch({
            type: FETCH_MEMBERS,
            payload: { organizationId },
        });
    }, [dispatch, organizationId]);

    return {
        data,
        isLoading: status === 'loading',
        isPending: status === 'loading',
        isError: status === 'failed',
        isSuccess: status === 'succeeded',
        error: error ? new Error(error) : null,
        refetch: () => {
            if (organizationId) {
                dispatch({
                    type: FETCH_MEMBERS,
                    payload: { organizationId },
                });
            }
        },
    };
}

/**
 * Redux Saga mutation hook to update a member's role
 */
export function useUpdateMemberRole() {
    const dispatch = useDispatch<AppDispatch>();
    const { data: activeOrg } = authClient.useActiveOrganization();
    const organizationId = activeOrg?.id;

    const updateRoleStatus = useSelector(
        (state: RootState) => state.members.updateRoleStatus
    );

    return {
        mutate: useCallback(
            ({ memberId, role }: { memberId: string; role: string }) => {
                if (!organizationId) return;
                dispatch({
                    type: UPDATE_MEMBER_ROLE,
                    payload: { organizationId, memberId, role },
                });
            },
            [dispatch, organizationId]
        ),
        mutateAsync: useCallback(
            ({ memberId, role }: { memberId: string; role: string }): Promise<unknown> => {
                return new Promise((resolve, reject) => {
                    if (!organizationId) {
                        reject(new Error('No active organization'));
                        return;
                    }
                    dispatch({
                        type: UPDATE_MEMBER_ROLE,
                        payload: { organizationId, memberId, role, resolve, reject },
                    });
                });
            },
            [dispatch, organizationId]
        ),
        isPending: updateRoleStatus === 'loading',
        isError: updateRoleStatus === 'failed',
        isSuccess: updateRoleStatus === 'succeeded',
        reset: () => dispatch(membersActions.resetMutationStatus()),
    };
}

/**
 * Redux Saga mutation hook to remove a member from the organization
 */
export function useRemoveMember() {
    const dispatch = useDispatch<AppDispatch>();
    const { data: activeOrg } = authClient.useActiveOrganization();
    const organizationId = activeOrg?.id;

    const removeStatus = useSelector(
        (state: RootState) => state.members.removeStatus
    );

    return {
        mutate: useCallback(
            ({ memberIdOrEmail }: { memberIdOrEmail: string }) => {
                if (!organizationId) return;
                dispatch({
                    type: REMOVE_MEMBER,
                    payload: { organizationId, memberIdOrEmail },
                });
            },
            [dispatch, organizationId]
        ),
        mutateAsync: useCallback(
            ({ memberIdOrEmail }: { memberIdOrEmail: string }): Promise<unknown> => {
                return new Promise((resolve, reject) => {
                    if (!organizationId) {
                        reject(new Error('No active organization'));
                        return;
                    }
                    dispatch({
                        type: REMOVE_MEMBER,
                        payload: { organizationId, memberIdOrEmail, resolve, reject },
                    });
                });
            },
            [dispatch, organizationId]
        ),
        isPending: removeStatus === 'loading',
        isError: removeStatus === 'failed',
        isSuccess: removeStatus === 'succeeded',
        reset: () => dispatch(membersActions.resetMutationStatus()),
    };
}
