import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/lib/store';
import type { Hotel, RoomType, ActivityType } from '@repo/shared';
import {
    CREATE_HOTEL,
    UPDATE_HOTEL,
    DELETE_HOTEL,
    CREATE_ROOM_TYPE,
    UPDATE_ROOM_TYPE,
    DELETE_ROOM_TYPE,
    CREATE_ACTIVITY_TYPE,
    UPDATE_ACTIVITY_TYPE,
    DELETE_ACTIVITY_TYPE,
} from '@/lib/sagas/hotels/hotelsSaga';
import { hotelsActions } from '@/lib/reducers/hotels/hotelsSlice';

// ============================================================================
// Input Types
// ============================================================================

export interface CreateHotelInput {
    name: string;
    timezone: string;
    address?: {
        street?: string;
        city: string;
        state?: string;
        country: string;
        postalCode?: string;
    };
}

export interface UpdateHotelInput extends Partial<CreateHotelInput> {
    id: string;
}

export interface CreateRoomTypeInput {
    hotelId: string;
    name: string;
    capacity: number;
    description?: string;
    basePrice: number;
    currency?: string;
}

export interface UpdateRoomTypeInput extends Partial<Omit<CreateRoomTypeInput, 'hotelId'>> {
    id: string;
    hotelId: string;
}

export interface CreateActivityTypeInput {
    hotelId: string;
    name: string;
    capacityPerSlot: number;
    description?: string;
    duration: number;
    basePrice: number;
    currency?: string;
}

