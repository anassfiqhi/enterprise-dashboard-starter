import { http, HttpResponse, delay } from 'msw';
import { mockOrders, mockAdminSession, mockMetrics } from './fixtures';
import {
  mockHotels,
  mockRoomTypes,
  mockActivityTypes,
  mockReservations,
  mockPayments,
  mockBookingMetrics,
  mockPhysicalRooms,
  mockRoomInventory,
  mockPricingRules,
  mockPromoCodes,
  generateRoomAvailability,
  generateActivityAvailability,
} from './booking-fixtures';
import type { Reservation, ReservationStatus, PhysicalRoomStatus } from '@repo/shared';

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

  // Single hotel endpoint with room types and activities
  http.get(`${API_URL}/api/v1/hotels/:id`, async ({ params }) => {
    await delay(50);
    const hotel = mockHotels.find((h) => h.id === params.id);
    if (!hotel) {
      return HttpResponse.json(
        { data: null, meta: { requestId: 'test' }, error: { code: 'NOT_FOUND', message: 'Hotel not found' } },
        { status: 404 }
      );
    }
    const roomTypes = mockRoomTypes.filter((rt) => rt.hotelId === hotel.id);
    const activityTypes = mockActivityTypes.filter((at) => at.hotelId === hotel.id);
    return HttpResponse.json({
      data: {
        ...hotel,
        roomTypes,
        activityTypes,
        totalRooms: roomTypes.length,
        totalActivities: activityTypes.length,
      },
      meta: { requestId: 'test' },
      error: null,
    });
  }),

  // Create hotel endpoint
  http.post(`${API_URL}/api/v1/hotels`, async ({ request }) => {
    await delay(100);
    const body = await request.json() as {
      name: string;
      timezone: string;
      address?: {
        street?: string;
        city: string;
        state?: string;
        country: string;
        postalCode?: string;
      };
    };
    const newHotel = {
      id: `hotel_${Date.now()}`,
      name: body.name,
      timezone: body.timezone,
      address: body.address,
    };
    mockHotels.push(newHotel);
    return HttpResponse.json({ data: newHotel, meta: { requestId: 'test' }, error: null }, { status: 201 });
  }),

  // Update hotel endpoint
  http.patch(`${API_URL}/api/v1/hotels/:id`, async ({ params, request }) => {
    await delay(50);
    const updates = await request.json() as Partial<typeof mockHotels[0]>;
    const hotelIndex = mockHotels.findIndex((h) => h.id === params.id);
    if (hotelIndex === -1) {
      return HttpResponse.json(
        { data: null, meta: { requestId: 'test' }, error: { code: 'NOT_FOUND', message: 'Hotel not found' } },
        { status: 404 }
      );
    }
    mockHotels[hotelIndex] = { ...mockHotels[hotelIndex], ...updates };
    return HttpResponse.json({ data: mockHotels[hotelIndex], meta: { requestId: 'test' }, error: null });
  }),

  // Delete hotel endpoint
  http.delete(`${API_URL}/api/v1/hotels/:id`, async ({ params }) => {
    await delay(50);
    const hotelIndex = mockHotels.findIndex((h) => h.id === params.id);
    if (hotelIndex === -1) {
      return HttpResponse.json(
        { data: null, meta: { requestId: 'test' }, error: { code: 'NOT_FOUND', message: 'Hotel not found' } },
        { status: 404 }
      );
    }
    mockHotels.splice(hotelIndex, 1);
    // Also remove associated room types and activities
    const roomTypeIndexes = mockRoomTypes.map((rt, i) => rt.hotelId === params.id ? i : -1).filter(i => i >= 0).reverse();
    roomTypeIndexes.forEach(i => mockRoomTypes.splice(i, 1));
    const activityIndexes = mockActivityTypes.map((at, i) => at.hotelId === params.id ? i : -1).filter(i => i >= 0).reverse();
    activityIndexes.forEach(i => mockActivityTypes.splice(i, 1));
    return HttpResponse.json({ data: null, meta: { requestId: 'test' }, error: null });
  }),

  // Create room type endpoint
  http.post(`${API_URL}/api/v1/hotels/:hotelId/room-types`, async ({ params, request }) => {
    await delay(100);
    const body = await request.json() as { name: string; capacity: number; description?: string; basePrice: number; currency?: string };
    const newRoomType = {
      id: `rt_${Date.now()}`,
      hotelId: params.hotelId as string,
      name: body.name,
      capacity: body.capacity,
      description: body.description,
      basePrice: body.basePrice,
      currency: body.currency || 'USD',
    };
    mockRoomTypes.push(newRoomType);
    return HttpResponse.json({ data: newRoomType, meta: { requestId: 'test' }, error: null }, { status: 201 });
  }),

  // Update room type endpoint
  http.patch(`${API_URL}/api/v1/hotels/:hotelId/room-types/:id`, async ({ params, request }) => {
    await delay(50);
    const updates = await request.json() as Partial<typeof mockRoomTypes[0]>;
    const roomTypeIndex = mockRoomTypes.findIndex((rt) => rt.id === params.id && rt.hotelId === params.hotelId);
    if (roomTypeIndex === -1) {
      return HttpResponse.json(
        { data: null, meta: { requestId: 'test' }, error: { code: 'NOT_FOUND', message: 'Room type not found' } },
        { status: 404 }
      );
    }
    mockRoomTypes[roomTypeIndex] = { ...mockRoomTypes[roomTypeIndex], ...updates };
    return HttpResponse.json({ data: mockRoomTypes[roomTypeIndex], meta: { requestId: 'test' }, error: null });
  }),

  // Delete room type endpoint
  http.delete(`${API_URL}/api/v1/hotels/:hotelId/room-types/:id`, async ({ params }) => {
    await delay(50);
    const roomTypeIndex = mockRoomTypes.findIndex((rt) => rt.id === params.id && rt.hotelId === params.hotelId);
    if (roomTypeIndex === -1) {
      return HttpResponse.json(
        { data: null, meta: { requestId: 'test' }, error: { code: 'NOT_FOUND', message: 'Room type not found' } },
        { status: 404 }
      );
    }
    mockRoomTypes.splice(roomTypeIndex, 1);
    return HttpResponse.json({ data: null, meta: { requestId: 'test' }, error: null });
  }),

  // Create activity type endpoint
  http.post(`${API_URL}/api/v1/hotels/:hotelId/activity-types`, async ({ params, request }) => {
    await delay(100);
    const body = await request.json() as { name: string; capacityPerSlot: number; description?: string; duration: number; basePrice: number; currency?: string };
    const newActivityType = {
      id: `at_${Date.now()}`,
      hotelId: params.hotelId as string,
      name: body.name,
      capacityPerSlot: body.capacityPerSlot,
      description: body.description,
      duration: body.duration,
      basePrice: body.basePrice,
      currency: body.currency || 'USD',
    };
    mockActivityTypes.push(newActivityType);
    return HttpResponse.json({ data: newActivityType, meta: { requestId: 'test' }, error: null }, { status: 201 });
  }),

  // Update activity type endpoint
  http.patch(`${API_URL}/api/v1/hotels/:hotelId/activity-types/:id`, async ({ params, request }) => {
    await delay(50);
    const updates = await request.json() as Partial<typeof mockActivityTypes[0]>;
    const activityIndex = mockActivityTypes.findIndex((at) => at.id === params.id && at.hotelId === params.hotelId);
    if (activityIndex === -1) {
      return HttpResponse.json(
        { data: null, meta: { requestId: 'test' }, error: { code: 'NOT_FOUND', message: 'Activity type not found' } },
        { status: 404 }
      );
    }
    mockActivityTypes[activityIndex] = { ...mockActivityTypes[activityIndex], ...updates };
    return HttpResponse.json({ data: mockActivityTypes[activityIndex], meta: { requestId: 'test' }, error: null });
  }),

  // Delete activity type endpoint
  http.delete(`${API_URL}/api/v1/hotels/:hotelId/activity-types/:id`, async ({ params }) => {
    await delay(50);
    const activityIndex = mockActivityTypes.findIndex((at) => at.id === params.id && at.hotelId === params.hotelId);
    if (activityIndex === -1) {
      return HttpResponse.json(
        { data: null, meta: { requestId: 'test' }, error: { code: 'NOT_FOUND', message: 'Activity type not found' } },
        { status: 404 }
      );
    }
    mockActivityTypes.splice(activityIndex, 1);
    return HttpResponse.json({ data: null, meta: { requestId: 'test' }, error: null });
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

  // ============================================================================
  // Physical Rooms Endpoints
  // ============================================================================

  // List physical rooms for a room type
  http.get(`${API_URL}/api/v1/hotels/:hotelId/room-types/:roomTypeId/rooms`, async ({ params }) => {
    await delay(50);
    const rooms = mockPhysicalRooms.filter(
      (r) => r.hotelId === params.hotelId && r.roomTypeId === params.roomTypeId
    );
    return HttpResponse.json({
      data: rooms,
      meta: { requestId: 'test-request-id' },
      error: null,
    });
  }),

  // Create physical room
  http.post(`${API_URL}/api/v1/hotels/:hotelId/room-types/:roomTypeId/rooms`, async ({ params, request }) => {
    await delay(100);
    const body = await request.json() as {
      code: string;
      floor?: number;
      status?: PhysicalRoomStatus;
      notes?: string;
    };
    const newRoom = {
      id: `room_${Date.now()}`,
      roomTypeId: params.roomTypeId as string,
      hotelId: params.hotelId as string,
      code: body.code,
      floor: body.floor,
      status: body.status || 'AVAILABLE' as PhysicalRoomStatus,
      notes: body.notes,
    };
    mockPhysicalRooms.push(newRoom);
    return HttpResponse.json({ data: newRoom, meta: { requestId: 'test' }, error: null }, { status: 201 });
  }),

  // Update physical room
  http.patch(`${API_URL}/api/v1/hotels/:hotelId/room-types/:roomTypeId/rooms/:id`, async ({ params, request }) => {
    await delay(50);
    const updates = await request.json() as Partial<typeof mockPhysicalRooms[0]>;
    const roomIndex = mockPhysicalRooms.findIndex(
      (r) => r.id === params.id && r.hotelId === params.hotelId && r.roomTypeId === params.roomTypeId
    );
    if (roomIndex === -1) {
      return HttpResponse.json(
        { data: null, meta: { requestId: 'test' }, error: { code: 'NOT_FOUND', message: 'Room not found' } },
        { status: 404 }
      );
    }
    mockPhysicalRooms[roomIndex] = { ...mockPhysicalRooms[roomIndex], ...updates };
    return HttpResponse.json({ data: mockPhysicalRooms[roomIndex], meta: { requestId: 'test' }, error: null });
  }),

  // Delete physical room
  http.delete(`${API_URL}/api/v1/hotels/:hotelId/room-types/:roomTypeId/rooms/:id`, async ({ params }) => {
    await delay(50);
    const roomIndex = mockPhysicalRooms.findIndex(
      (r) => r.id === params.id && r.hotelId === params.hotelId && r.roomTypeId === params.roomTypeId
    );
    if (roomIndex === -1) {
      return HttpResponse.json(
        { data: null, meta: { requestId: 'test' }, error: { code: 'NOT_FOUND', message: 'Room not found' } },
        { status: 404 }
      );
    }
    mockPhysicalRooms.splice(roomIndex, 1);
    return HttpResponse.json({ data: null, meta: { requestId: 'test' }, error: null });
  }),

  // ============================================================================
  // Room Inventory Endpoints
  // ============================================================================

  // Get room inventory for a hotel
  http.get(`${API_URL}/api/v1/hotels/:hotelId/inventory`, async ({ params, request }) => {
    await delay(50);
    const url = new URL(request.url);
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const roomTypeId = url.searchParams.get('roomTypeId');

    let inventory = mockRoomInventory.filter((i) => i.hotelId === params.hotelId);

    if (startDate) {
      inventory = inventory.filter((i) => i.date >= startDate);
    }
    if (endDate) {
      inventory = inventory.filter((i) => i.date <= endDate);
    }
    if (roomTypeId) {
      inventory = inventory.filter((i) => i.roomTypeId === roomTypeId);
    }

    return HttpResponse.json({
      data: inventory,
      meta: { requestId: 'test-request-id' },
      error: null,
    });
  }),

  // Bulk update inventory
  http.put(`${API_URL}/api/v1/hotels/:hotelId/inventory`, async ({ params, request }) => {
    await delay(100);
    const updates = await request.json() as {
      roomTypeId: string;
      startDate: string;
      endDate: string;
      availableRooms?: number;
      blockedRooms?: number;
    }[];

    const updatedRecords: typeof mockRoomInventory = [];

    updates.forEach((update) => {
      // Find and update matching inventory records
      mockRoomInventory.forEach((inv, index) => {
        if (
          inv.hotelId === params.hotelId &&
          inv.roomTypeId === update.roomTypeId &&
          inv.date >= update.startDate &&
          inv.date <= update.endDate
        ) {
          if (update.availableRooms !== undefined) {
            mockRoomInventory[index].availableRooms = update.availableRooms;
          }
          if (update.blockedRooms !== undefined) {
            mockRoomInventory[index].blockedRooms = update.blockedRooms;
          }
          updatedRecords.push(mockRoomInventory[index]);
        }
      });
    });

    return HttpResponse.json({
      data: updatedRecords,
      meta: { requestId: 'test', updatedCount: updatedRecords.length },
      error: null,
    });
  }),

  // ============================================================================
  // Pricing Rules Endpoints
  // ============================================================================

  // List pricing rules for a hotel
  http.get(`${API_URL}/api/v1/hotels/:hotelId/pricing-rules`, async ({ params }) => {
    await delay(50);
    const rules = mockPricingRules.filter((r) => r.hotelId === params.hotelId);
    // Sort by priority descending
    rules.sort((a, b) => b.priority - a.priority);
    return HttpResponse.json({
      data: rules,
      meta: { requestId: 'test-request-id' },
      error: null,
    });
  }),

  // Create pricing rule
  http.post(`${API_URL}/api/v1/hotels/:hotelId/pricing-rules`, async ({ params, request }) => {
    await delay(100);
    const body = await request.json() as Omit<typeof mockPricingRules[0], 'id' | 'hotelId'>;
    const newRule = {
      id: `rule_${Date.now()}`,
      hotelId: params.hotelId as string,
      ...body,
    };
    mockPricingRules.push(newRule);
    return HttpResponse.json({ data: newRule, meta: { requestId: 'test' }, error: null }, { status: 201 });
  }),

  // Update pricing rule
  http.patch(`${API_URL}/api/v1/hotels/:hotelId/pricing-rules/:id`, async ({ params, request }) => {
    await delay(50);
    const updates = await request.json() as Partial<typeof mockPricingRules[0]>;
    const ruleIndex = mockPricingRules.findIndex((r) => r.id === params.id && r.hotelId === params.hotelId);
    if (ruleIndex === -1) {
      return HttpResponse.json(
        { data: null, meta: { requestId: 'test' }, error: { code: 'NOT_FOUND', message: 'Pricing rule not found' } },
        { status: 404 }
      );
    }
    mockPricingRules[ruleIndex] = { ...mockPricingRules[ruleIndex], ...updates };
    return HttpResponse.json({ data: mockPricingRules[ruleIndex], meta: { requestId: 'test' }, error: null });
  }),

  // Delete pricing rule
  http.delete(`${API_URL}/api/v1/hotels/:hotelId/pricing-rules/:id`, async ({ params }) => {
    await delay(50);
    const ruleIndex = mockPricingRules.findIndex((r) => r.id === params.id && r.hotelId === params.hotelId);
    if (ruleIndex === -1) {
      return HttpResponse.json(
        { data: null, meta: { requestId: 'test' }, error: { code: 'NOT_FOUND', message: 'Pricing rule not found' } },
        { status: 404 }
      );
    }
    mockPricingRules.splice(ruleIndex, 1);
    return HttpResponse.json({ data: null, meta: { requestId: 'test' }, error: null });
  }),

  // ============================================================================
  // Promo Codes Endpoints
  // ============================================================================

  // List all promo codes
  http.get(`${API_URL}/api/v1/promo-codes`, async ({ request }) => {
    await delay(50);
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';
    const hotelId = url.searchParams.get('hotelId') || '';

    let codes = [...mockPromoCodes];

    if (search) {
      codes = codes.filter((c) => c.code.toLowerCase().includes(search.toLowerCase()));
    }

    if (hotelId) {
      codes = codes.filter((c) => !c.hotelId || c.hotelId === hotelId);
    }

    if (status) {
      const today = new Date().toISOString().split('T')[0];
      codes = codes.filter((c) => {
        const isExpired = c.validTo && c.validTo < today;
        const isExhausted = c.maxUses && c.usedCount >= c.maxUses;
        const computedStatus = !c.isActive ? 'INACTIVE' : isExpired ? 'EXPIRED' : isExhausted ? 'EXHAUSTED' : 'ACTIVE';
        return computedStatus === status;
      });
    }

    return HttpResponse.json({
      data: codes,
      meta: { requestId: 'test-request-id' },
      error: null,
    });
  }),

  // Validate promo code
  http.get(`${API_URL}/api/v1/promo-codes/:code/validate`, async ({ params, request }) => {
    await delay(50);
    const url = new URL(request.url);
    const bookingAmount = parseFloat(url.searchParams.get('amount') || '0');
    const hotelId = url.searchParams.get('hotelId') || '';
    const roomTypeId = url.searchParams.get('roomTypeId') || '';

    const promo = mockPromoCodes.find((c) => c.code.toUpperCase() === (params.code as string).toUpperCase());

    if (!promo) {
      return HttpResponse.json(
        { data: null, meta: { requestId: 'test' }, error: { code: 'NOT_FOUND', message: 'Promo code not found' } },
        { status: 404 }
      );
    }

    const today = new Date().toISOString().split('T')[0];
    const isExpired = promo.validTo && promo.validTo < today;
    const isNotYetValid = promo.validFrom && promo.validFrom > today;
    const isExhausted = promo.maxUses && promo.usedCount >= promo.maxUses;
    const belowMinimum = promo.minBookingAmount && bookingAmount < promo.minBookingAmount;
    const wrongHotel = promo.hotelId && hotelId && promo.hotelId !== hotelId;
    const wrongRoomType = promo.applicableRoomTypeIds && roomTypeId && !promo.applicableRoomTypeIds.includes(roomTypeId);

    if (!promo.isActive) {
      return HttpResponse.json({
        data: { valid: false, reason: 'Promo code is inactive' },
        meta: { requestId: 'test' },
        error: null,
      });
    }

    if (isExpired) {
      return HttpResponse.json({
        data: { valid: false, reason: 'Promo code has expired' },
        meta: { requestId: 'test' },
        error: null,
      });
    }

    if (isNotYetValid) {
      return HttpResponse.json({
        data: { valid: false, reason: 'Promo code is not yet valid' },
        meta: { requestId: 'test' },
        error: null,
      });
    }

    if (isExhausted) {
      return HttpResponse.json({
        data: { valid: false, reason: 'Promo code usage limit reached' },
        meta: { requestId: 'test' },
        error: null,
      });
    }

    if (belowMinimum) {
      return HttpResponse.json({
        data: { valid: false, reason: `Minimum booking amount is $${promo.minBookingAmount}` },
        meta: { requestId: 'test' },
        error: null,
      });
    }

    if (wrongHotel) {
      return HttpResponse.json({
        data: { valid: false, reason: 'Promo code not valid for this hotel' },
        meta: { requestId: 'test' },
        error: null,
      });
    }

    if (wrongRoomType) {
      return HttpResponse.json({
        data: { valid: false, reason: 'Promo code not valid for this room type' },
        meta: { requestId: 'test' },
        error: null,
      });
    }

    // Calculate discount
    let discount = 0;
    if (promo.discountType === 'PERCENTAGE') {
      discount = (bookingAmount * promo.discountValue) / 100;
      if (promo.maxDiscountAmount) {
        discount = Math.min(discount, promo.maxDiscountAmount);
      }
    } else {
      discount = promo.discountValue;
    }

    return HttpResponse.json({
      data: {
        valid: true,
        promo,
        discountAmount: Math.round(discount * 100) / 100,
        finalAmount: Math.round((bookingAmount - discount) * 100) / 100,
      },
      meta: { requestId: 'test' },
      error: null,
    });
  }),

  // Create promo code
  http.post(`${API_URL}/api/v1/promo-codes`, async ({ request }) => {
    await delay(100);
    const body = await request.json() as Omit<typeof mockPromoCodes[0], 'id' | 'usedCount' | 'createdAt'>;
    const newPromo = {
      id: `promo_${Date.now()}`,
      ...body,
      usedCount: 0,
      createdAt: new Date().toISOString(),
    };
    mockPromoCodes.push(newPromo);
    return HttpResponse.json({ data: newPromo, meta: { requestId: 'test' }, error: null }, { status: 201 });
  }),

  // Update promo code
  http.patch(`${API_URL}/api/v1/promo-codes/:id`, async ({ params, request }) => {
    await delay(50);
    const updates = await request.json() as Partial<typeof mockPromoCodes[0]>;
    const promoIndex = mockPromoCodes.findIndex((p) => p.id === params.id);
    if (promoIndex === -1) {
      return HttpResponse.json(
        { data: null, meta: { requestId: 'test' }, error: { code: 'NOT_FOUND', message: 'Promo code not found' } },
        { status: 404 }
      );
    }
    mockPromoCodes[promoIndex] = { ...mockPromoCodes[promoIndex], ...updates };
    return HttpResponse.json({ data: mockPromoCodes[promoIndex], meta: { requestId: 'test' }, error: null });
  }),

  // Delete promo code
  http.delete(`${API_URL}/api/v1/promo-codes/:id`, async ({ params }) => {
    await delay(50);
    const promoIndex = mockPromoCodes.findIndex((p) => p.id === params.id);
    if (promoIndex === -1) {
      return HttpResponse.json(
        { data: null, meta: { requestId: 'test' }, error: { code: 'NOT_FOUND', message: 'Promo code not found' } },
        { status: 404 }
      );
    }
    mockPromoCodes.splice(promoIndex, 1);
    return HttpResponse.json({ data: null, meta: { requestId: 'test' }, error: null });
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
