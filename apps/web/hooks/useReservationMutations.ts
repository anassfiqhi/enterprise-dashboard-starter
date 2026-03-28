import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/lib/store';
import type { Reservation, ReservationStatus, Payment } from '@repo/shared';
import { authClient } from '@/lib/auth-client';
import {
    CREATE_RESERVATION,
    UPDATE_RESERVATION_STATUS,
    CANCEL_RESERVATION,
    REFUND_RESERVATION,
} from '@/lib/sagas/reservations/reservationsSaga';
import { reservationsDataActions } from '@/lib/reducers/reservations/reservationsDataSlice';

export interface CreateReservationInput {
    guestId: string;
    hotelId: string;
    roomTypeId?: string;
    activityTypeId?: string;
    checkInDate?: string;
    checkOutDate?: string;
    guests: number;
    specialRequests?: string;
}

/**
 * Redux Saga hook combining all reservation mutations
 * Automatically associates with the current active hotel
 */
export function useReservationMutations() {
    const dispatch = useDispatch<AppDispatch>();
    const { data: activeOrg } = authClient.useActiveOrganization();
    const hotelId = activeOrg?.id;

    const createStatus = useSelector((state: RootState) => state.reservationsData.createStatus);
    const updateStatusStatus = useSelector((state: RootState) => state.reservationsData.updateStatusStatus);
    const cancelStatus = useSelector((state: RootState) => state.reservationsData.cancelStatus);
    const refundStatus = useSelector((state: RootState) => state.reservationsData.refundStatus);

    const createReservation = {
        mutate: useCallback(
            (input: CreateReservationInput) => {
                dispatch({
                    type: CREATE_RESERVATION,
                    payload: { input, hotelId },
                });
            },
            [dispatch, hotelId],
        ),
        mutateAsync: useCallback(
            (input: CreateReservationInput): Promise<Reservation> => {
                return new Promise((resolve, reject) => {
                    dispatch({
                        type: CREATE_RESERVATION,
                        payload: { input, hotelId, resolve, reject },
                    });
                });
            },
            [dispatch, hotelId],
        ),
        isPending: createStatus === 'loading',
        isError: createStatus === 'failed',
        isSuccess: createStatus === 'succeeded',
        reset: () => dispatch(reservationsDataActions.resetMutationStatus()),
    };

    const updateStatus = {
        mutate: useCallback(
            ({ id, status }: { id: string; status: ReservationStatus }) => {
                dispatch({
                    type: UPDATE_RESERVATION_STATUS,
                    payload: { id, status, hotelId },
                });
            },
            [dispatch, hotelId],
        ),
        mutateAsync: useCallback(
            ({ id, status }: { id: string; status: ReservationStatus }): Promise<Reservation> => {
                return new Promise((resolve, reject) => {
                    dispatch({
                        type: UPDATE_RESERVATION_STATUS,
                        payload: { id, status, hotelId, resolve, reject },
                    });
                });
            },
            [dispatch, hotelId],
        ),
        isPending: updateStatusStatus === 'loading',
        isError: updateStatusStatus === 'failed',
        isSuccess: updateStatusStatus === 'succeeded',
        reset: () => dispatch(reservationsDataActions.resetMutationStatus()),
    };

    const cancel = {
        mutate: useCallback(
            ({ id, reason }: { id: string; reason?: string }) => {
                dispatch({
                    type: CANCEL_RESERVATION,
                    payload: { id, reason, hotelId },
                });
            },
            [dispatch, hotelId],
        ),
        mutateAsync: useCallback(
            ({ id, reason }: { id: string; reason?: string }): Promise<Reservation> => {
                return new Promise((resolve, reject) => {
                    dispatch({
                        type: CANCEL_RESERVATION,
                        payload: { id, reason, hotelId, resolve, reject },
                    });
                });
            },
            [dispatch, hotelId],
        ),
        isPending: cancelStatus === 'loading',
        isError: cancelStatus === 'failed',
        isSuccess: cancelStatus === 'succeeded',
        reset: () => dispatch(reservationsDataActions.resetMutationStatus()),
    };

    const refund = {
        mutate: useCallback(
            ({ id, amount, reason }: { id: string; amount?: number; reason?: string }) => {
                dispatch({
                    type: REFUND_RESERVATION,
                    payload: { id, amount, reason, hotelId },
                });
            },
            [dispatch, hotelId],
        ),
        mutateAsync: useCallback(
            ({ id, amount, reason }: { id: string; amount?: number; reason?: string }): Promise<Payment> => {
                return new Promise((resolve, reject) => {
                    dispatch({
                        type: REFUND_RESERVATION,
                        payload: { id, amount, reason, hotelId, resolve, reject },
                    });
                });
            },
            [dispatch, hotelId],
        ),
        isPending: refundStatus === 'loading',
        isError: refundStatus === 'failed',
        isSuccess: refundStatus === 'succeeded',
        reset: () => dispatch(reservationsDataActions.resetMutationStatus()),
    };

    return {
        createReservation,
        updateStatus,
        cancel,
        refund,
    };
}

