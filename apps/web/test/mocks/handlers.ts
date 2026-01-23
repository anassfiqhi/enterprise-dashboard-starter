import { http, HttpResponse, delay } from 'msw';
import { mockOrders, mockAdminSession, mockMetrics } from './fixtures';

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
