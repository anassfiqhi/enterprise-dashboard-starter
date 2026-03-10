import { describe, it, expect } from 'vitest';
import reducer, {
  setPage,
  setPageSize,
  setSearch,
  setStatus,
  setSort,
  resetFilters,
  type OrdersFiltersState,
} from '../ordersFiltersSlice';

describe('ordersFiltersSlice', () => {
  const initialState: OrdersFiltersState = {
    page: 1,
    pageSize: 10,
    search: '',
    status: '',
    sort: '',
  };

  it('should return the initial state', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('setPage', () => {
    it('should set the page number', () => {
      const state = reducer(initialState, setPage(5));
      expect(state.page).toBe(5);
    });

    it('should only update the page, not other fields', () => {
      const stateWithFilters: OrdersFiltersState = {
        ...initialState,
        search: 'test',
        status: 'pending',
      };
      const state = reducer(stateWithFilters, setPage(3));
      expect(state.page).toBe(3);
      expect(state.search).toBe('test');
      expect(state.status).toBe('pending');
    });
  });

  describe('setPageSize', () => {
    it('should set the page size', () => {
      const state = reducer(initialState, setPageSize(25));
      expect(state.pageSize).toBe(25);
    });

    it('should reset page to 1 when page size changes', () => {
      const stateWithPage: OrdersFiltersState = { ...initialState, page: 5 };
      const state = reducer(stateWithPage, setPageSize(25));
      expect(state.pageSize).toBe(25);
      expect(state.page).toBe(1);
    });
  });

  describe('setSearch', () => {
    it('should set the search string', () => {
      const state = reducer(initialState, setSearch('customer name'));
      expect(state.search).toBe('customer name');
    });

    it('should reset page to 1 when search changes', () => {
      const stateWithPage: OrdersFiltersState = { ...initialState, page: 5 };
      const state = reducer(stateWithPage, setSearch('test'));
      expect(state.search).toBe('test');
      expect(state.page).toBe(1);
    });

    it('should allow empty search string', () => {
      const stateWithSearch: OrdersFiltersState = { ...initialState, search: 'test' };
      const state = reducer(stateWithSearch, setSearch(''));
      expect(state.search).toBe('');
    });
  });

  describe('setStatus', () => {
    it('should set the status filter', () => {
      const state = reducer(initialState, setStatus('pending'));
      expect(state.status).toBe('pending');
    });

    it('should accept all valid status values', () => {
      const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', ''] as const;
      statuses.forEach((status) => {
        const state = reducer(initialState, setStatus(status));
        expect(state.status).toBe(status);
      });
    });

    it('should reset page to 1 when status changes', () => {
      const stateWithPage: OrdersFiltersState = { ...initialState, page: 5 };
      const state = reducer(stateWithPage, setStatus('shipped'));
      expect(state.status).toBe('shipped');
      expect(state.page).toBe(1);
    });
  });

  describe('setSort', () => {
    it('should set the sort field', () => {
      const state = reducer(initialState, setSort('amount'));
      expect(state.sort).toBe('amount');
    });

    it('should allow descending sort with prefix', () => {
      const state = reducer(initialState, setSort('-createdAt'));
      expect(state.sort).toBe('-createdAt');
    });

    it('should NOT reset page when sort changes', () => {
      const stateWithPage: OrdersFiltersState = { ...initialState, page: 5 };
      const state = reducer(stateWithPage, setSort('customer'));
      expect(state.sort).toBe('customer');
      expect(state.page).toBe(5); // Page should remain unchanged
    });
  });

  describe('resetFilters', () => {
    it('should reset all filters to initial state', () => {
      const modifiedState: OrdersFiltersState = {
        page: 5,
        pageSize: 25,
        search: 'test search',
        status: 'pending',
        sort: '-amount',
      };
      const state = reducer(modifiedState, resetFilters());
      expect(state).toEqual(initialState);
    });
  });

  describe('multiple actions', () => {
    it('should handle a sequence of filter changes correctly', () => {
      let state = initialState;

      // Set search - page resets to 1
      state = reducer(state, setSearch('customer'));
      expect(state.search).toBe('customer');
      expect(state.page).toBe(1);

      // Navigate to page 3
      state = reducer(state, setPage(3));
      expect(state.page).toBe(3);

      // Change status - page resets to 1
      state = reducer(state, setStatus('shipped'));
      expect(state.status).toBe('shipped');
      expect(state.page).toBe(1);

      // Navigate to page 2
      state = reducer(state, setPage(2));
      expect(state.page).toBe(2);

      // Change sort - page does NOT reset
      state = reducer(state, setSort('amount'));
      expect(state.sort).toBe('amount');
      expect(state.page).toBe(2);

      // Verify final state
      expect(state).toEqual({
        page: 2,
        pageSize: 10,
        search: 'customer',
        status: 'shipped',
        sort: 'amount',
      });
    });
  });
});
