import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { PromoCode, DiscountType } from '@repo/shared';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Query options for promo codes
export interface PromoCodesQueryOptions {
    search?: string;
    status?: 'ACTIVE' | 'EXPIRED' | 'EXHAUSTED' | 'INACTIVE';
    hotelId?: string;
}

// Fetch all promo codes with optional filters
export function usePromoCodes(options: PromoCodesQueryOptions = {}) {
    return useQuery({
        queryKey: ['promoCodes', options] as const,
        queryFn: async () => {
            const params = new URLSearchParams();
            if (options.search) params.append('search', options.search);
            if (options.status) params.append('status', options.status);
            if (options.hotelId) params.append('hotelId', options.hotelId);

            const response = await fetch(
                `${API_URL}/api/v1/promo-codes?${params.toString()}`
            );
            if (!response.ok) {
                throw new Error('Failed to fetch promo codes');
            }
            const json = await response.json();
            return json.data as PromoCode[];
        },
    });
}

// Validate a promo code for a booking
export interface ValidatePromoCodeOptions {
    code: string;
    amount: number;
    hotelId?: string;
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
    return useQuery({
        queryKey: ['validatePromoCode', options] as const,
        queryFn: async () => {
            if (!options) return null;
            const params = new URLSearchParams();
            params.append('amount', options.amount.toString());
            if (options.hotelId) params.append('hotelId', options.hotelId);
            if (options.roomTypeId) params.append('roomTypeId', options.roomTypeId);

            const response = await fetch(
                `${API_URL}/api/v1/promo-codes/${options.code}/validate?${params.toString()}`
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
        enabled: !!options?.code,
    });
}

// Input types for mutations
export interface CreatePromoCodeInput {
    code: string;
    hotelId?: string;
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
    hotelId?: string;
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

export function usePromoCodeMutations() {
    const queryClient = useQueryClient();

    const createPromoCode = useMutation({
        mutationFn: async (input: CreatePromoCodeInput) => {
            const response = await fetch(`${API_URL}/api/v1/promo-codes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(input),
            });
            if (!response.ok) {
                throw new Error('Failed to create promo code');
            }
            const json = await response.json();
            return json.data as PromoCode;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['promoCodes'] });
            toast.success(`"${variables.code}" has been created`);
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    const updatePromoCode = useMutation({
        mutationFn: async (input: UpdatePromoCodeInput) => {
            const { id, ...data } = input;
            const response = await fetch(`${API_URL}/api/v1/promo-codes/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                throw new Error('Failed to update promo code');
            }
            const json = await response.json();
            return json.data as PromoCode;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['promoCodes'] });
            toast.success('Promo code has been updated');
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    const deletePromoCode = useMutation({
        mutationFn: async (id: string) => {
            const response = await fetch(`${API_URL}/api/v1/promo-codes/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Failed to delete promo code');
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['promoCodes'] });
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
