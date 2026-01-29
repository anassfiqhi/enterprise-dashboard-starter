import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { PhysicalRoom, PhysicalRoomStatus } from '@repo/shared';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Fetch physical rooms for a room type
export function usePhysicalRooms(hotelId: string | undefined, roomTypeId: string | undefined) {
    return useQuery({
        queryKey: ['physicalRooms', hotelId, roomTypeId] as const,
        queryFn: async () => {
            const response = await fetch(
                `${API_URL}/api/v1/hotels/${hotelId}/room-types/${roomTypeId}/rooms`
            );
            if (!response.ok) {
                throw new Error('Failed to fetch physical rooms');
            }
            const json = await response.json();
            return json.data as PhysicalRoom[];
        },
        enabled: !!hotelId && !!roomTypeId,
    });
}

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

export function usePhysicalRoomMutations() {
    const queryClient = useQueryClient();

    const createPhysicalRoom = useMutation({
        mutationFn: async (input: CreatePhysicalRoomInput) => {
            const { hotelId, roomTypeId, ...data } = input;
            const response = await fetch(
                `${API_URL}/api/v1/hotels/${hotelId}/room-types/${roomTypeId}/rooms`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                }
            );
            if (!response.ok) {
                throw new Error('Failed to create room');
            }
            const json = await response.json();
            return json.data as PhysicalRoom;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['physicalRooms', variables.hotelId, variables.roomTypeId] });
            queryClient.invalidateQueries({ queryKey: ['hotel', variables.hotelId] });
            toast.success(`Room ${variables.code} has been created`);
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    const updatePhysicalRoom = useMutation({
        mutationFn: async (input: UpdatePhysicalRoomInput) => {
            const { id, hotelId, roomTypeId, ...data } = input;
            const response = await fetch(
                `${API_URL}/api/v1/hotels/${hotelId}/room-types/${roomTypeId}/rooms/${id}`,
                {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                }
            );
            if (!response.ok) {
                throw new Error('Failed to update room');
            }
            const json = await response.json();
            return json.data as PhysicalRoom;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['physicalRooms', variables.hotelId, variables.roomTypeId] });
            toast.success('Room has been updated');
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    const deletePhysicalRoom = useMutation({
        mutationFn: async (input: DeletePhysicalRoomInput) => {
            const { id, hotelId, roomTypeId } = input;
            const response = await fetch(
                `${API_URL}/api/v1/hotels/${hotelId}/room-types/${roomTypeId}/rooms/${id}`,
                { method: 'DELETE' }
            );
            if (!response.ok) {
                throw new Error('Failed to delete room');
            }
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['physicalRooms', variables.hotelId, variables.roomTypeId] });
            queryClient.invalidateQueries({ queryKey: ['hotel', variables.hotelId] });
            toast.success('Room has been deleted');
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    return {
        createPhysicalRoom,
        updatePhysicalRoom,
        deletePhysicalRoom,
    };
}
