import { z } from 'zod';

// ============================================================================
// Reservation Status
// ============================================================================

export const ReservationStatusSchema = z.enum(['PENDING', 'CONFIRMED', 'CANCELLED']);
export type ReservationStatus = z.infer<typeof ReservationStatusSchema>;

// ============================================================================
// Payment Types
// ============================================================================

export const PaymentMethodCategorySchema = z.enum([
    'CARD',
    'DIGITAL_WALLET',
    'BANK_TRANSFER',
    'BUY_NOW_PAY_LATER',
    'CASH',
    'OTHER',
]);
export type PaymentMethodCategory = z.infer<typeof PaymentMethodCategorySchema>;

export const PaymentStatusSchema = z.enum([
    'PENDING',
    'PROCESSING',
    'COMPLETED',
    'FAILED',
    'REFUNDED',
    'PARTIALLY_REFUNDED',
]);
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;

// ============================================================================
// Hotel Schema
// ============================================================================

export const HotelSchema = z.object({
    id: z.string(),
    name: z.string(),
    timezone: z.string(),
    address: z.object({
        street: z.string().optional(),
        city: z.string(),
        state: z.string().optional(),
        country: z.string(),
        postalCode: z.string().optional(),
    }).optional(),
});

export type Hotel = z.infer<typeof HotelSchema>;

// ============================================================================
// Room Types Schema
// ============================================================================

export const RoomTypeSchema = z.object({
    id: z.string(),
    hotelId: z.string(),
    name: z.string(),
    capacity: z.number().int().min(1),
    description: z.string().optional(),
    basePrice: z.number().min(0),
    currency: z.string().default('USD'),
});

export type RoomType = z.infer<typeof RoomTypeSchema>;

// ============================================================================
// Activity Types Schema
// ============================================================================

export const ActivityTypeSchema = z.object({
    id: z.string(),
    hotelId: z.string(),
    name: z.string(),
    capacityPerSlot: z.number().int().min(1),
    description: z.string().optional(),
    duration: z.number().int().min(15), // duration in minutes
    basePrice: z.number().min(0),
    currency: z.string().default('USD'),
});

export type ActivityType = z.infer<typeof ActivityTypeSchema>;

// ============================================================================
// Activity Slot Schema
// ============================================================================

export const ActivitySlotSchema = z.object({
    id: z.string(),
    activityTypeId: z.string(),
    start: z.string(), // ISO datetime
    end: z.string(), // ISO datetime
    capacity: z.number().int().min(1),
    bookedCount: z.number().int().min(0).default(0),
    closed: z.boolean().default(false),
});

export type ActivitySlot = z.infer<typeof ActivitySlotSchema>;

// ============================================================================
// Guest Schema
// ============================================================================

export const GuestSchema = z.object({
    id: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    phone: z.string().optional(),
});

export type Guest = z.infer<typeof GuestSchema>;

// ============================================================================
// Price Details Schema
// ============================================================================

export const NightPriceSchema = z.object({
    date: z.string(), // YYYY-MM-DD
    rate: z.number(),
});

export type NightPrice = z.infer<typeof NightPriceSchema>;

export const PriceDetailsSchema = z.object({
    nights: z.array(NightPriceSchema).optional(),
    subtotal: z.number(),
    taxes: z.number(),
    fees: z.number(),
    total: z.number(),
    currency: z.string(),
});

export type PriceDetails = z.infer<typeof PriceDetailsSchema>;

// ============================================================================
// Reservation Schema
// ============================================================================

export const ReservationSchema = z.object({
    id: z.string(),
    hotelId: z.string(),
    hotelName: z.string().optional(), // Denormalized for display

    // Guest info
    guestId: z.string(),
    guest: GuestSchema.optional(), // Embedded guest for display

    // Room booking (optional)
    roomTypeId: z.string().optional(),
    roomTypeName: z.string().optional(), // Denormalized
    checkInDate: z.string().optional(), // YYYY-MM-DD
    checkOutDate: z.string().optional(), // YYYY-MM-DD

    // Activity booking (optional)
    activityTypeId: z.string().optional(),
    activityTypeName: z.string().optional(), // Denormalized
    slotId: z.string().optional(),
    slotStart: z.string().optional(), // ISO datetime
    slotEnd: z.string().optional(), // ISO datetime

    // Booking details
    guests: z.number().int().min(1),
    specialRequests: z.string().optional(),

    // Pricing
    priceDetails: PriceDetailsSchema,
    priceTotal: z.number(),
    currency: z.string(),

    // Status
    status: ReservationStatusSchema,
    channel: z.enum(['DIRECT', 'OTA', 'CORPORATE']).default('DIRECT'),

    // Timestamps
    createdAt: z.string(),
    updatedAt: z.string().optional(),
    cancelledAt: z.string().optional(),
});

