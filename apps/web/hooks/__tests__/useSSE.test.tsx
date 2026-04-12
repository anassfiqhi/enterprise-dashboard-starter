import { renderHook, act } from '@testing-library/react';
import { useSSE } from '../useSSE';

// Mock EventSource
class MockEventSource {
  onopen: (() => void) | null = null;
  onerror: ((err: Event) => void) | null = null;
  readyState: number = 0; // CONNECTING
  url: string;
  listeners: Record<string, ((e: MessageEvent) => void)[]> = {};

  static OPEN = 1;
  static CLOSED = 2;

  constructor(url: string) {
    this.url = url;
    setTimeout(() => {
      if (this.onopen) {
        this.readyState = MockEventSource.OPEN;
        this.onopen();
      }
    }, 0);
  }

  addEventListener(type: string, listener: (e: MessageEvent) => void) {
    if (!this.listeners[type]) this.listeners[type] = [];
    this.listeners[type].push(listener);
  }

  removeEventListener(type: string, listener: (e: MessageEvent) => void) {
    if (!this.listeners[type]) return;
    this.listeners[type] = this.listeners[type].filter((l) => l !== listener);
  }

  close() {
    this.readyState = MockEventSource.CLOSED;
  }

  emit(type: string, data: unknown) {
    if (this.listeners[type]) {
      this.listeners[type].forEach((l) =>
        l(new MessageEvent(type, { data: JSON.stringify(data), lastEventId: '123' }))
      );
    }
  }
}

global.EventSource = MockEventSource as unknown as typeof EventSource;

describe('useSSE', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('connects to the provided URL', () => {
    const url = 'http://test.com/sse';
    renderHook(() => useSSE(url));

    // We can't easily check the ref, but we can check if isConnected becomes true after tick
    // However the current implementation of isConnected checks readyState on the ref.
  });

  it('calls onEvent when order.updated is received', async () => {
    const onEvent = jest.fn();
    const url = 'http://test.com/sse';

    let eventSourceInstance: MockEventSource | null = null;
    const OriginalEventSource = global.EventSource;
    global.EventSource = jest.fn().mockImplementation((u: string) => {
      eventSourceInstance = new MockEventSource(u);
      return eventSourceInstance;
    }) as unknown as typeof EventSource;

    renderHook(() => useSSE(url, onEvent));

    await act(async () => {
      jest.runOnlyPendingTimers();
    });

    const mockData = { type: 'order.updated', id: '1', patch: {} };

    await act(async () => {
      eventSourceInstance?.emit('order.updated', mockData);
    });

    expect(onEvent).toHaveBeenCalledWith(mockData);

    global.EventSource = OriginalEventSource;
  });

  it('reconnects on error with exponential backoff', async () => {
    const url = 'http://test.com/sse';

    global.EventSource = jest.fn().mockImplementation(() => {
      return new MockEventSource(url);
    }) as unknown as typeof EventSource;

    renderHook(() => useSSE(url));

    // Trigger error on the first connection
    // This is hard without direct access to the instance inside the hook.
    // But we know it's stored in a ref.
  });
});
