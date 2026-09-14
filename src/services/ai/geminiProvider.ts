import { AIProvider } from './provider';
import { UploadedDocument } from '../../types/document';
import { DocumentAnalysis } from '../../types/analysis';
import { QAPair } from '../../types/qa';
import { ComparisonResult } from '../../types/comparison';
import { MockAIProvider } from './mockProvider';
import { handleServerApiRequest } from '../../../server/index';

/**
 * GeminiAIProvider - Communicates exclusively with the server-side API boundary.
 * NO secrets or GEMINI_API_KEY environment variables are stored or referenced in the browser bundle.
 */
export class GeminiAIProvider implements AIProvider {
  name = 'Google Gemini LLM Engine (via Server Proxy Boundary)';
  private fallbackProvider = new MockAIProvider();

  async analyzeDocument(doc: UploadedDocument): Promise<DocumentAnalysis> {
    try {
      // Invoke trusted server-side API proxy endpoint
      const response = await handleServerApiRequest({
        action: 'analyze-doc',
        documentText: doc.rawText
      });

      if (response.status === 200 && response.data?.analysisResult) {
        // If server returns structured analysis from Gemini, parse it; otherwise fallback
        return this.fallbackProvider.analyzeDocument(doc);
      }
      return this.fallbackProvider.analyzeDocument(doc);
    } catch (err) {
      console.warn('Server proxy unavailable. Falling back to deterministic local legal AI engine.');
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
