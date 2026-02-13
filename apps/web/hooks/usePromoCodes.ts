import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import type { PromoCode, DiscountType } from '@repo/shared';
import type { RootState } from '@/lib/store';
import { config } from '@/lib/config';
import { toast } from 'sonner';

// Query options for promo codes
export interface PromoCodesQueryOptions {
    search?: string;
    status?: 'ACTIVE' | 'EXPIRED' | 'EXHAUSTED' | 'INACTIVE';
}

/**
 * Fetch all promo codes for the current hotel
 * Automatically scopes to the current active hotel
 */
export function usePromoCodes(options: PromoCodesQueryOptions = {}) {
    const hotelId = useSelector((state: RootState) => state.session.activeHotel?.id);

    return useQuery({
        queryKey: ['promoCodes', hotelId, options] as const,
        queryFn: async () => {
            if (!hotelId) throw new Error('No hotel selected');

            const params = new URLSearchParams();
            params.append('hotelId', hotelId);
            if (options.search) params.append('search', options.search);
            if (options.status) params.append('status', options.status);

            const response = await fetch(
                `${config.apiUrl}/api/v1/promo-codes?${params.toString()}`,
                { credentials: 'include' }
            );
            if (!response.ok) {
                throw new Error('Failed to fetch promo codes');
            }
            const json = await response.json();
            return json.data as PromoCode[];
        },
        enabled: !!hotelId,
    });
}

// Validate a promo code for a booking
export interface ValidatePromoCodeOptions {
    code: string;
    amount: number;
    roomTypeId?: string;
}

export interface ValidatePromoCodeResult {
    valid: boolean;
    reason?: string;
    promo?: PromoCode;
    discountAmount?: number;
    finalAmount?: number;
}

export function useValidatePromoCode(options: ValidatePromoCodeOptions | null) {
    const hotelId = useSelector((state: RootState) => state.session.activeHotel?.id);

    return useQuery({
        queryKey: ['validatePromoCode', hotelId, options] as const,
        queryFn: async () => {
            if (!options || !hotelId) return null;
            const params = new URLSearchParams();
            params.append('amount', options.amount.toString());
            params.append('hotelId', hotelId);
            if (options.roomTypeId) params.append('roomTypeId', options.roomTypeId);

            const response = await fetch(
                `${config.apiUrl}/api/v1/promo-codes/${options.code}/validate?${params.toString()}`,
                { credentials: 'include' }
            );
            if (!response.ok) {
                if (response.status === 404) {
                    return { valid: false, reason: 'Promo code not found' } as ValidatePromoCodeResult;
                }
                throw new Error('Failed to validate promo code');
            }
            const json = await response.json();
            return json.data as ValidatePromoCodeResult;
        },
        enabled: !!options?.code && !!hotelId,
    });
}

// Input types for mutations
export interface CreatePromoCodeInput {
    code: string;
    discountType: DiscountType;
    discountValue: number;
    currency?: string;
    minBookingAmount?: number;
    maxDiscountAmount?: number;
    validFrom?: string;
    validTo?: string;
    maxUses?: number;
    maxUsesPerGuest?: number;
    applicableRoomTypeIds?: string[];
    applicableActivityTypeIds?: string[];
    isActive: boolean;
}

export interface UpdatePromoCodeInput {
    id: string;
    code?: string;
    discountType?: DiscountType;
    discountValue?: number;
    currency?: string;
    minBookingAmount?: number;
    maxDiscountAmount?: number;
    validFrom?: string;
    validTo?: string;
    maxUses?: number;
    maxUsesPerGuest?: number;
    applicableRoomTypeIds?: string[];
    applicableActivityTypeIds?: string[];
    isActive?: boolean;
}

/**
 * Hook for promo code CRUD mutations
 * Automatically associates promo codes with the current active hotel
 */
export function usePromoCodeMutations() {
    const queryClient = useQueryClient();
    const hotelId = useSelector((state: RootState) => state.session.activeHotel?.id);

    const createPromoCode = useMutation({
        mutationFn: async (input: CreatePromoCodeInput) => {
            if (!hotelId) throw new Error('No hotel selected');

            const response = await fetch(`${config.apiUrl}/api/v1/promo-codes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ ...input, hotelId }),
            });
            if (!response.ok) {
                throw new Error('Failed to create promo code');
            }
            const json = await response.json();
            return json.data as PromoCode;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['promoCodes', hotelId] });
            toast.success(`"${variables.code}" has been created`);
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    const updatePromoCode = useMutation({
        mutationFn: async (input: UpdatePromoCodeInput) => {
            const { id, ...data } = input;
            const response = await fetch(`${config.apiUrl}/api/v1/promo-codes/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                throw new Error('Failed to update promo code');
            }
            const json = await response.json();
            return json.data as PromoCode;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['promoCodes', hotelId] });
            toast.success('Promo code has been updated');
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    const deletePromoCode = useMutation({
        mutationFn: async (id: string) => {
            const response = await fetch(`${config.apiUrl}/api/v1/promo-codes/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Failed to delete promo code');
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['promoCodes', hotelId] });
            toast.success('Promo code has been deleted');
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    return {
        createPromoCode,
        updatePromoCode,
        deletePromoCode,
    };
}
