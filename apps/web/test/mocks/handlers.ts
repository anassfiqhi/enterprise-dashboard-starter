import { http, HttpResponse, delay } from 'msw';
import { mockOrders, mockAdminSession, mockMetrics } from './fixtures';
import {
  mockHotels,
  mockRoomTypes,
  mockActivityTypes,
  mockReservations,
  mockPayments,
  mockBookingMetrics,
  generateRoomAvailability,
  generateActivityAvailability,
} from './booking-fixtures';
import type { Reservation, ReservationStatus } from '@repo/shared';

const API_URL = 'http://localhost:3001';

export const handlers = [
  // Session endpoint
  http.get(`${API_URL}/api/v1/session`, async () => {
    await delay(50);
    return HttpResponse.json({
      data: mockAdminSession,
      meta: { requestId: 'test-request-id' },
      error: null,
    });
  }),

  // Orders list endpoint
  http.get(`${API_URL}/api/v1/orders`, async ({ request }) => {
    await delay(50);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';

    let filteredOrders = [...mockOrders];

    if (search) {
      filteredOrders = filteredOrders.filter(
        (o) => o.id.includes(search) || o.customer.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status) {
      filteredOrders = filteredOrders.filter((o) => o.status === status);
    }

    const start = (page - 1) * pageSize;
    const paginatedOrders = filteredOrders.slice(start, start + pageSize);

    return HttpResponse.json({
      data: paginatedOrders,
      meta: {
        requestId: 'test-request-id',
        total: filteredOrders.length,
        page,
        pageSize,
        totalPages: Math.ceil(filteredOrders.length / pageSize),
      },
      error: null,
    });
  }),

  // Single order endpoint
  http.get(`${API_URL}/api/v1/orders/:id`, async ({ params }) => {
    await delay(50);
    const order = mockOrders.find((o) => o.id === params.id);
    if (!order) {
      return HttpResponse.json(
        { data: null, meta: { requestId: 'test' }, error: { code: 'NOT_FOUND', message: 'Order not found' } },
        { status: 404 }
      );
    }
    return HttpResponse.json({ data: order, meta: { requestId: 'test' }, error: null });
  }),

  // Create order endpoint
  http.post(`${API_URL}/api/v1/orders`, async ({ request }) => {
    await delay(50);
    const body = await request.json() as { customer: string; amount: number };
    const newOrder = {
      id: `ORD-${String(mockOrders.length + 1).padStart(5, '0')}`,
      status: 'pending' as const,
      customer: body.customer,
      amount: body.amount,
      createdAt: new Date().toISOString(),
    };
    return HttpResponse.json({ data: newOrder, meta: { requestId: 'test' }, error: null }, { status: 201 });
  }),

  // Update order endpoint
  http.patch(`${API_URL}/api/v1/orders/:id`, async ({ params, request }) => {
    await delay(50);
    const updates = await request.json() as Partial<typeof mockOrders[0]>;
    const order = mockOrders.find((o) => o.id === params.id);
    if (!order) {
      return HttpResponse.json(
        { data: null, meta: { requestId: 'test' }, error: { code: 'NOT_FOUND', message: 'Order not found' } },
        { status: 404 }
      );
    }
    const updatedOrder = { ...order, ...updates };
    return HttpResponse.json({ data: updatedOrder, meta: { requestId: 'test' }, error: null });
  }),

  // Metrics endpoint
  http.get(`${API_URL}/api/v1/metrics`, async () => {
    await delay(50);
    return HttpResponse.json({
      data: mockMetrics,
      meta: { requestId: 'test-request-id' },
      error: null,
    });
  }),

  // Auth sign-in endpoint
  http.post(`${API_URL}/api/auth/sign-in/email`, async ({ request }) => {
    await delay(100);
    const { email, password } = await request.json() as { email: string; password: string };
    if (email === 'admin@example.com' && password === 'admin123') {
      return HttpResponse.json({
        user: mockAdminSession.user,
        session: { id: 'sess_1', expiresAt: new Date(Date.now() + 86400000).toISOString() }
      });
    }
    return HttpResponse.json({ error: { message: 'Invalid credentials' } }, { status: 401 });
  }),

  // Auth sign-out endpoint
  http.post(`${API_URL}/api/auth/sign-out`, async () => {
    await delay(50);
    return HttpResponse.json({ success: true });
  }),

  // Auth sign-up endpoint
  http.post(`${API_URL}/api/auth/sign-up/email`, async ({ request }) => {
    await delay(100);
    const { email, password, name } = await request.json() as { email: string; password: string; name: string };
    return HttpResponse.json({
      user: { id: 'new_user', email, name },
      session: { id: 'sess_new', expiresAt: new Date(Date.now() + 86400000).toISOString() },
    });
  }),

  // ============================================================================
  // Booking API Endpoints
  // ============================================================================

  // Hotels list endpoint
  http.get(`${API_URL}/api/v1/hotels`, async ({ request }) => {
    await delay(50);
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';

    let filteredHotels = [...mockHotels];
    if (search) {
      filteredHotels = filteredHotels.filter(
        (h) => h.name.toLowerCase().includes(search.toLowerCase()) ||
               h.address?.city?.toLowerCase().includes(search.toLowerCase())
      );
    }

    return HttpResponse.json({
      data: filteredHotels,
      meta: { requestId: 'test-request-id' },
      error: null,
    });
  }),

  // Reservations list endpoint
  http.get(`${API_URL}/api/v1/reservations`, async ({ request }) => {
    await delay(50);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') as ReservationStatus | '';
    const hotelId = url.searchParams.get('hotelId') || '';
    const checkInFrom = url.searchParams.get('checkInFrom') || '';
    const checkInTo = url.searchParams.get('checkInTo') || '';
    const sort = url.searchParams.get('sort') || '-createdAt';

    let filteredReservations = [...mockReservations];

    // Apply filters
    if (search) {
      filteredReservations = filteredReservations.filter(
        (r) => r.id.toLowerCase().includes(search.toLowerCase()) ||
               r.guest?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
               r.guest?.lastName?.toLowerCase().includes(search.toLowerCase()) ||
               r.guest?.email?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status) {
      filteredReservations = filteredReservations.filter((r) => r.status === status);
    }

    if (hotelId) {
      filteredReservations = filteredReservations.filter((r) => r.hotelId === hotelId);
    }

    if (checkInFrom) {
      filteredReservations = filteredReservations.filter(
        (r) => r.checkInDate && r.checkInDate >= checkInFrom
      );
    }

    if (checkInTo) {
      filteredReservations = filteredReservations.filter(
        (r) => r.checkInDate && r.checkInDate <= checkInTo
      );
    }

    // Apply sorting
    const sortField = sort.startsWith('-') ? sort.slice(1) : sort;
    const sortDir = sort.startsWith('-') ? -1 : 1;
    filteredReservations.sort((a, b) => {
      const aVal = a[sortField as keyof Reservation];
      const bVal = b[sortField as keyof Reservation];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDir * aVal.localeCompare(bVal);
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir * (aVal - bVal);
      }
      return 0;
    });

    const start = (page - 1) * pageSize;
    const paginatedReservations = filteredReservations.slice(start, start + pageSize);

    return HttpResponse.json({
      data: paginatedReservations,
      meta: {
        requestId: 'test-request-id',
        total: filteredReservations.length,
        page,
        pageSize,
        totalPages: Math.ceil(filteredReservations.length / pageSize),
      },
      error: null,
    });
  }),

  // Single reservation endpoint
  http.get(`${API_URL}/api/v1/reservations/:id`, async ({ params }) => {
    await delay(50);
    const reservation = mockReservations.find((r) => r.id === params.id);
    if (!reservation) {
      return HttpResponse.json(
        { data: null, meta: { requestId: 'test' }, error: { code: 'NOT_FOUND', message: 'Reservation not found' } },
        { status: 404 }
      );
    }
    // Include payments for the reservation
    const payments = mockPayments.filter((p) => p.reservationId === reservation.id);
    return HttpResponse.json({
      data: { ...reservation, payments },
      meta: { requestId: 'test' },
      error: null,
    });
  }),

  // Update reservation status endpoint
  http.patch(`${API_URL}/api/v1/reservations/:id`, async ({ params, request }) => {
    await delay(50);
    const updates = await request.json() as { status?: ReservationStatus };
    const reservationIndex = mockReservations.findIndex((r) => r.id === params.id);
    if (reservationIndex === -1) {
      return HttpResponse.json(
        { data: null, meta: { requestId: 'test' }, error: { code: 'NOT_FOUND', message: 'Reservation not found' } },
        { status: 404 }
      );
    }
    const updatedReservation = {
      ...mockReservations[reservationIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    // Update in mock array for consistency
    mockReservations[reservationIndex] = updatedReservation;
    return HttpResponse.json({ data: updatedReservation, meta: { requestId: 'test' }, error: null });
  }),

  // Cancel reservation endpoint
  http.post(`${API_URL}/api/v1/reservations/:id/cancel`, async ({ params, request }) => {
    await delay(100);
    const body = await request.json() as { reason?: string };
    const reservationIndex = mockReservations.findIndex((r) => r.id === params.id);
    if (reservationIndex === -1) {
      return HttpResponse.json(
        { data: null, meta: { requestId: 'test' }, error: { code: 'NOT_FOUND', message: 'Reservation not found' } },
        { status: 404 }
      );
    }
    const reservation = mockReservations[reservationIndex];
    if (reservation.status === 'CANCELLED') {
      return HttpResponse.json(
        { data: null, meta: { requestId: 'test' }, error: { code: 'BAD_REQUEST', message: 'Reservation already cancelled' } },
        { status: 400 }
      );
    }
    const cancelledReservation = {
      ...reservation,
      status: 'CANCELLED' as const,
      cancelledAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockReservations[reservationIndex] = cancelledReservation;
    return HttpResponse.json({ data: cancelledReservation, meta: { requestId: 'test' }, error: null });
  }),

  // Refund reservation endpoint
  http.post(`${API_URL}/api/v1/reservations/:id/refund`, async ({ params, request }) => {
    await delay(100);
    const body = await request.json() as { amount?: number; reason?: string };
    const reservation = mockReservations.find((r) => r.id === params.id);
    if (!reservation) {
      return HttpResponse.json(
        { data: null, meta: { requestId: 'test' }, error: { code: 'NOT_FOUND', message: 'Reservation not found' } },
        { status: 404 }
      );
    }
    const payment = mockPayments.find((p) => p.reservationId === reservation.id);
    if (!payment) {
      return HttpResponse.json(
        { data: null, meta: { requestId: 'test' }, error: { code: 'NOT_FOUND', message: 'No payment found' } },
        { status: 404 }
      );
    }
    const refundAmount = body.amount ?? payment.amount;
    const updatedPayment = {
      ...payment,
      status: refundAmount >= payment.amount ? 'REFUNDED' as const : 'PARTIALLY_REFUNDED' as const,
      refundedAmount: payment.refundedAmount + refundAmount,
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json({ data: updatedPayment, meta: { requestId: 'test' }, error: null });
  }),

  // Availability endpoint
  http.get(`${API_URL}/api/v1/availability`, async ({ request }) => {
    await delay(50);
    const url = new URL(request.url);
    const hotelId = url.searchParams.get('hotelId') || mockHotels[0].id;
    const startDate = url.searchParams.get('startDate') || new Date().toISOString().split('T')[0];
    const endDate = url.searchParams.get('endDate') || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
    const viewType = url.searchParams.get('viewType') || 'rooms';

    let data;
    if (viewType === 'rooms') {
      data = generateRoomAvailability(hotelId, startDate, endDate);
    } else {
      data = generateActivityAvailability(hotelId, startDate, endDate);
    }

    return HttpResponse.json({
      data,
      meta: { requestId: 'test-request-id', hotelId, startDate, endDate, viewType },
      error: null,
    });
  }),

  // Booking metrics endpoint
  http.get(`${API_URL}/api/v1/booking-metrics`, async () => {
    await delay(50);
    return HttpResponse.json({
      data: mockBookingMetrics,
      meta: { requestId: 'test-request-id' },
      error: null,
    });
  }),
];

// Error scenario handlers - use with server.use() to override defaults
export const errorHandlers = {
  unauthorized: http.get(`${API_URL}/api/v1/session`, () => {
    return HttpResponse.json(
      { data: null, meta: { requestId: 'test' }, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 }
    );
  }),

  forbidden: http.get(`${API_URL}/api/v1/orders`, () => {
    return HttpResponse.json(
      { data: null, meta: { requestId: 'test' }, error: { code: 'FORBIDDEN', message: 'No permission' } },
      { status: 403 }
    );
  }),

  serverError: http.get(`${API_URL}/api/v1/orders`, () => {
    return HttpResponse.json(
      { data: null, meta: { requestId: 'test' }, error: { code: 'INTERNAL_ERROR', message: 'Server error' } },
      { status: 500 }
    );
  }),

  networkError: http.get(`${API_URL}/api/v1/orders`, () => {
    return HttpResponse.error();
  }),

  sessionUnauthenticated: http.get(`${API_URL}/api/v1/session`, () => {
    return HttpResponse.json(
      { data: null, meta: { requestId: 'test' }, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 }
    );
  }),

  sessionServerError: http.get(`${API_URL}/api/v1/session`, () => {
    return HttpResponse.json(
      { data: null, meta: { requestId: 'test' }, error: { code: 'INTERNAL_ERROR', message: 'Server error' } },
      { status: 500 }
    );
  }),
};
