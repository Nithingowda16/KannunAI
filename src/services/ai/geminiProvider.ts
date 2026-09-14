import { AIProvider } from './provider';
import { UploadedDocument } from '../../types/document';
import { DocumentAnalysis, QuestionAnswerResponse } from '../../types/analysis';
import { QAPair } from '../../types/qa';
import { ComparisonResult } from '../../types/comparison';
import { sendServerApiRequest } from '../api/apiClient';

/**
 * GeminiAIProvider - Production AI Engine communicating exclusively via typed API Client boundary.
 * NO secrets or GEMINI_API_KEY environment variables are exposed in the browser bundle.
 * Fully connects Analyze, Grounded Q&A, and Document Comparison to backend Gemini API.
 */
export class GeminiAIProvider implements AIProvider {
  name = 'Google Gemini 1.5 Flash (via Server Proxy Boundary)';

  async analyzeDocument(doc: UploadedDocument): Promise<DocumentAnalysis> {
    const response = await sendServerApiRequest<{ analysisResult?: DocumentAnalysis }>({
      action: 'analyze-doc',
      documentText: doc.rawText
    });

    if (response.status === 200 && response.data?.analysisResult) {
      return response.data.analysisResult;
    }

    throw new Error(
      response.error || `Gemini AI document analysis service returned status ${response.status}. Please check backend logs or GEMINI_API_KEY configuration.`
    );
  }

  async answerQuestion(doc: UploadedDocument, question: string, history: QAPair[]): Promise<QAPair> {
    const response = await sendServerApiRequest<QuestionAnswerResponse>({
      action: 'qa',
      document: doc,
      question,
      history
    });

    if (response.status === 200 && response.data) {
      return {
        id: `qa_${Date.now()}`,
        question,
        answer: response.data.answer,
        groundingStatus: response.data.groundingStatus,
        citations: response.data.citations,
        timestamp: response.data.timestamp
      };
    }

    throw new Error(
      response.error || `Gemini AI Grounded Q&A service returned status ${response.status}.`
    );
  }

  async compareDocuments(docA: UploadedDocument, docB: UploadedDocument): Promise<ComparisonResult> {
    const response = await sendServerApiRequest<any>({
      action: 'compare',
      documentA: docA,
      documentB: docB
    });

    if (response.status === 200 && response.data) {
      return {
        docAId: docA.id,
        docAName: docA.name,
        docBId: docB.id,
        docBName: docB.name,
        comparisonSummary: response.data.comparisonSummary || 'Document comparison complete.',
        differences: response.data.differences || []
      };
    }

    throw new Error(
      response.error || `Gemini AI Document Comparison service returned status ${response.status}.`
    );
  }
}
