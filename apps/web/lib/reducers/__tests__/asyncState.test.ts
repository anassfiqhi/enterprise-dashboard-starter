import { createAsyncState } from '../asyncState';

describe('createAsyncState', () => {
  it('returns idle status', () => {
    expect(createAsyncState(null).status).toBe('idle');
  });

  it('returns null error', () => {
    expect(createAsyncState([]).error).toBeNull();
  });

  it('stores the provided initial data', () => {
    expect(createAsyncState([1, 2, 3]).data).toEqual([1, 2, 3]);
  });

  it('works with null initial data', () => {
    const state = createAsyncState<string | null>(null);
    expect(state.data).toBeNull();
    expect(state.status).toBe('idle');
  });

  it('works with object initial data', () => {
    const data = { id: '1', name: 'test' };
    expect(createAsyncState(data).data).toEqual(data);
  });
});
