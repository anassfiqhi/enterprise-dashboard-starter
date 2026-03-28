import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/lib/store';
import type { Guest } from '@repo/shared';
import { authClient } from '@/lib/auth-client';
import { CREATE_GUEST, UPDATE_GUEST, DELETE_GUEST } from '@/lib/sagas/guests/guestsSaga';
import { guestsActions } from '@/lib/reducers/guests/guestsSlice';

export type IdType = 'passport' | 'drivers_license' | 'national_id';

export interface CreateGuestInput {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    nationality?: string;
    idType?: IdType;
    idNumber?: string;
    notes?: string;
}

export interface UpdateGuestInput extends Partial<CreateGuestInput> {
    id: string;
}

/**
 * Redux Saga hook for guest CRUD mutations
 * Automatically associates guests with the current active hotel
 */
export function useGuestMutations() {
    const dispatch = useDispatch<AppDispatch>();
    const { data: activeOrg } = authClient.useActiveOrganization();
    const hotelId = activeOrg?.id;

    const createStatus = useSelector((state: RootState) => state.guests.createStatus);
    const updateStatus = useSelector((state: RootState) => state.guests.updateStatus);
    const deleteStatus = useSelector((state: RootState) => state.guests.deleteStatus);

    const createGuest = {
        mutate: useCallback(
            (input: CreateGuestInput) => {
                dispatch({ type: CREATE_GUEST, payload: { input, hotelId } });
            },
            [dispatch, hotelId]
        ),
        mutateAsync: useCallback(
            (input: CreateGuestInput): Promise<Guest> => {
                return new Promise((resolve, reject) => {
                    dispatch({
                        type: CREATE_GUEST,
                        payload: { input, hotelId, resolve, reject },
                    });
                });
            },
            [dispatch, hotelId]
        ),
        isPending: createStatus === 'loading',
        isError: createStatus === 'failed',
        isSuccess: createStatus === 'succeeded',
        reset: () => dispatch(guestsActions.resetMutationStatus()),
    };

    const updateGuest = {
        mutate: useCallback(
            ({ id, ...input }: UpdateGuestInput) => {
                dispatch({
                    type: UPDATE_GUEST,
                    payload: { guestId: id, input, hotelId },
                });
            },
            [dispatch, hotelId]
        ),
        mutateAsync: useCallback(
            ({ id, ...input }: UpdateGuestInput): Promise<Guest> => {
                return new Promise((resolve, reject) => {
                    dispatch({
                        type: UPDATE_GUEST,
                        payload: { guestId: id, input, hotelId, resolve, reject },
                    });
                });
            },
            [dispatch, hotelId]
        ),
        isPending: updateStatus === 'loading',
        isError: updateStatus === 'failed',
        isSuccess: updateStatus === 'succeeded',
        reset: () => dispatch(guestsActions.resetMutationStatus()),
    };

    const deleteGuest = {
        mutate: useCallback(
            (guestId: string) => {
                dispatch({
                    type: DELETE_GUEST,
                    payload: { guestId, hotelId },
                });
            },
            [dispatch, hotelId]
        ),
        mutateAsync: useCallback(
            (guestId: string): Promise<string> => {
                return new Promise((resolve, reject) => {
                    dispatch({
                        type: DELETE_GUEST,
                        payload: { guestId, hotelId, resolve, reject },
                    });
                });
            },
            [dispatch, hotelId]
        ),
        isPending: deleteStatus === 'loading',
        isError: deleteStatus === 'failed',
        isSuccess: deleteStatus === 'succeeded',
        reset: () => dispatch(guestsActions.resetMutationStatus()),
    };

    return {
        createGuest,
        updateGuest,
        deleteGuest,
    };
}
