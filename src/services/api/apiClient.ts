/**
 * Typed Browser API Client for KannunAI
 * Provides a secure API boundary separating browser UI from server endpoints.
 */

export interface ApiRequestPayload {
  action: 'health' | 'validate-file' | 'analyze-doc' | 'qa' | 'compare';
  documentText?: string;
  document?: any;
  question?: string;
  history?: any[];
  documentA?: any;
  documentB?: any;
  fileData?: {
    base64: string;
    filename: string;
  };
}

export interface ApiResponse<T = unknown> {
  status: number;
  data: T | null;
  error?: string;
}

export async function sendServerApiRequest<T = unknown>(
  payload: ApiRequestPayload
): Promise<ApiResponse<T>> {
  if (typeof fetch !== 'undefined') {
    const response = await fetch('/api/legal-ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const json = await response.json();
      return { status: response.status, data: json as T };
    }

    const errJson = await response.json().catch(() => ({ error: 'HTTP request failed' }));
    return {
      status: response.status,
      data: null,
      error: errJson.error || `Server responded with status ${response.status}`
    };
  }

  return {
    status: 503,
    data: null,
    error: 'Environment does not support fetch API.'
  };
}
