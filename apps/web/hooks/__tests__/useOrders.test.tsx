import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useOrders } from '../useOrders';
import { createCombinedWrapper } from '@/test/test-utils';
import { server } from '@/test/mocks/server';
import { errorHandlers } from '@/test/mocks/handlers';
import { mockOrders } from '@/test/mocks/fixtures';

describe('useOrders', () => {
  describe('successful fetch', () => {
    it('fetches orders with default filters', async () => {
      const { Wrapper } = createCombinedWrapper();
      const { result } = renderHook(() => useOrders(), { wrapper: Wrapper });

      // Initially loading
      expect(result.current.isLoading).toBe(true);

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isSuccess).toBe(true);
      expect(result.current.data?.data).toBeDefined();
      expect(result.current.data?.data.length).toBeGreaterThan(0);
    });

    it('includes pagination metadata in response', async () => {
      const { Wrapper } = createCombinedWrapper();
      const { result } = renderHook(() => useOrders(), { wrapper: Wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.meta).toBeDefined();
      expect(result.current.data?.meta.page).toBe(1);
      expect(result.current.data?.meta.pageSize).toBe(10);
      expect(result.current.data?.meta.total).toBeDefined();
    });

    it('uses filters from Redux state in query key', async () => {
      const { Wrapper, queryClient } = createCombinedWrapper({
        ordersFilters: {
          page: 2,
          pageSize: 25,
          search: 'customer',
          status: 'pending',
          sort: '-amount',
        },
      });

      const { result } = renderHook(() => useOrders(), { wrapper: Wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Check that query was made with correct filters
      const queryState = queryClient.getQueryState([
        'orders',
        'list',
        { page: 2, pageSize: 25, search: 'customer', status: 'pending', sort: '-amount' },
      ]);

      expect(queryState).toBeDefined();
    });

    it('filters orders by search term', async () => {
      const { Wrapper } = createCombinedWrapper({
        ordersFilters: {
          page: 1,
          pageSize: 10,
          search: 'Customer 1',
          status: '',
          sort: '',
        },
      });

      const { result } = renderHook(() => useOrders(), { wrapper: Wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // MSW handler filters by search term
      result.current.data?.data.forEach((order) => {
        expect(
          order.id.includes('Customer 1') || order.customer.toLowerCase().includes('customer 1')
        ).toBe(true);
      });
    });

    it('filters orders by status', async () => {
      const { Wrapper } = createCombinedWrapper({
        ordersFilters: {
          page: 1,
          pageSize: 10,
          search: '',
          status: 'pending',
          sort: '',
        },
      });

      const { result } = renderHook(() => useOrders(), { wrapper: Wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // All returned orders should have pending status
      result.current.data?.data.forEach((order) => {
        expect(order.status).toBe('pending');
      });
    });
  });

  describe('error handling', () => {
    it('handles 403 forbidden error', async () => {
      server.use(errorHandlers.forbidden);

      const { Wrapper } = createCombinedWrapper();
      const { result } = renderHook(() => useOrders(), { wrapper: Wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error?.message).toBe('No permission');
    });

    it('handles 500 server error', async () => {
      server.use(errorHandlers.serverError);

      const { Wrapper } = createCombinedWrapper();
      const { result } = renderHook(() => useOrders(), { wrapper: Wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error?.message).toBe('Server error');
    });

    it('handles network error', async () => {
      server.use(errorHandlers.networkError);

      const { Wrapper } = createCombinedWrapper();
      const { result } = renderHook(() => useOrders(), { wrapper: Wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe('query key derivation', () => {
    it('creates stable query key from filters', () => {
      const filters1 = { page: 1, pageSize: 10, search: '', status: '' as const, sort: '' };
      const filters2 = { page: 1, pageSize: 10, search: '', status: '' as const, sort: '' };

      const key1 = ['orders', 'list', filters1];
      const key2 = ['orders', 'list', filters2];

      expect(JSON.stringify(key1)).toBe(JSON.stringify(key2));
    });

    it('creates different query key for different filters', () => {
      const filters1 = { page: 1, pageSize: 10, search: '', status: '' as const, sort: '' };
      const filters2 = { page: 2, pageSize: 10, search: '', status: '' as const, sort: '' };

      const key1 = JSON.stringify(['orders', 'list', filters1]);
      const key2 = JSON.stringify(['orders', 'list', filters2]);

      expect(key1).not.toBe(key2);
    });
  });
});
