import { getSecurityHeaders } from './middleware/securityHeaders';
import { checkRateLimit } from './middleware/rateLimiter';
import { validateFileBufferOnServer } from './services/serverFileValidator';
import { processServerLegalAnalysis } from './services/serverAiProvider';

/**
 * Server API Handler Router (Express / Hono / Edge compatible)
 */

export interface RequestPayload {
  clientIp?: string;
  action: 'health' | 'validate-file' | 'analyze-doc';
  fileData?: {
    base64: string;
    filename: string;
  };
  documentText?: string;
  userApiKey?: string;
}

export async function handleServerApiRequest(payload: RequestPayload): Promise<{
  status: number;
  headers: Record<string, string>;
  data: any;
}> {
  const headers = getSecurityHeaders();
  const clientIp = payload.clientIp || '127.0.0.1';

  // 1. Rate Limiting Check
  const rateLimit = checkRateLimit(clientIp);
  if (!rateLimit.isAllowed) {
    return {
      status: 429,
      headers: { ...headers, 'Retry-After': Math.ceil(rateLimit.resetMs / 1000).toString() },
      data: { error: 'Too many requests. Please slow down and try again shortly.' }
    };
  }

  // 2. Health Endpoint
  if (payload.action === 'health') {
    return {
      status: 200,
      headers,
      data: { status: 'healthy', timestamp: new Date().toISOString(), service: 'Lexora API Proxy' }
    };
  }

  // 3. Server File Validation Endpoint
  if (payload.action === 'validate-file') {
    if (!payload.fileData?.base64 || !payload.fileData?.filename) {
      return {
        status: 400,
        headers,
        data: { isValid: false, error: 'Missing base64 file data or filename.' }
      };
    }

    try {
      const bytes = new Uint8Array(Buffer.from(payload.fileData.base64, 'base64'));
      const validation = validateFileBufferOnServer(bytes, payload.fileData.filename);
      return {
        status: validation.isValid ? 200 : 400,
        headers,
        data: validation
      };
    } catch (_err) {
      return {
        status: 400,
        headers,
        data: { isValid: false, error: 'Failed to decode binary file stream.' }
      };
    }
  }

  // 4. Server Legal Analysis Endpoint
  if (payload.action === 'analyze-doc') {
    if (!payload.documentText) {
      return { status: 400, headers, data: { error: 'Document text is required.' } };
    }

    try {
      const analysisResult = await processServerLegalAnalysis(payload.documentText, payload.userApiKey);
      return { status: 200, headers, data: { analysisResult } };
    } catch (err: any) {
      return {
        status: 500,
        headers,
        data: { error: err.message || 'Server-side analysis failed.' }
      };
    }
  }

  return { status: 404, headers, data: { error: 'Unknown API action requested.' } };
}
