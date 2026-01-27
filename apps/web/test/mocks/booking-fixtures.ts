import type {
    Hotel,
    RoomType,
    ActivityType,
    ActivitySlot,
    Guest,
    Reservation,
    Payment,
    BookingMetrics,
    RoomAvailability,
    ActivitySlotAvailability,
    ReservationStatus,
    PaymentMethodCategory,
    PaymentStatus,
} from '@repo/shared';

// ============================================================================
// Helper Functions
// ============================================================================

function randomDate(start: Date, end: Date): Date {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
}

function addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

// ============================================================================
// Hotels (5 properties)
// ============================================================================

export const mockHotels: Hotel[] = [
    {
        id: 'hotel_1',
        name: 'Grand Seaside Resort & Spa',
        timezone: 'America/New_York',
        address: { city: 'Miami Beach', state: 'FL', country: 'US', postalCode: '33139' },
    },
    {
        id: 'hotel_2',
        name: 'Mountain Peak Lodge',
        timezone: 'America/Denver',
        address: { city: 'Aspen', state: 'CO', country: 'US', postalCode: '81611' },
    },
    {
        id: 'hotel_3',
        name: 'Urban Boutique Hotel',
        timezone: 'America/Los_Angeles',
        address: { city: 'San Francisco', state: 'CA', country: 'US', postalCode: '94102' },
    },
    {
        id: 'hotel_4',
        name: 'Desert Oasis Resort',
        timezone: 'America/Phoenix',
        address: { city: 'Scottsdale', state: 'AZ', country: 'US', postalCode: '85251' },
    },
    {
        id: 'hotel_5',
        name: 'Lakeside Retreat',
        timezone: 'America/Chicago',
        address: { city: 'Lake Geneva', state: 'WI', country: 'US', postalCode: '53147' },
    },
];

// ============================================================================
// Room Types (3-4 per hotel)
// ============================================================================

export const mockRoomTypes: RoomType[] = [
    // Grand Seaside Resort
    { id: 'rt_1', hotelId: 'hotel_1', name: 'Standard Ocean View', capacity: 2, basePrice: 199, currency: 'USD', description: 'Comfortable room with partial ocean view' },
    { id: 'rt_2', hotelId: 'hotel_1', name: 'Deluxe Suite', capacity: 4, basePrice: 349, currency: 'USD', description: 'Spacious suite with full ocean view and balcony' },
    { id: 'rt_3', hotelId: 'hotel_1', name: 'Penthouse Suite', capacity: 6, basePrice: 799, currency: 'USD', description: 'Luxury penthouse with panoramic views' },
    { id: 'rt_4', hotelId: 'hotel_1', name: 'Family Room', capacity: 5, basePrice: 279, currency: 'USD', description: 'Perfect for families with connecting rooms' },

    // Mountain Peak Lodge
    { id: 'rt_5', hotelId: 'hotel_2', name: 'Cozy Cabin Room', capacity: 2, basePrice: 249, currency: 'USD', description: 'Rustic cabin-style room with mountain views' },
    { id: 'rt_6', hotelId: 'hotel_2', name: 'Ski-In Suite', capacity: 4, basePrice: 449, currency: 'USD', description: 'Direct ski access with fireplace' },
    { id: 'rt_7', hotelId: 'hotel_2', name: 'Alpine Chalet', capacity: 8, basePrice: 899, currency: 'USD', description: 'Private chalet with full kitchen' },

    // Urban Boutique Hotel
    { id: 'rt_8', hotelId: 'hotel_3', name: 'City View Room', capacity: 2, basePrice: 179, currency: 'USD', description: 'Modern room with city skyline views' },
    { id: 'rt_9', hotelId: 'hotel_3', name: 'Executive Suite', capacity: 3, basePrice: 329, currency: 'USD', description: 'Business-ready suite with workspace' },
    { id: 'rt_10', hotelId: 'hotel_3', name: 'Rooftop Loft', capacity: 4, basePrice: 529, currency: 'USD', description: 'Unique loft space with rooftop access' },

    // Desert Oasis Resort
    { id: 'rt_11', hotelId: 'hotel_4', name: 'Garden Casita', capacity: 2, basePrice: 219, currency: 'USD', description: 'Private casita with garden patio' },
    { id: 'rt_12', hotelId: 'hotel_4', name: 'Desert View Villa', capacity: 4, basePrice: 399, currency: 'USD', description: 'Stunning desert sunset views' },
    { id: 'rt_13', hotelId: 'hotel_4', name: 'Spa Retreat Suite', capacity: 2, basePrice: 549, currency: 'USD', description: 'In-room spa amenities and treatments' },

    // Lakeside Retreat
    { id: 'rt_14', hotelId: 'hotel_5', name: 'Lake View Room', capacity: 2, basePrice: 159, currency: 'USD', description: 'Peaceful room overlooking the lake' },
    { id: 'rt_15', hotelId: 'hotel_5', name: 'Cottage Suite', capacity: 4, basePrice: 289, currency: 'USD', description: 'Charming cottage with private deck' },
    { id: 'rt_16', hotelId: 'hotel_5', name: 'Boathouse Loft', capacity: 6, basePrice: 449, currency: 'USD', description: 'Unique boathouse conversion with dock access' },
];

