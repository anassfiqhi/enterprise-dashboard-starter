jest.useFakeTimers();
jest.setSystemTime(new Date('2026-04-09'));

/* eslint-disable @typescript-eslint/no-require-imports -- must require after jest.setSystemTime so initial state uses mocked date */
const {
  default: reducer,
  setViewType,
  setStartDate,
  setEndDate,
  setDateRange,
  navigateMonth,
  resetFilters,
} = require('../availabilitySlice');
/* eslint-enable @typescript-eslint/no-require-imports */

describe('availabilitySlice (filters)', () => {
  afterAll(() => {
    jest.useRealTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  const initialState = reducer(undefined, { type: '@@INIT' });

  it('returns correct initial state', () => {
    expect(initialState).toMatchObject({
      viewType: 'rooms',
      startDate: '2026-04-09',
      endDate: '2026-05-09',
    });
  });

  it('setViewType switches to activities', () => {
    const state = reducer(initialState, setViewType('activities'));
    expect(state.viewType).toBe('activities');
  });

  it('setStartDate updates startDate', () => {
    const state = reducer(initialState, setStartDate('2026-05-01'));
    expect(state.startDate).toBe('2026-05-01');
  });

  it('setEndDate updates endDate', () => {
    const state = reducer(initialState, setEndDate('2026-06-01'));
    expect(state.endDate).toBe('2026-06-01');
  });

  it('setDateRange sets both dates', () => {
    const state = reducer(initialState, setDateRange({ start: '2026-05-01', end: '2026-05-31' }));
    expect(state.startDate).toBe('2026-05-01');
    expect(state.endDate).toBe('2026-05-31');
  });

  describe('navigateMonth', () => {
    it('advances start and end dates by one month (next)', () => {
      const state = reducer(initialState, navigateMonth('next'));
      expect(state.startDate).toBe('2026-05-09');
      expect(state.endDate).toBe('2026-06-09');
    });

    it('decrements start and end dates by one month (prev)', () => {
      const state = reducer(initialState, navigateMonth('prev'));
      expect(state.startDate).toBe('2026-03-09');
      expect(state.endDate).toBe('2026-04-09');
    });
  });

  it('resetFilters returns to initial state', () => {
    let state = reducer(initialState, setViewType('activities'));
    state = reducer(state, resetFilters());
    expect(state.viewType).toBe('rooms');
  });
});
