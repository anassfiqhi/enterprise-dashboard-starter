import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/lib/store';
import type { AsyncStatus } from '@/lib/reducers/asyncState';

interface SagaMutationOptions<TInput> {
    actionType: string;
    statusSelector: (state: RootState) => AsyncStatus;
    buildPayload: (input: TInput) => Record<string, unknown>;
    resetAction?: () => { type: string };
}

export function useSagaMutation<TInput, TResult = void>(
    options: SagaMutationOptions<TInput>
) {
    const { actionType, statusSelector, buildPayload, resetAction } = options;
    const dispatch = useDispatch<AppDispatch>();
    const status = useSelector(statusSelector);

    const mutateAsync = useCallback(
        (input: TInput): Promise<TResult> => {
            return new Promise((resolve, reject) => {
                dispatch({
                    type: actionType,
                    payload: { ...buildPayload(input), resolve, reject },
                });
            });
        },
        [dispatch, actionType, buildPayload]
    );

    const mutate = useCallback(
        (input: TInput) => {
            dispatch({
                type: actionType,
                payload: buildPayload(input),
            });
        },
        [dispatch, actionType, buildPayload]
    );

    return {
        mutate,
        mutateAsync,
        isPending: status === 'loading',
        isError: status === 'failed',
        isSuccess: status === 'succeeded',
        reset: resetAction ? () => dispatch(resetAction()) : undefined,
    };
}
