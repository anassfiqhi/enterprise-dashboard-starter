import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import type { Guest, ResponseEnvelope } from '@repo/shared';
import type { RootState } from '@/lib/store';
import { config } from '@/lib/config';
import { toast } from 'sonner';

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
 * Hook for guest CRUD mutations
 * Automatically associates guests with the current active hotel
 */
export function useGuestMutations() {
    const queryClient = useQueryClient();
    const hotelId = useSelector((state: RootState) => state.session.activeHotel?.id);

    const createGuest = useMutation({
        mutationFn: async (input: CreateGuestInput) => {
            if (!hotelId) throw new Error('No hotel selected');

            const response = await fetch(`${config.apiUrl}/api/v1/guests`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ ...input, hotelId }),
            });

            if (!response.ok) {
                const errorData: ResponseEnvelope<null> = await response.json();
                throw new Error(errorData.error?.message || 'Failed to create guest');
            }

            const envelope: ResponseEnvelope<Guest> = await response.json();
            return envelope.data!;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['guests', hotelId] });
            toast.success('Guest created successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    const updateGuest = useMutation({
        mutationFn: async ({ id, ...input }: UpdateGuestInput) => {
            const response = await fetch(`${config.apiUrl}/api/v1/guests/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(input),
            });

            if (!response.ok) {
                const errorData: ResponseEnvelope<null> = await response.json();
                throw new Error(errorData.error?.message || 'Failed to update guest');
            }

            const envelope: ResponseEnvelope<Guest> = await response.json();
            return envelope.data!;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['guests', hotelId] });
            queryClient.invalidateQueries({ queryKey: ['guest', variables.id] });
            toast.success('Guest updated successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    const deleteGuest = useMutation({
        mutationFn: async (guestId: string) => {
            const response = await fetch(`${config.apiUrl}/api/v1/guests/${guestId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData: ResponseEnvelope<null> = await response.json();
                throw new Error(errorData.error?.message || 'Failed to delete guest');
            }

            return guestId;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['guests', hotelId] });
            toast.success('Guest deleted successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    return {
        createGuest,
        updateGuest,
        deleteGuest,
    };
}
