import { RequestPayload, ServerApiResponse } from '../types/api';
import { processServerLegalComparison } from '../services/serverAiProvider';

export async function handleCompareRoute(
  payload: RequestPayload,
  securityHeaders: Record<string, string>
): Promise<ServerApiResponse<{ comparisonSummary: string; differences: any[] }>> {
  if (!payload.documentA?.rawText || !payload.documentB?.rawText) {
    return {
      status: 400,
      headers: securityHeaders,
      data: { error: 'Document A and Document B text required for comparison.', code: 'MISSING_COMPARE_TEXT' }
    };
  }

  try {
    const compareResult = await processServerLegalComparison(
      payload.documentA.rawText,
      payload.documentB.rawText
    );
    return {
      status: 200,
      headers: securityHeaders,
      data: compareResult
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server-side document comparison failed.';
    return {
      status: 500,
      headers: securityHeaders,
      data: { error: message, code: 'AI_COMPARE_FAILED' }
    };
  }
}
