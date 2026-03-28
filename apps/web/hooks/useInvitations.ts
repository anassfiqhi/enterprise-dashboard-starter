"use client";

import { useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/lib/store';
import { authClient } from '@/lib/auth-client';
import {
    FETCH_INVITATIONS,
    INVITE_MEMBER,
    CANCEL_INVITATION,
} from '@/lib/sagas/invitations/invitationsSaga';
import { invitationsActions } from '@/lib/reducers/invitations/invitationsSlice';

/**
 * Redux Saga hook for organization invitations
 * Automatically scopes to the current active organization
 */
export function useInvitations() {
    const dispatch = useDispatch<AppDispatch>();
    const { data: activeOrg } = authClient.useActiveOrganization();
    const organizationId = activeOrg?.id;

    const { data, status, error } = useSelector(
        (state: RootState) => state.invitations.list
    );

    const prevParams = useRef<string>('');

    useEffect(() => {
        if (!organizationId) return;
        const paramsKey = organizationId;
        if (paramsKey === prevParams.current) return;
        prevParams.current = paramsKey;
        dispatch({
            type: FETCH_INVITATIONS,
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
                    type: FETCH_INVITATIONS,
                    payload: { organizationId },
                });
            }
        },
    };
}

/**
 * Redux Saga mutation hook for inviting a new member
 */
export function useInviteMember() {
    const dispatch = useDispatch<AppDispatch>();
    const { data: activeOrg } = authClient.useActiveOrganization();
    const organizationId = activeOrg?.id;

    const inviteStatus = useSelector(
        (state: RootState) => state.invitations.inviteStatus
    );

    return {
        mutate: useCallback(
            ({ email, role }: { email: string; role: string }) => {
                if (!organizationId) return;
                dispatch({
                    type: INVITE_MEMBER,
                    payload: { organizationId, email, role },
                });
            },
            [dispatch, organizationId]
        ),
        mutateAsync: useCallback(
            ({ email, role }: { email: string; role: string }): Promise<unknown> => {
                return new Promise((resolve, reject) => {
                    if (!organizationId) {
                        reject(new Error('No active organization'));
                        return;
                    }
                    dispatch({
                        type: INVITE_MEMBER,
                        payload: { organizationId, email, role, resolve, reject },
                    });
                });
            },
            [dispatch, organizationId]
        ),
        isPending: inviteStatus === 'loading',
        isError: inviteStatus === 'failed',
        isSuccess: inviteStatus === 'succeeded',
        reset: () => dispatch(invitationsActions.resetMutationStatus()),
    };
}

/**
 * Redux Saga mutation hook for cancelling a pending invitation
 */
export function useCancelInvitation() {
    const dispatch = useDispatch<AppDispatch>();
    const { data: activeOrg } = authClient.useActiveOrganization();
    const organizationId = activeOrg?.id;

    const cancelStatus = useSelector(
        (state: RootState) => state.invitations.cancelStatus
    );

    return {
        mutate: useCallback(
            ({ invitationId }: { invitationId: string }) => {
                if (!organizationId) return;
                dispatch({
                    type: CANCEL_INVITATION,
                    payload: { organizationId, invitationId },
                });
            },
            [dispatch, organizationId]
        ),
        mutateAsync: useCallback(
            ({ invitationId }: { invitationId: string }): Promise<unknown> => {
                return new Promise((resolve, reject) => {
                    if (!organizationId) {
                        reject(new Error('No active organization'));
                        return;
                    }
                    dispatch({
                        type: CANCEL_INVITATION,
                        payload: { organizationId, invitationId, resolve, reject },
                    });
                });
            },
            [dispatch, organizationId]
        ),
        isPending: cancelStatus === 'loading',
        isError: cancelStatus === 'failed',
        isSuccess: cancelStatus === 'succeeded',
        reset: () => dispatch(invitationsActions.resetMutationStatus()),
    };
}