// ============================================================================
// Activity Types (2-3 per hotel)
// ============================================================================

export const mockActivityTypes: ActivityType[] = [
    // Grand Seaside Resort
    { id: 'act_1', hotelId: 'hotel_1', name: 'Beach Yoga Session', capacityPerSlot: 12, duration: 60, basePrice: 35, currency: 'USD', description: 'Sunrise yoga on the beach' },
    { id: 'act_2', hotelId: 'hotel_1', name: 'Couples Spa Package', capacityPerSlot: 6, duration: 120, basePrice: 199, currency: 'USD', description: 'Relaxing spa treatment for two' },
    { id: 'act_3', hotelId: 'hotel_1', name: 'Snorkeling Tour', capacityPerSlot: 8, duration: 180, basePrice: 89, currency: 'USD', description: 'Guided snorkeling at coral reef' },

    // Mountain Peak Lodge
    { id: 'act_4', hotelId: 'hotel_2', name: 'Guided Ski Tour', capacityPerSlot: 6, duration: 240, basePrice: 149, currency: 'USD', description: 'Expert-led backcountry skiing' },
    { id: 'act_5', hotelId: 'hotel_2', name: 'Hot Springs Visit', capacityPerSlot: 20, duration: 120, basePrice: 45, currency: 'USD', description: 'Natural hot springs experience' },

    // Urban Boutique Hotel
    { id: 'act_6', hotelId: 'hotel_3', name: 'Wine Tasting Tour', capacityPerSlot: 10, duration: 180, basePrice: 125, currency: 'USD', description: 'Curated wine tour of Napa Valley' },
    { id: 'act_7', hotelId: 'hotel_3', name: 'City Walking Tour', capacityPerSlot: 15, duration: 120, basePrice: 49, currency: 'USD', description: 'Historic neighborhood exploration' },

    // Desert Oasis Resort
    { id: 'act_8', hotelId: 'hotel_4', name: 'Desert Jeep Safari', capacityPerSlot: 8, duration: 180, basePrice: 119, currency: 'USD', description: 'Off-road desert adventure' },
    { id: 'act_9', hotelId: 'hotel_4', name: 'Stargazing Experience', capacityPerSlot: 20, duration: 90, basePrice: 59, currency: 'USD', description: 'Astronomy session with expert' },

    // Lakeside Retreat
    { id: 'act_10', hotelId: 'hotel_5', name: 'Kayak Adventure', capacityPerSlot: 10, duration: 120, basePrice: 65, currency: 'USD', description: 'Guided kayak tour of the lake' },
    { id: 'act_11', hotelId: 'hotel_5', name: 'Fishing Charter', capacityPerSlot: 4, duration: 240, basePrice: 199, currency: 'USD', description: 'Private fishing expedition' },
];

// ============================================================================
// Guests (30 unique guests)
// ============================================================================

