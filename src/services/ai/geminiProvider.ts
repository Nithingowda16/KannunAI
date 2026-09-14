import { AIProvider } from './provider';
import { UploadedDocument } from '../../types/document';
import { DocumentAnalysis, QuestionAnswerResponse } from '../../types/analysis';
import { QAPair } from '../../types/qa';
import { ComparisonResult } from '../../types/comparison';
import { sendServerApiRequest } from '../api/apiClient';
import { AIUnavailableError, AIRateLimitError, AIInvalidResponseError } from '../../errors/aiErrors';

/**
 * Production Gemini AI Provider for KannunAI.
 * Communicates exclusively via typed API Client boundary to backend Gemini proxy.
 * Does NOT fallback to MockAIProvider or expose secret keys in browser bundle.
 */
export class GeminiAIProvider implements AIProvider {
  readonly name = 'Google Gemini 1.5 Flash Production AI Engine';

  async analyzeDocument(doc: UploadedDocument): Promise<DocumentAnalysis> {
    const response = await sendServerApiRequest<{ analysisResult: DocumentAnalysis }>({
      action: 'analyze-doc',
      documentText: doc.rawText
    });

    if (response.ok && response.data?.analysisResult) {
      return response.data.analysisResult;
    }

    if (response.status === 429) {
      throw new AIRateLimitError(response.error);
    }
    if (response.status === 502) {
      throw new AIInvalidResponseError(response.error);
    }
    throw new AIUnavailableError(response.error || 'Gemini AI document analysis service is offline.');
  }

  async answerQuestion(doc: UploadedDocument, question: string, history: QAPair[]): Promise<QAPair> {
    const response = await sendServerApiRequest<QuestionAnswerResponse>({
      action: 'qa',
      document: doc,
      question,
      history
    });

    if (response.ok && response.data) {
      return {
        id: `qa_${Date.now()}`,
        question,
        answer: response.data.answer,
        groundingStatus: response.data.groundingStatus,
        citations: response.data.citations,
        timestamp: response.data.timestamp
      };
    }

    if (response.status === 429) {
      throw new AIRateLimitError(response.error);
    }
    throw new AIUnavailableError(response.error || 'Gemini AI Grounded Q&A service is offline.');
  }

  async compareDocuments(docA: UploadedDocument, docB: UploadedDocument): Promise<ComparisonResult> {
    const response = await sendServerApiRequest<ComparisonResult>({
      action: 'compare',
      documentA: docA,
      documentB: docB
    });

    if (response.ok && response.data) {
      return {
        docAId: docA.id,
        docAName: docA.name,
        docBId: docB.id,
        docBName: docB.name,
        comparisonSummary: response.data.comparisonSummary || 'Document comparison completed.',
        differences: response.data.differences || []
      };
    }

    if (response.status === 429) {
      throw new AIRateLimitError(response.error);
    }
    throw new AIUnavailableError(response.error || 'Gemini AI Document Comparison service is offline.');
  }
}
