import { DocumentAnalysis, QuestionAnswerResponse } from '../../src/types/analysis';
import { UploadedDocument } from '../../src/types/document';
import { MockAIProvider } from '../../src/services/ai/mockProvider';
import { validateDocumentAnalysisSchema } from './schemaValidator';

const localEngine = new MockAIProvider();

/**
 * Server-Side Legal Analysis Engine.
 * Operates in-memory using local document intelligence without external AI API dependencies.
 */
export async function processServerLegalAnalysis(
  documentText: string
): Promise<DocumentAnalysis> {
  const dummyDoc: UploadedDocument = {
    id: `doc_${Date.now()}`,
    name: 'uploaded_document.txt',
    uploadedAt: new Date().toLocaleTimeString(),
    rawText: documentText,
    chunks: []
  };

  const rawAnalysis = await localEngine.analyzeDocument(dummyDoc);
  return validateDocumentAnalysisSchema(rawAnalysis);
}

/**
 * Server-Side Grounded Legal Q&A Provider
 */
export async function processServerLegalQA(
  document: UploadedDocument,
  question: string,
  history: any[] = []
): Promise<QuestionAnswerResponse> {
  const qaResult = await localEngine.answerQuestion(document, question, history);
  return {
    answer: qaResult.answer,
    groundingStatus: qaResult.groundingStatus,
    citations: qaResult.citations,
    timestamp: qaResult.timestamp
  };
}

/**
 * Server-Side Document Comparison Provider
 */
export async function processServerLegalComparison(
  docAText: string,
  docBText: string
): Promise<any> {
  const docA: UploadedDocument = {
    id: 'doc_a',
    name: 'Document A',
    uploadedAt: new Date().toLocaleTimeString(),
    rawText: docAText,
    chunks: []
  };

  const docB: UploadedDocument = {
    id: 'doc_b',
    name: 'Document B',
    uploadedAt: new Date().toLocaleTimeString(),
    rawText: docBText,
    chunks: []
  };

  return localEngine.compareDocuments(docA, docB);
}
