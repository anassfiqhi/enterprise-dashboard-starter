export type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface AsyncState<T> {
    data: T;
    status: AsyncStatus;
    error: string | null;
}

export function createAsyncState<T>(initial: T): AsyncState<T> {
    return { data: initial, status: 'idle', error: null };
}