export interface UpdateActivityTypeInput extends Partial<Omit<CreateActivityTypeInput, 'hotelId'>> {
    id: string;
    hotelId: string;
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Redux Saga hook for hotel, room type, and activity type CRUD mutations
 */
export function useHotelMutations() {
    const dispatch = useDispatch<AppDispatch>();

    const createHotelStatus = useSelector((state: RootState) => state.hotels.createHotelStatus);
    const updateHotelStatus = useSelector((state: RootState) => state.hotels.updateHotelStatus);
    const deleteHotelStatus = useSelector((state: RootState) => state.hotels.deleteHotelStatus);
    const createRoomTypeStatus = useSelector((state: RootState) => state.hotels.createRoomTypeStatus);
    const updateRoomTypeStatus = useSelector((state: RootState) => state.hotels.updateRoomTypeStatus);
    const deleteRoomTypeStatus = useSelector((state: RootState) => state.hotels.deleteRoomTypeStatus);
    const createActivityTypeStatus = useSelector((state: RootState) => state.hotels.createActivityTypeStatus);
    const updateActivityTypeStatus = useSelector((state: RootState) => state.hotels.updateActivityTypeStatus);
    const deleteActivityTypeStatus = useSelector((state: RootState) => state.hotels.deleteActivityTypeStatus);

    // ----- Hotel CRUD -----

    const createHotel = {
        mutate: useCallback(
            (input: CreateHotelInput) => {
                dispatch({ type: CREATE_HOTEL, payload: { input } });
            },
            [dispatch]
        ),
        mutateAsync: useCallback(
            (input: CreateHotelInput): Promise<Hotel> => {
                return new Promise((resolve, reject) => {
                    dispatch({
                        type: CREATE_HOTEL,
                        payload: { input, resolve, reject },
                    });
                });
            },
            [dispatch]
        ),
        isPending: createHotelStatus === 'loading',
        isError: createHotelStatus === 'failed',
        isSuccess: createHotelStatus === 'succeeded',
        reset: () => dispatch(hotelsActions.resetMutationStatus()),
    };

    const updateHotel = {
        mutate: useCallback(
            ({ id, ...input }: UpdateHotelInput) => {
                dispatch({ type: UPDATE_HOTEL, payload: { id, input } });
            },
            [dispatch]
        ),
        mutateAsync: useCallback(
            ({ id, ...input }: UpdateHotelInput): Promise<Hotel> => {
                return new Promise((resolve, reject) => {
                    dispatch({
                        type: UPDATE_HOTEL,
                        payload: { id, input, resolve, reject },
                    });
                });
            },
            [dispatch]
        ),
        isPending: updateHotelStatus === 'loading',
        isError: updateHotelStatus === 'failed',
        isSuccess: updateHotelStatus === 'succeeded',
        reset: () => dispatch(hotelsActions.resetMutationStatus()),
    };

    const deleteHotel = {
        mutate: useCallback(
            (hotelId: string) => {
                dispatch({ type: DELETE_HOTEL, payload: { hotelId } });
            },
            [dispatch]
        ),
        mutateAsync: useCallback(
            (hotelId: string): Promise<string> => {
                return new Promise((resolve, reject) => {
                    dispatch({
                        type: DELETE_HOTEL,
                        payload: { hotelId, resolve, reject },
                    });
                });
            },
            [dispatch]
        ),
        isPending: deleteHotelStatus === 'loading',
        isError: deleteHotelStatus === 'failed',
        isSuccess: deleteHotelStatus === 'succeeded',
        reset: () => dispatch(hotelsActions.resetMutationStatus()),
    };

    // ----- Room Type CRUD -----

    const createRoomType = {
        mutate: useCallback(
            ({ hotelId, ...input }: CreateRoomTypeInput) => {
                dispatch({ type: CREATE_ROOM_TYPE, payload: { hotelId, input } });
            },
            [dispatch]
        ),
        mutateAsync: useCallback(
            ({ hotelId, ...input }: CreateRoomTypeInput): Promise<RoomType> => {
                return new Promise((resolve, reject) => {
                    dispatch({
                        type: CREATE_ROOM_TYPE,
                        payload: { hotelId, input, resolve, reject },
                    });
                });
            },
            [dispatch]
        ),
        isPending: createRoomTypeStatus === 'loading',
        isError: createRoomTypeStatus === 'failed',
        isSuccess: createRoomTypeStatus === 'succeeded',
        reset: () => dispatch(hotelsActions.resetMutationStatus()),
    };

    const updateRoomType = {
        mutate: useCallback(
            ({ id, hotelId, ...input }: UpdateRoomTypeInput) => {
                dispatch({ type: UPDATE_ROOM_TYPE, payload: { id, hotelId, input } });
            },
            [dispatch]
        ),
        mutateAsync: useCallback(
            ({ id, hotelId, ...input }: UpdateRoomTypeInput): Promise<RoomType> => {
                return new Promise((resolve, reject) => {
                    dispatch({
                        type: UPDATE_ROOM_TYPE,
                        payload: { id, hotelId, input, resolve, reject },
                    });
                });
            },
            [dispatch]
        ),
        isPending: updateRoomTypeStatus === 'loading',
        isError: updateRoomTypeStatus === 'failed',
        isSuccess: updateRoomTypeStatus === 'succeeded',
        reset: () => dispatch(hotelsActions.resetMutationStatus()),
    };

    const deleteRoomType = {
        mutate: useCallback(
            ({ id, hotelId }: { id: string; hotelId: string }) => {
                dispatch({ type: DELETE_ROOM_TYPE, payload: { id, hotelId } });
            },
            [dispatch]
        ),
        mutateAsync: useCallback(
            ({ id, hotelId }: { id: string; hotelId: string }): Promise<{ id: string; hotelId: string }> => {
                return new Promise((resolve, reject) => {
                    dispatch({
                        type: DELETE_ROOM_TYPE,
                        payload: { id, hotelId, resolve, reject },
                    });
                });
            },
            [dispatch]
        ),
        isPending: deleteRoomTypeStatus === 'loading',
        isError: deleteRoomTypeStatus === 'failed',
        isSuccess: deleteRoomTypeStatus === 'succeeded',
        reset: () => dispatch(hotelsActions.resetMutationStatus()),
    };

    // ----- Activity Type CRUD -----

    const createActivityType = {
        mutate: useCallback(
            ({ hotelId, ...input }: CreateActivityTypeInput) => {
                dispatch({ type: CREATE_ACTIVITY_TYPE, payload: { hotelId, input } });
            },
            [dispatch]
        ),
        mutateAsync: useCallback(
            ({ hotelId, ...input }: CreateActivityTypeInput): Promise<ActivityType> => {
                return new Promise((resolve, reject) => {
                    dispatch({
                        type: CREATE_ACTIVITY_TYPE,
                        payload: { hotelId, input, resolve, reject },
                    });
                });
            },
            [dispatch]
        ),
        isPending: createActivityTypeStatus === 'loading',
        isError: createActivityTypeStatus === 'failed',
        isSuccess: createActivityTypeStatus === 'succeeded',
        reset: () => dispatch(hotelsActions.resetMutationStatus()),
    };

    const updateActivityType = {
        mutate: useCallback(
            ({ id, hotelId, ...input }: UpdateActivityTypeInput) => {
                dispatch({ type: UPDATE_ACTIVITY_TYPE, payload: { id, hotelId, input } });
            },
            [dispatch]
        ),
        mutateAsync: useCallback(
            ({ id, hotelId, ...input }: UpdateActivityTypeInput): Promise<ActivityType> => {
                return new Promise((resolve, reject) => {
                    dispatch({
                        type: UPDATE_ACTIVITY_TYPE,
                        payload: { id, hotelId, input, resolve, reject },
                    });
                });
            },
            [dispatch]
        ),
        isPending: updateActivityTypeStatus === 'loading',
        isError: updateActivityTypeStatus === 'failed',
        isSuccess: updateActivityTypeStatus === 'succeeded',
        reset: () => dispatch(hotelsActions.resetMutationStatus()),
    };

    const deleteActivityType = {
        mutate: useCallback(
            ({ id, hotelId }: { id: string; hotelId: string }) => {
                dispatch({ type: DELETE_ACTIVITY_TYPE, payload: { id, hotelId } });
            },
            [dispatch]
        ),
        mutateAsync: useCallback(
            ({ id, hotelId }: { id: string; hotelId: string }): Promise<{ id: string; hotelId: string }> => {
                return new Promise((resolve, reject) => {
                    dispatch({
                        type: DELETE_ACTIVITY_TYPE,
                        payload: { id, hotelId, resolve, reject },
                    });
                });
            },
            [dispatch]
        ),
        isPending: deleteActivityTypeStatus === 'loading',
        isError: deleteActivityTypeStatus === 'failed',
        isSuccess: deleteActivityTypeStatus === 'succeeded',
        reset: () => dispatch(hotelsActions.resetMutationStatus()),
    };

    return {
        createHotel,
        updateHotel,
        deleteHotel,
        createRoomType,
        updateRoomType,
        deleteRoomType,
        createActivityType,
        updateActivityType,
        deleteActivityType,
    };
}
