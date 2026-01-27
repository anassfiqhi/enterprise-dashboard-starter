import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Reservation, Payment, ReservationStatus, ResponseEnvelope } from '@repo/shared';
import { config } from '@/lib/config';

/**
 * Mutation to update reservation status
 */
export function useUpdateReservationStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, status }: { id: string; status: ReservationStatus }) => {
            const response = await fetch(
                `${config.apiUrl}/api/v1/reservations/${id}`,
                {
                    method: 'PATCH',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status }),
                }
            );

            if (!response.ok) {
                const errorData: ResponseEnvelope<null> = await response.json();
                throw new Error(errorData.error?.message || 'Failed to update reservation');
            }

            const envelope: ResponseEnvelope<Reservation> = await response.json();
            if (envelope.error) throw new Error(envelope.error.message);

            return envelope.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reservations'] });
        },
    });
}

/**
 * Mutation to cancel a reservation
 */
export function useCancelReservation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
            const response = await fetch(
                `${config.apiUrl}/api/v1/reservations/${id}/cancel`,
                {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ reason }),
                }
            );

            if (!response.ok) {
                const errorData: ResponseEnvelope<null> = await response.json();
                throw new Error(errorData.error?.message || 'Failed to cancel reservation');
            }

            const envelope: ResponseEnvelope<Reservation> = await response.json();
            if (envelope.error) throw new Error(envelope.error.message);

            return envelope.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reservations'] });
        },
    });
}

/**
 * Mutation to refund a reservation
 */
export function useRefundReservation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, amount, reason }: { id: string; amount?: number; reason?: string }) => {
            const response = await fetch(
                `${config.apiUrl}/api/v1/reservations/${id}/refund`,
                {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ amount, reason }),
                }
            );

            if (!response.ok) {
                const errorData: ResponseEnvelope<null> = await response.json();
                throw new Error(errorData.error?.message || 'Failed to process refund');
            }

            const envelope: ResponseEnvelope<Payment> = await response.json();
            if (envelope.error) throw new Error(envelope.error.message);

            return envelope.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reservations'] });
        },
    });
}
