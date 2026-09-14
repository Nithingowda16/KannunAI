import { RequestPayload, ServerApiResponse } from '../types/api';
import { processServerLegalQA } from '../services/serverAiProvider';
import { QuestionAnswerResponse } from '../../src/types/analysis';

export async function handleQARoute(
  payload: RequestPayload,
  securityHeaders: Record<string, string>
): Promise<ServerApiResponse<QuestionAnswerResponse>> {
  if (!payload.document || !payload.question) {
    return {
      status: 400,
      headers: securityHeaders,
      data: { error: 'Document and question parameters are required.', code: 'MISSING_QA_PARAM' }
    };
  }

  try {
    const qaResult: QuestionAnswerResponse = await processServerLegalQA(
      payload.document,
      payload.question,
      payload.history || []
    );
    return {
      status: 200,
      headers: securityHeaders,
      data: qaResult
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server-side Q&A processing failed.';
    return {
      status: 500,
      headers: securityHeaders,
      data: { error: message, code: 'AI_QA_FAILED' }
    };
  }
}
