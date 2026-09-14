import { RequestPayload, ServerApiResponse } from '../types/api';
import { processServerLegalAnalysis } from '../services/serverAiProvider';
import { DocumentAnalysis } from '../../src/types/analysis';

export async function handleAnalysisRoute(
  payload: RequestPayload,
  securityHeaders: Record<string, string>
): Promise<ServerApiResponse<{ analysisResult: DocumentAnalysis }>> {
  if (!payload.documentText) {
    return {
      status: 400,
      headers: securityHeaders,
      data: { error: 'Document text is required.', code: 'MISSING_TEXT' }
    };
  }

  try {
    const analysisResult: DocumentAnalysis = await processServerLegalAnalysis(payload.documentText);
    return {
      status: 200,
      headers: securityHeaders,
      data: { analysisResult }
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server-side legal analysis failed.';
    return {
      status: 500,
      headers: securityHeaders,
      data: { error: message, code: 'AI_ANALYSIS_FAILED' }
    };
  }
}