export type Reservation = z.infer<typeof ReservationSchema>;

// ============================================================================
// Payment Schema
// ============================================================================

export const PaymentSchema = z.object({
    id: z.string(),
    reservationId: z.string(),

    // Amount
    amount: z.number(),
    currency: z.string(),

    // Method
    methodCategory: PaymentMethodCategorySchema,
    methodDisplay: z.string().optional(), // e.g., "Visa •••• 4242"

    // Status
    status: PaymentStatusSchema,

    // Provider
    provider: z.string().optional(), // stripe, paypal, manual
    providerReference: z.string().optional(),

    // Refund tracking
    refundedAmount: z.number().default(0),

    // Timestamps
    createdAt: z.string(),
    updatedAt: z.string().optional(),
});

export type Payment = z.infer<typeof PaymentSchema>;

// ============================================================================
// Query Schemas
// ============================================================================

export const ReservationsQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().optional(), // guest name, reservation ID
    status: ReservationStatusSchema.optional(),
    hotelId: z.string().optional(),
    checkInFrom: z.string().optional(), // YYYY-MM-DD
    checkInTo: z.string().optional(), // YYYY-MM-DD
    sort: z.enum([
        'checkInDate', '-checkInDate',
        'createdAt', '-createdAt',
        'priceTotal', '-priceTotal',
        'status', '-status',
    ]).optional().default('-createdAt'),
});

export type ReservationsQuery = z.infer<typeof ReservationsQuerySchema>;

export const AvailabilityQuerySchema = z.object({
    hotelId: z.string(),
    startDate: z.string(), // YYYY-MM-DD
    endDate: z.string(), // YYYY-MM-DD
    viewType: z.enum(['rooms', 'activities']).default('rooms'),
});

export type AvailabilityQuery = z.infer<typeof AvailabilityQuerySchema>;

export const HotelsQuerySchema = z.object({
    search: z.string().optional(),
});

export type HotelsQuery = z.infer<typeof HotelsQuerySchema>;

// ============================================================================
// Availability Response Types
// ============================================================================

export const RoomAvailabilitySchema = z.object({
    date: z.string(), // YYYY-MM-DD
    roomTypeId: z.string(),
    roomTypeName: z.string(),
    totalRooms: z.number().int(),
    availableRooms: z.number().int(),
    bookedRooms: z.number().int(),
    closed: z.boolean(),
});

export type RoomAvailability = z.infer<typeof RoomAvailabilitySchema>;

export const ActivitySlotAvailabilitySchema = z.object({
    date: z.string(), // YYYY-MM-DD
    slotId: z.string(),
    activityTypeId: z.string(),
    activityTypeName: z.string(),
    start: z.string(), // ISO datetime
    end: z.string(), // ISO datetime
    totalCapacity: z.number().int(),
    availableCapacity: z.number().int(),
    bookedCount: z.number().int(),
    closed: z.boolean(),
});

export type ActivitySlotAvailability = z.infer<typeof ActivitySlotAvailabilitySchema>;

// ============================================================================
// Booking Metrics Schema
// ============================================================================

export const BookingMetricsSchema = z.object({
    totalRevenue: z.number(),
    totalBookings: z.number().int(),
    confirmedBookings: z.number().int(),
    pendingBookings: z.number().int(),
    cancelledBookings: z.number().int(),
    averageOccupancy: z.number(), // percentage 0-100
    averageDailyRate: z.number(),
    revenueByDay: z.array(z.object({
        date: z.string(),
        revenue: z.number(),
    })),
    bookingsByStatus: z.array(z.object({
        status: ReservationStatusSchema,
        count: z.number().int(),
    })),
    occupancyByDay: z.array(z.object({
        date: z.string(),
        occupancy: z.number(), // percentage 0-100
    })),
});

export type BookingMetrics = z.infer<typeof BookingMetricsSchema>;

// ============================================================================
// Mutation Schemas
// ============================================================================

export const UpdateReservationStatusSchema = z.object({
    status: ReservationStatusSchema,
});

export type UpdateReservationStatus = z.infer<typeof UpdateReservationStatusSchema>;

export const CancelReservationSchema = z.object({
    reason: z.string().optional(),
});

export type CancelReservation = z.infer<typeof CancelReservationSchema>;

export const RefundReservationSchema = z.object({
    amount: z.number().optional(), // If not provided, full refund
    reason: z.string().optional(),
});

export type RefundReservation = z.infer<typeof RefundReservationSchema>;

// ============================================================================
// SSE Event Types for Bookings
// ============================================================================

export interface ReservationUpdatedEvent {
    type: 'reservation.updated';
    id: string;
    patch: Partial<Reservation>;
    ts: number;
}

