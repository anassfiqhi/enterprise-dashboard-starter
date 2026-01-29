import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { PricingRule, PriceAmountType, PricingChannel } from '@repo/shared';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Fetch pricing rules for a hotel
export function usePricingRules(hotelId: string | undefined) {
    return useQuery({
        queryKey: ['pricingRules', hotelId] as const,
        queryFn: async () => {
            const response = await fetch(
                `${API_URL}/api/v1/hotels/${hotelId}/pricing-rules`
            );
            if (!response.ok) {
                throw new Error('Failed to fetch pricing rules');
            }
            const json = await response.json();
            return json.data as PricingRule[];
        },
        enabled: !!hotelId,
    });
}

// Input types for mutations
export interface CreatePricingRuleInput {
    hotelId: string;
    name: string;
    roomTypeId?: string;
    activityTypeId?: string;
    amountType: PriceAmountType;
    amount: number;
    currency: string;
    validFrom?: string;
    validTo?: string;
    minNights?: number;
    maxNights?: number;
    daysOfWeek?: number[];
    channel?: PricingChannel;
    promoCode?: string;
    priority: number;
    isActive: boolean;
}

export interface UpdatePricingRuleInput {
    id: string;
    hotelId: string;
    name?: string;
    roomTypeId?: string;
    activityTypeId?: string;
    amountType?: PriceAmountType;
    amount?: number;
    currency?: string;
    validFrom?: string;
    validTo?: string;
    minNights?: number;
    maxNights?: number;
    daysOfWeek?: number[];
    channel?: PricingChannel;
    promoCode?: string;
    priority?: number;
    isActive?: boolean;
}

export interface DeletePricingRuleInput {
    id: string;
    hotelId: string;
}

export function usePricingRuleMutations() {
    const queryClient = useQueryClient();

    const createPricingRule = useMutation({
        mutationFn: async (input: CreatePricingRuleInput) => {
            const { hotelId, ...data } = input;
            const response = await fetch(
                `${API_URL}/api/v1/hotels/${hotelId}/pricing-rules`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                }
            );
            if (!response.ok) {
                throw new Error('Failed to create pricing rule');
            }
            const json = await response.json();
            return json.data as PricingRule;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['pricingRules', variables.hotelId] });
            toast.success(`"${variables.name}" has been created`);
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    const updatePricingRule = useMutation({
        mutationFn: async (input: UpdatePricingRuleInput) => {
            const { id, hotelId, ...data } = input;
            const response = await fetch(
                `${API_URL}/api/v1/hotels/${hotelId}/pricing-rules/${id}`,
                {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                }
            );
            if (!response.ok) {
                throw new Error('Failed to update pricing rule');
            }
            const json = await response.json();
            return json.data as PricingRule;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['pricingRules', variables.hotelId] });
            toast.success('Pricing rule has been updated');
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    const deletePricingRule = useMutation({
        mutationFn: async (input: DeletePricingRuleInput) => {
            const { id, hotelId } = input;
            const response = await fetch(
                `${API_URL}/api/v1/hotels/${hotelId}/pricing-rules/${id}`,
                { method: 'DELETE' }
            );
            if (!response.ok) {
                throw new Error('Failed to delete pricing rule');
            }
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['pricingRules', variables.hotelId] });
            toast.success('Pricing rule has been deleted');
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    return {
        createPricingRule,
        updatePricingRule,
        deletePricingRule,
    };
}
