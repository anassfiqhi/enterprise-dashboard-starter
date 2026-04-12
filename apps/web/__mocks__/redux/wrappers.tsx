import React from 'react';
import {
  render,
  renderHook,
  type RenderOptions,
  type RenderHookOptions,
} from '@testing-library/react';
import { Provider } from 'react-redux';
import { createTestStore, type TestStore } from './store';
import type { RootState } from '@/lib/store';

export function renderWithProviders(
  ui: React.ReactElement,
  preloadedState?: Partial<RootState>,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  const store = createTestStore(preloadedState);
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
  return { store, ...render(ui, { wrapper: Wrapper, ...options }) };
}

export function createReduxWrapper(preloadedState?: Partial<RootState>): {
  store: TestStore;
  Wrapper: ({ children }: { children: React.ReactNode }) => React.ReactElement;
} {
  const store = createTestStore(preloadedState);
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
  return { store, Wrapper };
}

export function renderHookWithProviders<Result, Props>(
  hook: (props: Props) => Result,
  preloadedState?: Partial<RootState>,
  options?: Omit<RenderHookOptions<Props>, 'wrapper'>
) {
  const store = createTestStore(preloadedState);
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
  return { store, ...renderHook(hook, { wrapper: Wrapper, ...options }) };
}