/**
 * Standalone hook for updating reservation status
 */
export function useUpdateReservationStatus() {
    const dispatch = useDispatch<AppDispatch>();
    const { data: activeOrg } = authClient.useActiveOrganization();
    const hotelId = activeOrg?.id;

    const status = useSelector((state: RootState) => state.reservationsData.updateStatusStatus);

    return {
        mutate: useCallback(
            ({ id, status }: { id: string; status: ReservationStatus }) => {
                dispatch({
                    type: UPDATE_RESERVATION_STATUS,
                    payload: { id, status, hotelId },
                });
            },
            [dispatch, hotelId],
        ),
        mutateAsync: useCallback(
            ({ id, status }: { id: string; status: ReservationStatus }): Promise<Reservation> => {
                return new Promise((resolve, reject) => {
                    dispatch({
                        type: UPDATE_RESERVATION_STATUS,
                        payload: { id, status, hotelId, resolve, reject },
                    });
                });
            },
            [dispatch, hotelId],
        ),
        isPending: status === 'loading',
        isError: status === 'failed',
        isSuccess: status === 'succeeded',
        reset: () => dispatch(reservationsDataActions.resetMutationStatus()),
    };
}

/**
 * Standalone hook for cancelling a reservation
 */
export function useCancelReservation() {
    const dispatch = useDispatch<AppDispatch>();
    const { data: activeOrg } = authClient.useActiveOrganization();
    const hotelId = activeOrg?.id;

    const status = useSelector((state: RootState) => state.reservationsData.cancelStatus);

    return {
        mutate: useCallback(
            ({ id, reason }: { id: string; reason?: string }) => {
                dispatch({
                    type: CANCEL_RESERVATION,
                    payload: { id, reason, hotelId },
                });
            },
            [dispatch, hotelId],
        ),
        mutateAsync: useCallback(
            ({ id, reason }: { id: string; reason?: string }): Promise<Reservation> => {
                return new Promise((resolve, reject) => {
                    dispatch({
                        type: CANCEL_RESERVATION,
                        payload: { id, reason, hotelId, resolve, reject },
                    });
                });
            },
            [dispatch, hotelId],
        ),
        isPending: status === 'loading',
        isError: status === 'failed',
        isSuccess: status === 'succeeded',
        reset: () => dispatch(reservationsDataActions.resetMutationStatus()),
    };
}

/**
 * Standalone hook for refunding a reservation
 */
export function useRefundReservation() {
    const dispatch = useDispatch<AppDispatch>();
    const { data: activeOrg } = authClient.useActiveOrganization();
    const hotelId = activeOrg?.id;

    const status = useSelector((state: RootState) => state.reservationsData.refundStatus);

    return {
        mutate: useCallback(
            ({ id, amount, reason }: { id: string; amount?: number; reason?: string }) => {
                dispatch({
                    type: REFUND_RESERVATION,
                    payload: { id, amount, reason, hotelId },
                });
            },
            [dispatch, hotelId],
        ),
        mutateAsync: useCallback(
            ({ id, amount, reason }: { id: string; amount?: number; reason?: string }): Promise<Payment> => {
                return new Promise((resolve, reject) => {
                    dispatch({
                        type: REFUND_RESERVATION,
                        payload: { id, amount, reason, hotelId, resolve, reject },
                    });
                });
            },
            [dispatch, hotelId],
        ),
        isPending: status === 'loading',
        isError: status === 'failed',
        isSuccess: status === 'succeeded',
        reset: () => dispatch(reservationsDataActions.resetMutationStatus()),
    };
}
