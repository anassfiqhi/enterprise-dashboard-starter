import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { configureStore, PreloadedState } from '@reduxjs/toolkit';
import ordersFiltersReducer from '@/lib/features/ui/ordersFiltersSlice';
import sessionReducer from '@/lib/features/ui/sessionSlice';
import tablePreferencesReducer from '@/lib/features/ui/tablePreferencesSlice';
import type { RootState } from '@/lib/store';

// Create a fresh QueryClient for each test
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity,
        staleTime: Infinity,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

// Create a fresh Redux store for each test
function createTestStore(preloadedState?: PreloadedState<RootState>) {
  return configureStore({
    reducer: {
      ordersFilters: ordersFiltersReducer,
      session: sessionReducer,
      tablePreferences: tablePreferencesReducer,
    },
    preloadedState,
  });
}

type TestStore = ReturnType<typeof createTestStore>;

interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  preloadedState?: PreloadedState<RootState>;
  store?: TestStore;
  queryClient?: QueryClient;
}

export function renderWithProviders(
  ui: ReactElement,
  {
    preloadedState,
    store = createTestStore(preloadedState),
    queryClient = createTestQueryClient(),
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </Provider>
    );
  }

  return {
    store,
    queryClient,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

// Helper to create a QueryClient wrapper for testing hooks
export function createQueryWrapper() {
  const queryClient = createTestQueryClient();
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, Wrapper };
}

// Helper to create a Redux wrapper for testing hooks
export function createReduxWrapper(preloadedState?: PreloadedState<RootState>) {
  const store = createTestStore(preloadedState);
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
  return { store, Wrapper };
}

// Helper to create both Redux and Query wrapper
export function createCombinedWrapper(preloadedState?: PreloadedState<RootState>) {
  const store = createTestStore(preloadedState);
  const queryClient = createTestQueryClient();
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Provider>
  );
  return { store, queryClient, Wrapper };
}

// Re-export everything from testing-library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';

// Export custom render as default render
export { renderWithProviders as render };
