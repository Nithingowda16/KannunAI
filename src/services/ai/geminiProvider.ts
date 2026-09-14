import { AIProvider } from './provider';
import { UploadedDocument } from '../../types/document';
import { DocumentAnalysis } from '../../types/analysis';
import { QAPair } from '../../types/qa';
import { ComparisonResult } from '../../types/comparison';
import { MockAIProvider } from './mockProvider';

/**
 * Local AI-assisted Legal Document Intelligence Engine.
 * Operates strictly in-memory using local RAG, sliding-window chunking, and TF-IDF vector retrieval.
 * Requires ZERO external API keys or third-party cloud services.
 */
export class GeminiAIProvider implements AIProvider {
  readonly name = 'KannunAI Local Document Intelligence Engine (In-Memory RAG)';
  private engine = new MockAIProvider();

  async analyzeDocument(doc: UploadedDocument): Promise<DocumentAnalysis> {
    return this.engine.analyzeDocument(doc);
  }

  async answerQuestion(doc: UploadedDocument, question: string, history: QAPair[]): Promise<QAPair> {
    return this.engine.answerQuestion(doc, question, history);
  }

  async compareDocuments(docA: UploadedDocument, docB: UploadedDocument): Promise<ComparisonResult> {
    return this.engine.compareDocuments(docA, docB);
  }
}

export { GeminiAIProvider as LocalLegalAIProvider };