const firstNames = ['James', 'Emma', 'Michael', 'Sophia', 'William', 'Olivia', 'Alexander', 'Isabella', 'Daniel', 'Mia', 'David', 'Charlotte', 'Joseph', 'Amelia', 'Henry', 'Harper', 'Benjamin', 'Evelyn', 'Samuel', 'Abigail', 'Sebastian', 'Emily', 'Jack', 'Elizabeth', 'Aiden', 'Sofia', 'Owen', 'Avery', 'Lucas', 'Ella'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'];

export const mockGuests: Guest[] = Array.from({ length: 30 }, (_, i) => ({
    id: `guest_${i + 1}`,
    firstName: firstNames[i % firstNames.length],
    lastName: lastNames[i % lastNames.length],
    email: `${firstNames[i % firstNames.length].toLowerCase()}.${lastNames[i % lastNames.length].toLowerCase()}@email.com`,
    phone: `+1-555-${String(1000 + i).padStart(4, '0')}`,
}));

// ============================================================================
// Generate Activity Slots (next 30 days)
// ============================================================================

function generateActivitySlots(): ActivitySlot[] {
    const slots: ActivitySlot[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    mockActivityTypes.forEach((activity) => {
        for (let day = 0; day < 30; day++) {
            const date = addDays(today, day);
            // Generate 2-3 slots per day per activity
            const slotsPerDay = 2 + Math.floor(Math.random() * 2);

            for (let slot = 0; slot < slotsPerDay; slot++) {
                const hour = 9 + slot * 3; // 9am, 12pm, 3pm
                const start = new Date(date);
                start.setHours(hour, 0, 0, 0);
                const end = new Date(start);
                end.setMinutes(end.getMinutes() + activity.duration);

                const bookedCount = Math.floor(Math.random() * (activity.capacityPerSlot * 0.7));

                slots.push({
                    id: `slot_${activity.id}_${formatDate(date)}_${slot}`,
                    activityTypeId: activity.id,
                    start: start.toISOString(),
                    end: end.toISOString(),
                    capacity: activity.capacityPerSlot,
                    bookedCount,
                    closed: Math.random() < 0.05, // 5% chance of being closed
                });
            }
        }
    });

    return slots;
}

export const mockActivitySlots = generateActivitySlots();

// ============================================================================
// Reservations (75 reservations)
// ============================================================================

const statuses: ReservationStatus[] = ['PENDING', 'CONFIRMED', 'CANCELLED'];
const channels = ['DIRECT', 'OTA', 'CORPORATE'] as const;

function generateReservations(): Reservation[] {
    const reservations: Reservation[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 75; i++) {
        const isRoom = i % 4 !== 0; // 75% room bookings, 25% activity bookings
        const hotel = mockHotels[i % mockHotels.length];
        const guest = mockGuests[i % mockGuests.length];
        const status = statuses[i % 3];
        const channel = channels[i % 3];

        // Check-in date: spread from -30 days to +60 days from today
        const checkInOffset = Math.floor((i - 37) * 1.2); // Range from ~-45 to +45 days
        const checkInDate = addDays(today, checkInOffset);
        const nights = 1 + Math.floor(Math.random() * 6); // 1-6 nights
        const checkOutDate = addDays(checkInDate, nights);

        const createdDate = addDays(checkInDate, -(7 + Math.floor(Math.random() * 30))); // 7-37 days before check-in

        if (isRoom) {
            // Room reservation
            const hotelRoomTypes = mockRoomTypes.filter(rt => rt.hotelId === hotel.id);
            const roomType = hotelRoomTypes[i % hotelRoomTypes.length];
            const guestsCount = 1 + Math.floor(Math.random() * Math.min(roomType.capacity, 4));
            const nightlyRate = roomType.basePrice + Math.floor(Math.random() * 50);
            const subtotal = nightlyRate * nights;
            const taxes = Math.round(subtotal * 0.12 * 100) / 100;
            const fees = Math.round(subtotal * 0.03 * 100) / 100;
            const total = Math.round((subtotal + taxes + fees) * 100) / 100;

            reservations.push({
                id: `RES-${String(i + 1).padStart(5, '0')}`,
                hotelId: hotel.id,
                hotelName: hotel.name,
                guestId: guest.id,
                guest,
                roomTypeId: roomType.id,
                roomTypeName: roomType.name,
                checkInDate: formatDate(checkInDate),
                checkOutDate: formatDate(checkOutDate),
                guests: guestsCount,
                priceDetails: {
                    nights: Array.from({ length: nights }, (_, n) => ({
                        date: formatDate(addDays(checkInDate, n)),
                        rate: nightlyRate,
                    })),
                    subtotal,
                    taxes,
                    fees,
                    total,
                    currency: 'USD',
                },
                priceTotal: total,
                currency: 'USD',
                status,
                channel,
                createdAt: createdDate.toISOString(),
                updatedAt: status !== 'PENDING' ? addDays(createdDate, 1).toISOString() : undefined,
                cancelledAt: status === 'CANCELLED' ? addDays(createdDate, 2).toISOString() : undefined,
            });
        } else {
            // Activity reservation
            const hotelActivities = mockActivityTypes.filter(a => a.hotelId === hotel.id);
            const activity = hotelActivities[i % hotelActivities.length];
            const activitySlots = mockActivitySlots.filter(s => s.activityTypeId === activity.id);
            const slot = activitySlots[i % activitySlots.length];
            const guestsCount = 1 + Math.floor(Math.random() * 3);
            const subtotal = activity.basePrice * guestsCount;
            const taxes = Math.round(subtotal * 0.08 * 100) / 100;
            const total = Math.round((subtotal + taxes) * 100) / 100;

            reservations.push({
                id: `RES-${String(i + 1).padStart(5, '0')}`,
                hotelId: hotel.id,
                hotelName: hotel.name,
                guestId: guest.id,
                guest,
                activityTypeId: activity.id,
                activityTypeName: activity.name,
                slotId: slot?.id,
                slotStart: slot?.start,
                slotEnd: slot?.end,
                guests: guestsCount,
                priceDetails: {
                    subtotal,
                    taxes,
                    fees: 0,
                    total,
                    currency: 'USD',
                },
                priceTotal: total,
                currency: 'USD',
                status,
                channel,
                createdAt: createdDate.toISOString(),
                updatedAt: status !== 'PENDING' ? addDays(createdDate, 1).toISOString() : undefined,
                cancelledAt: status === 'CANCELLED' ? addDays(createdDate, 2).toISOString() : undefined,
            });
        }
    }

    return reservations;
}

export const mockReservations = generateReservations();

// ============================================================================
// Payments (1 per reservation)
// ============================================================================

const paymentMethods: PaymentMethodCategory[] = ['CARD', 'DIGITAL_WALLET', 'BANK_TRANSFER', 'CARD', 'CARD'];
const paymentProviders = ['stripe', 'paypal', 'stripe', 'stripe', 'manual'];

function getPaymentStatus(resStatus: ReservationStatus): PaymentStatus {
    switch (resStatus) {
        case 'CONFIRMED':
            return 'COMPLETED';
        case 'CANCELLED':
            return 'REFUNDED';
        case 'PENDING':
            return 'PENDING';
        default:
            return 'PENDING';
    }
}

export const mockPayments: Payment[] = mockReservations.map((res, i) => ({
    id: `PAY-${String(i + 1).padStart(5, '0')}`,
    reservationId: res.id,
    amount: res.priceTotal,
    currency: res.currency,
    methodCategory: paymentMethods[i % paymentMethods.length],
    methodDisplay: paymentMethods[i % paymentMethods.length] === 'CARD' ? `Visa •••• ${String(1000 + (i * 111) % 9000).slice(-4)}` : undefined,
    status: getPaymentStatus(res.status),
    provider: paymentProviders[i % paymentProviders.length],
    providerReference: `${paymentProviders[i % paymentProviders.length]}_${res.id}`,
    refundedAmount: res.status === 'CANCELLED' ? res.priceTotal : 0,
    createdAt: res.createdAt,
    updatedAt: res.updatedAt,
}));

// ============================================================================
// Booking Metrics
// ============================================================================

function generateBookingMetrics(): BookingMetrics {
    const confirmed = mockReservations.filter(r => r.status === 'CONFIRMED');
    const pending = mockReservations.filter(r => r.status === 'PENDING');
    const cancelled = mockReservations.filter(r => r.status === 'CANCELLED');

    const totalRevenue = confirmed.reduce((sum, r) => sum + r.priceTotal, 0);
    const roomReservations = mockReservations.filter(r => r.roomTypeId);
    const avgDailyRate = roomReservations.length > 0
        ? roomReservations.reduce((sum, r) => {
            const nights = r.priceDetails.nights?.length || 1;
            return sum + (r.priceTotal / nights);
        }, 0) / roomReservations.length
        : 0;

    // Generate revenue and occupancy by day for last 30 days
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const revenueByDay = Array.from({ length: 30 }, (_, i) => {
        const date = addDays(today, -29 + i);
        const dateStr = formatDate(date);
        const dayRevenue = mockReservations
            .filter(r => r.status === 'CONFIRMED' && r.checkInDate && r.checkInDate <= dateStr && r.checkOutDate && r.checkOutDate > dateStr)
            .reduce((sum, r) => {
                const nights = r.priceDetails.nights?.length || 1;
                return sum + (r.priceTotal / nights);
            }, 0);
        return { date: dateStr, revenue: Math.round(dayRevenue * 100) / 100 };
    });

    const totalRooms = mockRoomTypes.length * 10; // Assume 10 rooms per type
    const occupancyByDay = Array.from({ length: 30 }, (_, i) => {
        const date = addDays(today, -29 + i);
        const dateStr = formatDate(date);
        const occupiedRooms = mockReservations
            .filter(r => r.status === 'CONFIRMED' && r.roomTypeId && r.checkInDate && r.checkInDate <= dateStr && r.checkOutDate && r.checkOutDate > dateStr)
            .length;
        return { date: dateStr, occupancy: Math.round((occupiedRooms / totalRooms) * 100 * 10) / 10 };
    });

    return {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalBookings: mockReservations.length,
        confirmedBookings: confirmed.length,
        pendingBookings: pending.length,
        cancelledBookings: cancelled.length,
        averageOccupancy: Math.round(occupancyByDay.reduce((sum, d) => sum + d.occupancy, 0) / occupancyByDay.length * 10) / 10,
        averageDailyRate: Math.round(avgDailyRate * 100) / 100,
        revenueByDay,
        bookingsByStatus: [
            { status: 'CONFIRMED', count: confirmed.length },
            { status: 'PENDING', count: pending.length },
            { status: 'CANCELLED', count: cancelled.length },
        ],
        occupancyByDay,
    };
}

export const mockBookingMetrics = generateBookingMetrics();

// ============================================================================
// Availability Data (for calendar view)
// ============================================================================

export function generateRoomAvailability(hotelId: string, startDate: string, endDate: string): RoomAvailability[] {
    const availability: RoomAvailability[] = [];
    const hotelRoomTypes = mockRoomTypes.filter(rt => rt.hotelId === hotelId);
    const start = new Date(startDate);
    const end = new Date(endDate);

    for (let date = new Date(start); date <= end; date = addDays(date, 1)) {
        const dateStr = formatDate(date);

        hotelRoomTypes.forEach(roomType => {
            const totalRooms = 10; // Assume 10 rooms per type
            const bookedRooms = mockReservations.filter(
                r => r.status === 'CONFIRMED' &&
                    r.roomTypeId === roomType.id &&
                    r.checkInDate && r.checkInDate <= dateStr &&
                    r.checkOutDate && r.checkOutDate > dateStr
            ).length;

            availability.push({
                date: dateStr,
                roomTypeId: roomType.id,
                roomTypeName: roomType.name,
                totalRooms,
                availableRooms: totalRooms - bookedRooms,
                bookedRooms,
                closed: Math.random() < 0.02, // 2% chance of closed
            });
        });
    }

    return availability;
}

export function generateActivityAvailability(hotelId: string, startDate: string, endDate: string): ActivitySlotAvailability[] {
    const availability: ActivitySlotAvailability[] = [];
    const hotelActivities = mockActivityTypes.filter(a => a.hotelId === hotelId);
    const start = new Date(startDate);
    const end = new Date(endDate);

    for (let date = new Date(start); date <= end; date = addDays(date, 1)) {
        const dateStr = formatDate(date);

        hotelActivities.forEach(activity => {
            const daySlots = mockActivitySlots.filter(
                s => s.activityTypeId === activity.id && s.start.startsWith(dateStr)
            );

            daySlots.forEach(slot => {
                availability.push({
                    date: dateStr,
                    slotId: slot.id,
                    activityTypeId: activity.id,
                    activityTypeName: activity.name,
                    start: slot.start,
                    end: slot.end,
                    totalCapacity: slot.capacity,
                    availableCapacity: slot.capacity - slot.bookedCount,
                    bookedCount: slot.bookedCount,
                    closed: slot.closed,
                });
            });
        });
    }

    return availability;
}
