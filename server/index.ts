import { getSecurityHeaders } from './middleware/securityHeaders';
import { checkRateLimit } from './middleware/rateLimiter';
import { validateFileBufferOnServer } from './services/serverFileValidator';
import {
  processServerLegalAnalysis,
  processServerLegalQA,
  processServerLegalComparison
} from './services/serverAiProvider';
import { DocumentAnalysis, QuestionAnswerResponse } from '../src/types/analysis';

/**
 * Server API Handler Router (Express / Hono / Edge compatible)
 * Strictly typed with discriminated union API responses.
 */

export interface RequestPayload {
  action: 'health' | 'validate-file' | 'analyze-doc' | 'qa' | 'compare';
  fileData?: {
    base64: string;
    filename: string;
  };
  documentText?: string;
  document?: any;
  question?: string;
  history?: any[];
  documentA?: any;
  documentB?: any;
}

export type ServerApiResponse<T> =
  | { status: 200; headers: Record<string, string>; data: T }
  | { status: 400 | 429 | 500; headers: Record<string, string>; data: { error: string; code?: string } };

export async function handleServerApiRequest(
  payload: RequestPayload,
  requestContext?: { ip?: string; headers?: Record<string, string> }
): Promise<ServerApiResponse<any>> {
  const securityHeaders = getSecurityHeaders();

  // Server determines requester identity/IP from request connection context, not client payload
  const clientIp = requestContext?.ip || requestContext?.headers?.['x-forwarded-for'] || '127.0.0.1';

  // 1. Rate Limiting Check
  const rateLimit = checkRateLimit(clientIp);
  if (!rateLimit.isAllowed) {
    return {
      status: 429,
      headers: { ...securityHeaders, 'Retry-After': Math.ceil(rateLimit.resetMs / 1000).toString() },
      data: { error: 'Too many requests. Please slow down and try again shortly.', code: 'RATE_LIMIT_EXCEEDED' }
    };
  }

  // 2. Health Endpoint
  if (payload.action === 'health') {
    return {
      status: 200,
      headers: securityHeaders,
      data: { status: 'healthy', timestamp: new Date().toISOString(), service: 'KannunAI API Server' }
    };
  }

  // 3. Server File Validation Endpoint
  if (payload.action === 'validate-file') {
    if (!payload.fileData?.base64 || !payload.fileData?.filename) {
      return {
        status: 400,
        headers: securityHeaders,
        data: { error: 'Missing base64 file data or filename.', code: 'INVALID_PAYLOAD' }
      };
    }

    try {
      const bytes = new Uint8Array(Buffer.from(payload.fileData.base64, 'base64'));
      const validation = validateFileBufferOnServer(bytes, payload.fileData.filename);
      return {
        status: validation.isValid ? 200 : 400,
        headers: securityHeaders,
        data: validation
      };
    } catch (_err) {
      return {
        status: 400,
        headers: securityHeaders,
        data: { error: 'Failed to decode binary file stream.', code: 'DECODE_ERROR' }
      };
    }
  }

  // 4. Server Legal Analysis Endpoint
  if (payload.action === 'analyze-doc') {
    if (!payload.documentText) {
      return { status: 400, headers: securityHeaders, data: { error: 'Document text is required.', code: 'MISSING_TEXT' } };
    }

    try {
      const analysisResult: DocumentAnalysis = await processServerLegalAnalysis(payload.documentText);
      return { status: 200, headers: securityHeaders, data: { analysisResult } };
    } catch (err: any) {
      return {
        status: 500,
        headers: securityHeaders,
        data: { error: err.message || 'Server-side analysis failed.', code: 'AI_SERVICE_ERROR' }
      };
    }
  }

  // 5. Server Grounded Q&A Endpoint
  if (payload.action === 'qa') {
    if (!payload.document || !payload.question) {
      return { status: 400, headers: securityHeaders, data: { error: 'Document and question are required.', code: 'MISSING_QA_PARAM' } };
    }

    try {
      const qaResult: QuestionAnswerResponse = await processServerLegalQA(payload.document, payload.question, payload.history || []);
      return { status: 200, headers: securityHeaders, data: qaResult };
    } catch (err: any) {
      return {
        status: 500,
        headers: securityHeaders,
        data: { error: err.message || 'Server-side Q&A failed.', code: 'AI_QA_ERROR' }
      };
    }
  }

  // 6. Server Document Comparison Endpoint
  if (payload.action === 'compare') {
    if (!payload.documentA?.rawText || !payload.documentB?.rawText) {
      return { status: 400, headers: securityHeaders, data: { error: 'Document A and Document B text required.', code: 'MISSING_COMPARE_TEXT' } };
    }

    try {
      const compareResult = await processServerLegalComparison(payload.documentA.rawText, payload.documentB.rawText);
      return { status: 200, headers: securityHeaders, data: compareResult };
    } catch (err: any) {
      return {
        status: 500,
        headers: securityHeaders,
        data: { error: err.message || 'Server-side comparison failed.', code: 'AI_COMPARE_ERROR' }
      };
    }
  }

  return { status: 400, headers: securityHeaders, data: { error: 'Unknown API action requested.', code: 'UNKNOWN_ACTION' } };
}
