/**
 * Typed Browser API Client for KannunAI
 * Provides a secure API boundary separating browser UI from server endpoints.
 */

export interface ApiRequestPayload {
  action: 'health' | 'validate-file' | 'analyze-doc';
  documentText?: string;
  fileData?: {
    base64: string;
    filename: string;
  };
  clientIp?: string;
}

export interface ApiResponse<T = any> {
  status: number;
  data: T;
  error?: string;
}

export async function sendServerApiRequest<T = any>(
  payload: ApiRequestPayload
): Promise<ApiResponse<T>> {
  try {
    // If running in browser environment with backend endpoint
    if (typeof fetch !== 'undefined') {
      const response = await fetch('/api/legal-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const json = await response.json();
        return { status: response.status, data: json };
      }
    }
  } catch (_err) {
    // Fallback gracefully if backend service is offline
  }

  // Fallback response for offline / client-only mode
  return {
    status: 503,
    data: null as any,
    error: 'Server API endpoint unreachable. Utilizing local deterministic engine.'
  };
}
