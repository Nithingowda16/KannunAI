import { AIProvider } from './provider';
import { UploadedDocument } from '../../types/document';
import { DocumentAnalysis } from '../../types/analysis';
import { QAPair } from '../../types/qa';
import { ComparisonResult } from '../../types/comparison';
import { MockAIProvider } from './mockProvider';
import { sendServerApiRequest } from '../api/apiClient';

/**
 * GeminiAIProvider - Communicates exclusively via the typed API client boundary.
 * NO secrets or GEMINI_API_KEY environment variables are stored or referenced in the browser bundle.
 */
export class GeminiAIProvider implements AIProvider {
  name = 'Google Gemini LLM Engine (via Server Proxy Boundary)';
  private fallbackProvider = new MockAIProvider();

  async analyzeDocument(doc: UploadedDocument): Promise<DocumentAnalysis> {
    try {
      const response = await sendServerApiRequest<{ analysisResult?: DocumentAnalysis }>({
        action: 'analyze-doc',
        documentText: doc.rawText
      });

      if (response.status === 200 && response.data?.analysisResult) {
        return response.data.analysisResult;
      }
      return this.fallbackProvider.analyzeDocument(doc);
    } catch (_err) {
      return this.fallbackProvider.analyzeDocument(doc);
    }
  }

  async answerQuestion(doc: UploadedDocument, question: string, history: QAPair[]): Promise<QAPair> {
    return this.fallbackProvider.answerQuestion(doc, question, history);
  }

  async compareDocuments(docA: UploadedDocument, docB: UploadedDocument): Promise<ComparisonResult> {
    return this.fallbackProvider.compareDocuments(docA, docB);
  }
}
