import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { RoomInventory, InventoryUpdate } from '@repo/shared';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Fetch room inventory for a hotel
export function useRoomInventory(
    hotelId: string | undefined,
    startDate?: string,
    endDate?: string,
    roomTypeId?: string
) {
    return useQuery({
        queryKey: ['roomInventory', hotelId, startDate, endDate, roomTypeId] as const,
        queryFn: async () => {
            const params = new URLSearchParams();
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);
            if (roomTypeId) params.append('roomTypeId', roomTypeId);

            const response = await fetch(
                `${API_URL}/api/v1/hotels/${hotelId}/inventory?${params.toString()}`
            );
            if (!response.ok) {
                throw new Error('Failed to fetch room inventory');
            }
            const json = await response.json();
            return json.data as RoomInventory[];
        },
        enabled: !!hotelId,
    });
}

// Input type for bulk inventory update
export interface BulkInventoryUpdateInput {
    hotelId: string;
    updates: InventoryUpdate[];
}

export function useInventoryMutations() {
    const queryClient = useQueryClient();

    const updateInventory = useMutation({
        mutationFn: async (input: BulkInventoryUpdateInput) => {
            const { hotelId, updates } = input;
            const response = await fetch(
                `${API_URL}/api/v1/hotels/${hotelId}/inventory`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updates),
                }
            );
            if (!response.ok) {
                throw new Error('Failed to update inventory');
            }
            const json = await response.json();
            return {
                data: json.data as RoomInventory[],
                updatedCount: json.meta.updatedCount as number,
            };
        },
        onSuccess: (result, variables) => {
            queryClient.invalidateQueries({ queryKey: ['roomInventory', variables.hotelId] });
            queryClient.invalidateQueries({ queryKey: ['availability'] });
            toast.success(`${result.updatedCount} inventory records updated`);
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    return {
        updateInventory,
    };
}
