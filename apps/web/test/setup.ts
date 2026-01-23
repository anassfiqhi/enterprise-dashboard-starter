import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, afterAll, vi } from 'vitest';
import { server } from './mocks/server';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
  redirect: vi.fn(),
}));

// Mock EventSource for SSE tests
class MockEventSource implements EventSource {
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSED = 2;

  readonly CONNECTING = 0;
  readonly OPEN = 1;
  readonly CLOSED = 2;

  url: string;
  readyState: number = MockEventSource.CONNECTING;
  withCredentials: boolean;
  onopen: ((this: EventSource, ev: Event) => void) | null = null;
  onerror: ((this: EventSource, ev: Event) => void) | null = null;
  onmessage: ((this: EventSource, ev: MessageEvent) => void) | null = null;

  private listeners: Map<string, Set<EventListenerOrEventListenerObject>> = new Map();
  private openTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(url: string | URL, options?: EventSourceInit) {
    this.url = url.toString();
    this.withCredentials = options?.withCredentials ?? false;

    // Simulate async connection
    this.openTimeout = setTimeout(() => {
      this.readyState = MockEventSource.OPEN;
      const event = new Event('open');
      this.onopen?.call(this, event);
      this.dispatchEvent(event);
    }, 0);
  }

  addEventListener(type: string, listener: EventListenerOrEventListenerObject): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(listener);
  }

  removeEventListener(type: string, listener: EventListenerOrEventListenerObject): void {
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
    if (this.openTimeout) {
      clearTimeout(this.openTimeout);
    }
    this.readyState = MockEventSource.CLOSED;
  }

  // Test helper to simulate incoming SSE events
  __simulateMessage(data: string, eventType: string = 'message', lastEventId?: string): void {
    const event = new MessageEvent(eventType, {
      data,
      lastEventId,
    });

    if (eventType === 'message') {
      this.onmessage?.call(this, event);
    }
    this.dispatchEvent(event);
  }

  // Test helper to simulate connection error
  __simulateError(): void {
    this.readyState = MockEventSource.CLOSED;
    const event = new Event('error');
    this.onerror?.call(this, event);
    this.dispatchEvent(event);
  }
}

vi.stubGlobal('EventSource', MockEventSource);

// Setup MSW
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' });
});

afterEach(() => {
  cleanup();
  server.resetHandlers();
  vi.clearAllMocks();
});

afterAll(() => {
  server.close();
});

// Export MockEventSource for direct use in tests
export { MockEventSource };
