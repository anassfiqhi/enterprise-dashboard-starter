import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Hotel, RoomType, ActivityType, ResponseEnvelope } from '@repo/shared';
import { config } from '@/lib/config';
import { toast } from 'sonner';

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

/**
 * Hook for hotel CRUD mutations
 */
export function useHotelMutations() {
    const queryClient = useQueryClient();

    const createHotel = useMutation({
        mutationFn: async (input: CreateHotelInput) => {
            const response = await fetch(`${config.apiUrl}/api/v1/hotels`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(input),
            });

            if (!response.ok) {
                const errorData: ResponseEnvelope<null> = await response.json();
                throw new Error(errorData.error?.message || 'Failed to create hotel');
            }

            const envelope: ResponseEnvelope<Hotel> = await response.json();
            return envelope.data!;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['hotels'] });
            toast.success('Hotel created successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    const updateHotel = useMutation({
        mutationFn: async ({ id, ...input }: UpdateHotelInput) => {
            const response = await fetch(`${config.apiUrl}/api/v1/hotels/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(input),
            });

            if (!response.ok) {
                const errorData: ResponseEnvelope<null> = await response.json();
                throw new Error(errorData.error?.message || 'Failed to update hotel');
            }

            const envelope: ResponseEnvelope<Hotel> = await response.json();
            return envelope.data!;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['hotels'] });
            queryClient.invalidateQueries({ queryKey: ['hotel', variables.id] });
            toast.success('Hotel updated successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    const deleteHotel = useMutation({
        mutationFn: async (hotelId: string) => {
            const response = await fetch(`${config.apiUrl}/api/v1/hotels/${hotelId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData: ResponseEnvelope<null> = await response.json();
                throw new Error(errorData.error?.message || 'Failed to delete hotel');
            }

            return hotelId;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['hotels'] });
            toast.success('Hotel deleted successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    // Room Type mutations
    const createRoomType = useMutation({
        mutationFn: async (input: CreateRoomTypeInput) => {
            const response = await fetch(
                `${config.apiUrl}/api/v1/hotels/${input.hotelId}/room-types`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(input),
                }
            );

            if (!response.ok) {
                const errorData: ResponseEnvelope<null> = await response.json();
                throw new Error(errorData.error?.message || 'Failed to create room type');
            }

            const envelope: ResponseEnvelope<RoomType> = await response.json();
            return envelope.data!;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['hotel', variables.hotelId] });
            toast.success('Room type created successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    const updateRoomType = useMutation({
        mutationFn: async ({ id, hotelId, ...input }: UpdateRoomTypeInput) => {
            const response = await fetch(
                `${config.apiUrl}/api/v1/hotels/${hotelId}/room-types/${id}`,
                {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(input),
                }
            );

            if (!response.ok) {
                const errorData: ResponseEnvelope<null> = await response.json();
                throw new Error(errorData.error?.message || 'Failed to update room type');
            }

            const envelope: ResponseEnvelope<RoomType> = await response.json();
            return envelope.data!;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['hotel', variables.hotelId] });
            toast.success('Room type updated successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    const deleteRoomType = useMutation({
        mutationFn: async ({ id, hotelId }: { id: string; hotelId: string }) => {
            const response = await fetch(
                `${config.apiUrl}/api/v1/hotels/${hotelId}/room-types/${id}`,
                {
                    method: 'DELETE',
                    credentials: 'include',
                }
            );

            if (!response.ok) {
                const errorData: ResponseEnvelope<null> = await response.json();
                throw new Error(errorData.error?.message || 'Failed to delete room type');
            }

            return { id, hotelId };
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['hotel', variables.hotelId] });
            toast.success('Room type deleted successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    // Activity Type mutations
    const createActivityType = useMutation({
        mutationFn: async (input: CreateActivityTypeInput) => {
            const response = await fetch(
                `${config.apiUrl}/api/v1/hotels/${input.hotelId}/activity-types`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(input),
                }
            );

            if (!response.ok) {
                const errorData: ResponseEnvelope<null> = await response.json();
                throw new Error(errorData.error?.message || 'Failed to create activity type');
            }

            const envelope: ResponseEnvelope<ActivityType> = await response.json();
            return envelope.data!;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['hotel', variables.hotelId] });
            toast.success('Activity type created successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    const updateActivityType = useMutation({
        mutationFn: async ({ id, hotelId, ...input }: UpdateActivityTypeInput) => {
            const response = await fetch(
                `${config.apiUrl}/api/v1/hotels/${hotelId}/activity-types/${id}`,
                {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(input),
                }
            );

            if (!response.ok) {
                const errorData: ResponseEnvelope<null> = await response.json();
                throw new Error(errorData.error?.message || 'Failed to update activity type');
            }

            const envelope: ResponseEnvelope<ActivityType> = await response.json();
            return envelope.data!;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['hotel', variables.hotelId] });
            toast.success('Activity type updated successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    const deleteActivityType = useMutation({
        mutationFn: async ({ id, hotelId }: { id: string; hotelId: string }) => {
            const response = await fetch(
                `${config.apiUrl}/api/v1/hotels/${hotelId}/activity-types/${id}`,
                {
                    method: 'DELETE',
                    credentials: 'include',
                }
            );

            if (!response.ok) {
                const errorData: ResponseEnvelope<null> = await response.json();
                throw new Error(errorData.error?.message || 'Failed to delete activity type');
            }

            return { id, hotelId };
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['hotel', variables.hotelId] });
            toast.success('Activity type deleted successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

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