export interface ReservationCancelledEvent {
    type: 'reservation.cancelled';
    id: string;
    patch: { status: 'CANCELLED'; cancelledAt: string };
    ts: number;
}

export type ReservationEvent = ReservationUpdatedEvent | ReservationCancelledEvent;

export const ReservationEventSchema = z.object({
    type: z.enum(['reservation.updated', 'reservation.cancelled']),
    id: z.string(),
    patch: z.record(z.string(), z.any()),
    ts: z.number(),
});

// ============================================================================
// Physical Room Schema
// ============================================================================

export const PhysicalRoomStatusSchema = z.enum(['AVAILABLE', 'MAINTENANCE', 'OUT_OF_SERVICE']);
export type PhysicalRoomStatus = z.infer<typeof PhysicalRoomStatusSchema>;

export const PhysicalRoomSchema = z.object({
    id: z.string(),
    roomTypeId: z.string(),
    hotelId: z.string(),
    code: z.string(), // "101", "202", "Penthouse A"
    floor: z.number().int().optional(),
    status: PhysicalRoomStatusSchema,
    notes: z.string().optional(),
});

export type PhysicalRoom = z.infer<typeof PhysicalRoomSchema>;

// ============================================================================
// Room Inventory Schema
// ============================================================================

export const RoomInventorySchema = z.object({
    id: z.string(),
    roomTypeId: z.string(),
    hotelId: z.string(),
    date: z.string(), // YYYY-MM-DD
    totalRooms: z.number().int(),
    availableRooms: z.number().int(),
    blockedRooms: z.number().int(),
    bookedRooms: z.number().int(),
});

export type RoomInventory = z.infer<typeof RoomInventorySchema>;

export const InventoryUpdateSchema = z.object({
    roomTypeId: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    availableRooms: z.number().int().optional(),
    blockedRooms: z.number().int().optional(),
});

export type InventoryUpdate = z.infer<typeof InventoryUpdateSchema>;

// ============================================================================
// Pricing Rules Schema
// ============================================================================

export const PricingChannelSchema = z.enum(['DIRECT', 'OTA', 'CORPORATE']);
export type PricingChannel = z.infer<typeof PricingChannelSchema>;

export const PriceAmountTypeSchema = z.enum(['OVERRIDE', 'DELTA_FIXED', 'DELTA_PERCENT']);
export type PriceAmountType = z.infer<typeof PriceAmountTypeSchema>;

export const PricingRuleSchema = z.object({
    id: z.string(),
    hotelId: z.string(),
    name: z.string(),
    roomTypeId: z.string().optional(), // null = all room types
    activityTypeId: z.string().optional(), // null = all activities
    amountType: PriceAmountTypeSchema,
    amount: z.number(), // Price or adjustment value
    currency: z.string(),
    validFrom: z.string().optional(), // Seasonality start (YYYY-MM-DD)
    validTo: z.string().optional(), // Seasonality end
    minNights: z.number().int().optional(),
    maxNights: z.number().int().optional(),
    daysOfWeek: z.array(z.number().int().min(0).max(6)).optional(), // 0-6 (Sun-Sat)
    channel: PricingChannelSchema.optional(),
    promoCode: z.string().optional(),
    priority: z.number().int(), // Higher = applied later
    isActive: z.boolean(),
});

export type PricingRule = z.infer<typeof PricingRuleSchema>;

// ============================================================================
// Promo Code Schema
// ============================================================================

export const DiscountTypeSchema = z.enum(['PERCENTAGE', 'FIXED']);
export type DiscountType = z.infer<typeof DiscountTypeSchema>;

export const PromoCodeStatusSchema = z.enum(['ACTIVE', 'EXPIRED', 'EXHAUSTED', 'INACTIVE']);
export type PromoCodeStatus = z.infer<typeof PromoCodeStatusSchema>;

export const PromoCodeSchema = z.object({
    id: z.string(),
    code: z.string(), // "SUMMER20", "WELCOME10"
    hotelId: z.string().optional(), // null = all hotels
    discountType: DiscountTypeSchema,
    discountValue: z.number(), // 20 for 20% or $20
    currency: z.string().optional(), // Required for FIXED
    minBookingAmount: z.number().optional(), // Minimum spend to apply
    maxDiscountAmount: z.number().optional(), // Cap for PERCENTAGE
    validFrom: z.string().optional(),
    validTo: z.string().optional(),
    maxUses: z.number().int().optional(), // Total redemptions allowed
    usedCount: z.number().int(),
    maxUsesPerGuest: z.number().int().optional(),
    applicableRoomTypeIds: z.array(z.string()).optional(),
    applicableActivityTypeIds: z.array(z.string()).optional(),
    isActive: z.boolean(),
    createdAt: z.string(),
});

export type PromoCode = z.infer<typeof PromoCodeSchema>;
