import '@testing-library/jest-dom';
import { toHaveNoViolations } from 'jest-axe';
import { server } from './__mocks__/msw/server';

expect.extend(toHaveNoViolations);

// ============================================================================
// Next.js navigation mock
// ============================================================================

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
  redirect: jest.fn(),
}));

// ============================================================================
// Global Mocks (matchMedia, cookie)
// ============================================================================

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock document.cookie for SidebarProvider
if (typeof document !== 'undefined') {
  Object.defineProperty(document, 'cookie', {
    writable: true,
    value: '',
  });
}

// ============================================================================
// MockEventSource — for SSE tests
// ============================================================================

class MockEventSource {
  static readonly CONNECTING = 0 as const;
  static readonly OPEN = 1 as const;
  static readonly CLOSED = 2 as const;

  readonly CONNECTING = 0 as const;
  readonly OPEN = 1 as const;
  readonly CLOSED = 2 as const;

  url: string;
  readyState: number = MockEventSource.CONNECTING;
  withCredentials: boolean;
  onopen: ((ev: Event) => void) | null = null;
  onerror: ((ev: Event) => void) | null = null;
  onmessage: ((ev: MessageEvent) => void) | null = null;

  private listeners: Map<string, Set<EventListenerOrEventListenerObject>> = new Map();
  private openTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(url: string | URL, options?: EventSourceInit) {
    this.url = url.toString();
    this.withCredentials = options?.withCredentials ?? false;

    this.openTimeout = setTimeout(() => {
      this.readyState = MockEventSource.OPEN;
      const event = new Event('open');
      this.onopen?.(event);
      this.dispatchEvent(event);
    }, 0);
  }

  addEventListener(type: string, listener: EventListenerOrEventListenerObject | null): void {
    if (!listener) return;
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(listener);
  }

  removeEventListener(type: string, listener: EventListenerOrEventListenerObject | null): void {
    if (!listener) return;
    this.listeners.get(type)?.delete(listener);
  }

  dispatchEvent(event: Event): boolean {
    const listeners = this.listeners.get(event.type);
    if (listeners) {
      listeners.forEach((listener) => {
        if (typeof listener === 'function') {
          listener(event);
        } else {
          listener.handleEvent(event);
        }
      });
    }
    return true;
  }

  close(): void {
    if (this.openTimeout) clearTimeout(this.openTimeout);
    this.readyState = MockEventSource.CLOSED;
  }

  __simulateMessage(data: string, eventType: string = 'message', lastEventId?: string): void {
    const event = new MessageEvent(eventType, { data, lastEventId });
    if (eventType === 'message') this.onmessage?.(event);
    this.dispatchEvent(event);
  }

  __simulateError(): void {
    this.readyState = MockEventSource.CLOSED;
    const event = new Event('error');
    this.onerror?.(event);
    this.dispatchEvent(event);
  }
}

global.EventSource = MockEventSource as unknown as typeof EventSource;

// ============================================================================
// MSW server lifecycle
// ============================================================================

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => {
  server.resetHandlers();
  jest.clearAllMocks();
});
afterAll(() => server.close());
