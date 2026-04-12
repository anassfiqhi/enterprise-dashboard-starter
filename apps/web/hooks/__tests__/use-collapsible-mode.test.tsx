import { renderHook } from '@testing-library/react';
import { useCollapsibleMode } from '../use-collapsible-mode';

describe('useCollapsibleMode', () => {
  const setupMatchMedia = (matches: boolean) => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  };

  beforeEach(() => {
    setupMatchMedia(true);
  });

  it('returns icon when window width is large', () => {
    window.innerWidth = 1200;
    const { result } = renderHook(() => useCollapsibleMode());
    expect(result.current).toBe('icon');
  });

  it('returns offcanvas when window width is small', () => {
    window.innerWidth = 800;
    const { result } = renderHook(() => useCollapsibleMode());
    expect(result.current).toBe('offcanvas');
  });
});
