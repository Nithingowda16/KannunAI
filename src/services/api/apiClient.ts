import { ApiRequestPayload, ApiResponse } from '../../types/api';

/**
 * Typed Browser API Client for KannunAI
 * Connects browser UI to server proxy endpoints using discriminated union responses.
 */
export async function sendServerApiRequest<T>(
  payload: ApiRequestPayload
): Promise<ApiResponse<T>> {
  if (typeof fetch === 'undefined') {
    return {
      ok: false,
      status: 503,
      error: 'Environment does not support fetch API.',
      code: 'FETCH_UNSUPPORTED'
    };
  }

  try {
    const response = await fetch('/api/legal-ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const json = await response.json();
      return { ok: true, status: 200, data: json as T };
    }

    const errJson = await response.json().catch(() => ({ error: 'HTTP request failed' }));
    return {
      ok: false,
      status: (response.status as 400 | 404 | 429 | 500 | 502 | 503) || 500,
      error: errJson.error || `Server responded with HTTP status ${response.status}`,
      code: errJson.code || 'HTTP_ERROR'
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Network communication failed';
    return {
      ok: false,
      status: 503,
      error: message,
      code: 'NETWORK_ERROR'
    };
  }
}
