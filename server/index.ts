import { getSecurityHeaders } from './middleware/securityHeaders';
import { checkRateLimit } from './middleware/rateLimiter';
import { API_ACTIONS, RequestPayload, ServerApiResponse } from './types/api';
import { handleHealthRoute } from './routes/healthRoute';
import { handleValidateRoute } from './routes/validateRoute';
import { handleAnalysisRoute } from './routes/analysisRoute';
import { handleQARoute } from './routes/qaRoute';
import { handleCompareRoute } from './routes/compareRoute';

/**
 * Server API Handler Router (Express / Hono / Edge compatible)
 * Dispatches requests using typed route handlers, rate limiting, and security headers.
 */
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

  // 2. Route Dispatcher Map
  const routeHandlers: Record<
    string,
    (payload: RequestPayload, headers: Record<string, string>) => Promise<ServerApiResponse<any>>
  > = {
    [API_ACTIONS.HEALTH]: (_p, h) => handleHealthRoute(h),
    [API_ACTIONS.VALIDATE_FILE]: (p, h) => handleValidateRoute(p, h),
    [API_ACTIONS.ANALYZE_DOC]: (p, h) => handleAnalysisRoute(p, h),
    [API_ACTIONS.QA]: (p, h) => handleQARoute(p, h),
    [API_ACTIONS.COMPARE]: (p, h) => handleCompareRoute(p, h)
  };

  const handler = routeHandlers[payload.action];
  if (handler) {
    try {
      return await handler(payload, securityHeaders);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unhandled server error during route execution.';
      return {
        status: 500,
        headers: securityHeaders,
        data: { error: message, code: 'UNHANDLED_ROUTE_ERROR' }
      };
    }
  }

  return {
    status: 404,
    headers: securityHeaders,
    data: { error: `Requested API action '${payload.action}' was not found.`, code: 'ROUTE_NOT_FOUND' }
  };
}
