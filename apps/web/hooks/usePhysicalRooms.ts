import { useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/lib/store';
import type { PhysicalRoomStatus } from '@repo/shared';
import {
    FETCH_PHYSICAL_ROOMS,
    CREATE_PHYSICAL_ROOM,
    UPDATE_PHYSICAL_ROOM,
    DELETE_PHYSICAL_ROOM,
} from '@/lib/sagas/physicalRooms/physicalRoomsSaga';
import { physicalRoomsActions } from '@/lib/reducers/physicalRooms/physicalRoomsSlice';

// Input types for mutations
export interface CreatePhysicalRoomInput {
    hotelId: string;
    roomTypeId: string;
    code: string;
    floor?: number;
    status?: PhysicalRoomStatus;
    notes?: string;
}

export interface UpdatePhysicalRoomInput {
    id: string;
    hotelId: string;
    roomTypeId: string;
    code?: string;
    floor?: number;
    status?: PhysicalRoomStatus;
    notes?: string;
}

export interface DeletePhysicalRoomInput {
    id: string;
    hotelId: string;
    roomTypeId: string;
}

export function usePhysicalRooms(hotelId: string | undefined, roomTypeId: string | undefined) {
    const dispatch = useDispatch<AppDispatch>();

    const { data, status, error } = useSelector(
        (state: RootState) => state.physicalRooms.list
    );

    const prevParams = useRef<string>('');

    useEffect(() => {
        if (!hotelId || !roomTypeId) return;
        const paramsKey = JSON.stringify({ hotelId, roomTypeId });
        if (paramsKey === prevParams.current) return;
        prevParams.current = paramsKey;
        dispatch({
            type: FETCH_PHYSICAL_ROOMS,
            payload: { hotelId, roomTypeId },
        });
    }, [dispatch, hotelId, roomTypeId]);

    return {
        data,
        isLoading: status === 'loading',
        isPending: status === 'loading',
        isError: status === 'failed',
        isSuccess: status === 'succeeded',
        error: error ? new Error(error) : null,
        refetch: () => {
            if (hotelId && roomTypeId) {
                dispatch({
                    type: FETCH_PHYSICAL_ROOMS,
                    payload: { hotelId, roomTypeId },
                });
            }
        },
    };
}

export function usePhysicalRoomMutations() {
    const dispatch = useDispatch<AppDispatch>();
    const createStatus = useSelector((state: RootState) => state.physicalRooms.createStatus);
    const updateStatus = useSelector((state: RootState) => state.physicalRooms.updateStatus);
    const deleteStatus = useSelector((state: RootState) => state.physicalRooms.deleteStatus);

    const createMutateAsync = useCallback(
        (input: CreatePhysicalRoomInput): Promise<unknown> => {
            const { hotelId, roomTypeId, ...body } = input;
            return new Promise((resolve, reject) => {
                dispatch({
                    type: CREATE_PHYSICAL_ROOM,
                    payload: { hotelId, roomTypeId, body, resolve, reject },
                });
            });
        },
        [dispatch]
    );

    const createMutate = useCallback(
        (input: CreatePhysicalRoomInput) => {
            const { hotelId, roomTypeId, ...body } = input;
            dispatch({
                type: CREATE_PHYSICAL_ROOM,
                payload: { hotelId, roomTypeId, body },
            });
        },
        [dispatch]
    );

    const updateMutateAsync = useCallback(
        (input: UpdatePhysicalRoomInput): Promise<unknown> => {
            const { id, hotelId, roomTypeId, ...body } = input;
            return new Promise((resolve, reject) => {
                dispatch({
                    type: UPDATE_PHYSICAL_ROOM,
                    payload: { hotelId, roomTypeId, id, body, resolve, reject },
                });
            });
        },
        [dispatch]
    );

    const updateMutate = useCallback(
        (input: UpdatePhysicalRoomInput) => {
            const { id, hotelId, roomTypeId, ...body } = input;
            dispatch({
                type: UPDATE_PHYSICAL_ROOM,
                payload: { hotelId, roomTypeId, id, body },
            });
        },
        [dispatch]
    );

    const deleteMutateAsync = useCallback(
        (input: DeletePhysicalRoomInput): Promise<unknown> => {
            const { id, hotelId, roomTypeId } = input;
            return new Promise((resolve, reject) => {
                dispatch({
                    type: DELETE_PHYSICAL_ROOM,
                    payload: { hotelId, roomTypeId, id, resolve, reject },
                });
            });
        },
        [dispatch]
    );

    const deleteMutate = useCallback(
        (input: DeletePhysicalRoomInput) => {
            const { id, hotelId, roomTypeId } = input;
            dispatch({
                type: DELETE_PHYSICAL_ROOM,
                payload: { hotelId, roomTypeId, id },
            });
        },
        [dispatch]
    );

    const reset = useCallback(
        () => dispatch(physicalRoomsActions.resetMutationStatus()),
        [dispatch]
    );

    return {
        createPhysicalRoom: {
            mutate: createMutate,
            mutateAsync: createMutateAsync,
            isPending: createStatus === 'loading',
            isError: createStatus === 'failed',
            isSuccess: createStatus === 'succeeded',
            reset,
        },
        updatePhysicalRoom: {
            mutate: updateMutate,
            mutateAsync: updateMutateAsync,
            isPending: updateStatus === 'loading',
            isError: updateStatus === 'failed',
            isSuccess: updateStatus === 'succeeded',
            reset,
        },
        deletePhysicalRoom: {
            mutate: deleteMutate,
            mutateAsync: deleteMutateAsync,
            isPending: deleteStatus === 'loading',
            isError: deleteStatus === 'failed',
            isSuccess: deleteStatus === 'succeeded',
            reset,
        },
    };
}
