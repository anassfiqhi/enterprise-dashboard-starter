import { http, HttpResponse, delay } from 'msw';
import { mockAdminSession, mockMetrics } from '../fixtures/sessions';
import { mockHotels, mockRoomTypes, mockActivityTypes } from '../fixtures/hotels';
import { mockGuests } from '../fixtures/guests';
import { mockReservations } from '../fixtures/reservations';
import { mockBookingMetrics } from '../fixtures/metrics';
import {
  mockPhysicalRooms,
  mockRoomInventory,
  generateRoomAvailability,
} from '../fixtures/inventory';
import { mockPricingRules, mockPromoCodes } from '../fixtures/pricing';

const API_URL = 'http://localhost:3001';

export const handlers = [
  // ============================================================================
  // Session / Auth
  // ============================================================================

  http.get(`${API_URL}/api/v1/session`, async () => {
    await delay(50);
    return HttpResponse.json({
      data: mockAdminSession,
      meta: { requestId: 'req_test_session' },
      error: null,
    });
  }),

  http.post(`${API_URL}/api/auth/sign-in/email`, async () => {
    await delay(100);
    return HttpResponse.json({
      token: 'test-jwt-token',
      user: mockAdminSession.user,
    });
  }),

  http.post(`${API_URL}/api/auth/sign-out`, async () => {
    await delay(50);
    return HttpResponse.json({ success: true });
  }),

  // ============================================================================
  // Metrics
  // ============================================================================

  http.get(`${API_URL}/api/v1/metrics`, async () => {
    await delay(50);
    return HttpResponse.json({
      data: mockMetrics,
      meta: { requestId: 'req_test_metrics' },
      error: null,
    });
  }),

  http.get(`${API_URL}/api/v1/booking-metrics`, async () => {
    await delay(50);
    return HttpResponse.json({
      data: mockBookingMetrics,
      meta: { requestId: 'req_test_booking_metrics' },
      error: null,
    });
  }),

  // ============================================================================
  // Hotels (via Better Auth organization endpoints — note: mapped in saga)
  // ============================================================================

  http.get(`${API_URL}/api/v1/hotels`, async () => {
    await delay(50);
    return HttpResponse.json({
      data: mockHotels,
      meta: { requestId: 'req_test_hotels', total: mockHotels.length },
      error: null,
    });
  }),

  http.get(`${API_URL}/api/v1/hotels/:hotelId`, async ({ params }) => {
    const hotel = mockHotels.find((h) => h.id === params.hotelId);
    if (!hotel) {
      return HttpResponse.json(
        {
          data: null,
          meta: { requestId: 'req_404' },
          error: { code: 'NOT_FOUND', message: 'Hotel not found' },
        },
        { status: 404 }
      );
    }
    return HttpResponse.json({
      data: {
        ...hotel,
        roomTypes: mockRoomTypes.filter((rt) => rt.hotelId === hotel.id),
        activityTypes: mockActivityTypes.filter((at) => at.hotelId === hotel.id),
      },
      meta: { requestId: 'req_test_hotel' },
      error: null,
    });
  }),

  // ============================================================================
  // Room Types
  // ============================================================================

  http.get(`${API_URL}/api/v1/hotels/:hotelId/room-types`, async ({ params }) => {
    const rts = mockRoomTypes.filter((rt) => rt.hotelId === params.hotelId);
    return HttpResponse.json({ data: rts, meta: { requestId: 'req_room_types' }, error: null });
  }),

  http.post(`${API_URL}/api/v1/hotels/:hotelId/room-types`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const newRt = { id: 'rt_new', ...body };
    return HttpResponse.json(
      { data: newRt, meta: { requestId: 'req_create_rt' }, error: null },
      { status: 201 }
    );
  }),

  http.patch(`${API_URL}/api/v1/hotels/:hotelId/room-types/:id`, async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const rt = mockRoomTypes.find((r) => r.id === params.id);
    return HttpResponse.json({
      data: { ...rt, ...body },
      meta: { requestId: 'req_update_rt' },
      error: null,
    });
  }),

  http.delete(`${API_URL}/api/v1/hotels/:hotelId/room-types/:id`, async () => {
    return HttpResponse.json({ data: null, meta: { requestId: 'req_delete_rt' }, error: null });
  }),

  // ============================================================================
  // Activity Types
  // ============================================================================

  http.get(`${API_URL}/api/v1/hotels/:hotelId/activity-types`, async ({ params }) => {
    const ats = mockActivityTypes.filter((at) => at.hotelId === params.hotelId);
    return HttpResponse.json({ data: ats, meta: { requestId: 'req_activity_types' }, error: null });
  }),

  http.post(`${API_URL}/api/v1/hotels/:hotelId/activity-types`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      { data: { id: 'at_new', ...body }, meta: { requestId: 'req_create_at' }, error: null },
      { status: 201 }
    );
  }),

  http.patch(
    `${API_URL}/api/v1/hotels/:hotelId/activity-types/:id`,
    async ({ params, request }) => {
      const body = (await request.json()) as Record<string, unknown>;
      const at = mockActivityTypes.find((a) => a.id === params.id);
      return HttpResponse.json({
        data: { ...at, ...body },
        meta: { requestId: 'req_update_at' },
        error: null,
      });
    }
  ),

  http.delete(`${API_URL}/api/v1/hotels/:hotelId/activity-types/:id`, async () => {
    return HttpResponse.json({ data: null, meta: { requestId: 'req_delete_at' }, error: null });
  }),

  // ============================================================================
  // Guests
  // ============================================================================

  http.get(`${API_URL}/api/v1/guests`, async () => {
    await delay(50);
    return HttpResponse.json({
      data: mockGuests,
      meta: { requestId: 'req_guests', total: mockGuests.length, page: 1, pageSize: 20 },
      error: null,
    });
  }),

  http.get(`${API_URL}/api/v1/guests/:guestId`, async ({ params }) => {
    const guest = mockGuests.find((g) => g.id === params.guestId);
    if (!guest) {
      return HttpResponse.json(
        {
          data: null,
          meta: { requestId: 'req_404' },
          error: { code: 'NOT_FOUND', message: 'Guest not found' },
        },
        { status: 404 }
      );
    }
    return HttpResponse.json({ data: guest, meta: { requestId: 'req_guest' }, error: null });
  }),

  http.post(`${API_URL}/api/v1/guests`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      { data: { id: 'guest_new', ...body }, meta: { requestId: 'req_create_guest' }, error: null },
      { status: 201 }
    );
  }),

  http.patch(`${API_URL}/api/v1/guests/:guestId`, async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const guest = mockGuests.find((g) => g.id === params.guestId);
    return HttpResponse.json({
      data: { ...guest, ...body },
      meta: { requestId: 'req_update_guest' },
      error: null,
    });
  }),

  http.delete(`${API_URL}/api/v1/guests/:guestId`, async () => {
    return HttpResponse.json({ data: null, meta: { requestId: 'req_delete_guest' }, error: null });
  }),

  // ============================================================================
  // Reservations
  // ============================================================================

  http.get(`${API_URL}/api/v1/reservations`, async () => {
    await delay(50);
    return HttpResponse.json({
      data: mockReservations,
      meta: {
        requestId: 'req_reservations',
        total: mockReservations.length,
        page: 1,
        pageSize: 20,
      },
      error: null,
    });
  }),

  http.get(`${API_URL}/api/v1/reservations/:reservationId`, async ({ params }) => {
    const res = mockReservations.find((r) => r.id === params.reservationId);
    if (!res) {
      return HttpResponse.json(
        {
          data: null,
          meta: { requestId: 'req_404' },
          error: { code: 'NOT_FOUND', message: 'Reservation not found' },
        },
        { status: 404 }
      );
    }
    return HttpResponse.json({ data: res, meta: { requestId: 'req_reservation' }, error: null });
  }),

  http.post(`${API_URL}/api/v1/reservations`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      { data: { id: 'res_new', ...body }, meta: { requestId: 'req_create_res' }, error: null },
      { status: 201 }
    );
  }),

  http.patch(`${API_URL}/api/v1/reservations/:reservationId`, async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const res = mockReservations.find((r) => r.id === params.reservationId);
    return HttpResponse.json({
      data: { ...res, ...body },
      meta: { requestId: 'req_update_res' },
      error: null,
    });
  }),

  http.delete(`${API_URL}/api/v1/reservations/:reservationId`, async () => {
    return HttpResponse.json({ data: null, meta: { requestId: 'req_delete_res' }, error: null });
  }),

  // ============================================================================
  // Availability
  // ============================================================================

  http.get(`${API_URL}/api/v1/availability`, async ({ request }) => {
    const url = new URL(request.url);
    const hotelId = url.searchParams.get('hotelId') || 'hotel_1';
    const startDate = url.searchParams.get('startDate') || '2026-05-01';
    return HttpResponse.json({
      data: generateRoomAvailability(hotelId, startDate),
      meta: { requestId: 'req_availability' },
      error: null,
    });
  }),

  // ============================================================================
  // Physical Rooms
  // ============================================================================

  http.get(`${API_URL}/api/v1/hotels/:hotelId/rooms`, async ({ params }) => {
    const rooms = mockPhysicalRooms.filter((r) => r.hotelId === params.hotelId);
    return HttpResponse.json({ data: rooms, meta: { requestId: 'req_rooms' }, error: null });
  }),

  http.post(`${API_URL}/api/v1/hotels/:hotelId/rooms`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      { data: { id: 'room_new', ...body }, meta: { requestId: 'req_create_room' }, error: null },
      { status: 201 }
    );
  }),

  http.patch(`${API_URL}/api/v1/hotels/:hotelId/rooms/:roomId`, async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const room = mockPhysicalRooms.find((r) => r.id === params.roomId);
    return HttpResponse.json({
      data: { ...room, ...body },
      meta: { requestId: 'req_update_room' },
      error: null,
    });
  }),

  http.delete(`${API_URL}/api/v1/hotels/:hotelId/rooms/:roomId`, async () => {
    return HttpResponse.json({ data: null, meta: { requestId: 'req_delete_room' }, error: null });
  }),

  // ============================================================================
  // Inventory
  // ============================================================================

  http.get(`${API_URL}/api/v1/hotels/:hotelId/inventory`, async ({ params }) => {
    const inv = mockRoomInventory.filter((i) => i.hotelId === params.hotelId);
    return HttpResponse.json({ data: inv, meta: { requestId: 'req_inventory' }, error: null });
  }),

  http.patch(`${API_URL}/api/v1/hotels/:hotelId/inventory`, async () => {
    return HttpResponse.json({
      data: { updated: true },
      meta: { requestId: 'req_update_inv' },
      error: null,
    });
  }),

  // ============================================================================
  // Pricing Rules
  // ============================================================================

  http.get(`${API_URL}/api/v1/hotels/:hotelId/pricing-rules`, async ({ params }) => {
    const rules = mockPricingRules.filter((r) => r.hotelId === params.hotelId);
    return HttpResponse.json({ data: rules, meta: { requestId: 'req_pricing' }, error: null });
  }),

  http.post(`${API_URL}/api/v1/hotels/:hotelId/pricing-rules`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      { data: { id: 'pr_new', ...body }, meta: { requestId: 'req_create_pr' }, error: null },
      { status: 201 }
    );
  }),

  http.patch(`${API_URL}/api/v1/hotels/:hotelId/pricing-rules/:id`, async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const rule = mockPricingRules.find((r) => r.id === params.id);
    return HttpResponse.json({
      data: { ...rule, ...body },
      meta: { requestId: 'req_update_pr' },
      error: null,
    });
  }),

  http.delete(`${API_URL}/api/v1/hotels/:hotelId/pricing-rules/:id`, async () => {
    return HttpResponse.json({ data: null, meta: { requestId: 'req_delete_pr' }, error: null });
  }),

  // ============================================================================
  // Promo Codes
  // ============================================================================

  http.get(`${API_URL}/api/v1/promo-codes`, async () => {
    return HttpResponse.json({
      data: mockPromoCodes,
      meta: { requestId: 'req_promos' },
      error: null,
    });
  }),

  http.post(`${API_URL}/api/v1/promo-codes`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      { data: { id: 'pc_new', ...body }, meta: { requestId: 'req_create_pc' }, error: null },
      { status: 201 }
    );
  }),

  http.patch(`${API_URL}/api/v1/promo-codes/:id`, async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const promo = mockPromoCodes.find((p) => p.id === params.id);
    return HttpResponse.json({
      data: { ...promo, ...body },
      meta: { requestId: 'req_update_pc' },
      error: null,
    });
  }),

  http.delete(`${API_URL}/api/v1/promo-codes/:id`, async () => {
    return HttpResponse.json({ data: null, meta: { requestId: 'req_delete_pc' }, error: null });
  }),

  // ============================================================================
  // SSE
  // ============================================================================

  http.get(`${API_URL}/api/v1/events`, () => {
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('data: {"type":"ping"}\n\n'));
      },
    });
    return new HttpResponse(stream, {
      headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
    });
  }),
];
