import type { BookingMetrics, Metrics } from '@repo/shared';

export const mockMetrics: Metrics = {
  totalRevenue: 125430.5,
  subscriptions: 342,
  sales: 1289,
  activeNow: 47,
};

export const mockBookingMetrics: BookingMetrics = {
  totalRevenue: 87650.0,
  totalBookings: 312,
  confirmedBookings: 245,
  pendingBookings: 42,
  cancelledBookings: 25,
  averageOccupancy: 72.4,
  averageDailyRate: 165.5,
  revenueByDay: [
    { date: '2026-04-03', revenue: 3200 },
    { date: '2026-04-04', revenue: 4100 },
    { date: '2026-04-05', revenue: 3800 },
    { date: '2026-04-06', revenue: 5200 },
    { date: '2026-04-07', revenue: 6100 },
    { date: '2026-04-08', revenue: 5900 },
    { date: '2026-04-09', revenue: 4800 },
  ],
  bookingsByStatus: [
    { status: 'CONFIRMED', count: 245 },
    { status: 'PENDING', count: 42 },
    { status: 'CANCELLED', count: 25 },
  ],
  occupancyByDay: [
    { date: '2026-04-03', occupancy: 68 },
    { date: '2026-04-04', occupancy: 72 },
    { date: '2026-04-05', occupancy: 75 },
    { date: '2026-04-06', occupancy: 80 },
    { date: '2026-04-07', occupancy: 85 },
    { date: '2026-04-08', occupancy: 82 },
    { date: '2026-04-09', occupancy: 70 },
  ],
};

export const mockReservationUpdatedEvent = {
  type: 'reservation.updated' as const,
  id: 'res_1',
  patch: { status: 'CONFIRMED' as const },
  ts: 1712623200000,
};

export const mockReservationCreatedEvent = {
  type: 'reservation.updated' as const,
  id: 'res_4',
  patch: {
    id: 'res_4',
    hotelId: 'hotel_1',
    guestId: 'guest_1',
    status: 'PENDING' as const,
  },
  ts: 1712623260000,
};
