import { HealthResponse, ServerApiResponse } from '../types/api';

export async function handleHealthRoute(
  securityHeaders: Record<string, string>
): Promise<ServerApiResponse<HealthResponse>> {
  return {
    status: 200,
    headers: securityHeaders,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'KannunAI API Server'
    }
  };
}
