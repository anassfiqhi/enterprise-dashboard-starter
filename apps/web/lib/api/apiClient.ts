import { config } from '@/lib/config';
import type { ResponseEnvelope } from '@repo/shared';

interface RequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: unknown;
    params?: Record<string, string | number | undefined>;
}

function buildUrl(path: string, params?: Record<string, string | number | undefined>): string {
    let url = `${config.apiUrl}${path}`;
    if (params) {
        const searchParams = new URLSearchParams();
        for (const [key, value] of Object.entries(params)) {
            if (value !== undefined && value !== '') {
                searchParams.append(key, String(value));
            }
        }
        const qs = searchParams.toString();
        if (qs) url += `?${qs}`;
    }
    return url;
}

function buildFetchOptions(options: RequestOptions): RequestInit {
    const { method = 'GET', body } = options;
    const init: RequestInit = {
        method,
        credentials: 'include',
    };
    if (body) {
        init.headers = { 'Content-Type': 'application/json' };
        init.body = JSON.stringify(body);
    }
    return init;
}

async function handleResponse<T>(response: Response): Promise<ResponseEnvelope<T>> {
    if (!response.ok) {
        const errorData: ResponseEnvelope<null> = await response.json();
        throw new Error(errorData.error?.message || `Request failed: ${response.status}`);
    }

    const envelope: ResponseEnvelope<T> = await response.json();
    if (envelope.error) {
        throw new Error(envelope.error.message);
    }

    return envelope;
}

/**
 * Makes an API request and returns the unwrapped data from the ResponseEnvelope.
 */
export async function apiRequest<T>(
    path: string,
    options: RequestOptions = {}
): Promise<T> {
    const url = buildUrl(path, options.params);
    const fetchOptions = buildFetchOptions(options);
    const response = await fetch(url, fetchOptions);
    const envelope = await handleResponse<T>(response);
    return envelope.data as T;
}

/**
 * Makes an API request and returns both data and meta from the ResponseEnvelope.
 */
export async function apiRequestWithMeta<T>(
    path: string,
    options: RequestOptions = {}
): Promise<{ data: T; meta: ResponseEnvelope<T>['meta'] }> {
    const url = buildUrl(path, options.params);
    const fetchOptions = buildFetchOptions(options);
    const response = await fetch(url, fetchOptions);
    const envelope = await handleResponse<T>(response);
    return { data: envelope.data as T, meta: envelope.meta };
}
