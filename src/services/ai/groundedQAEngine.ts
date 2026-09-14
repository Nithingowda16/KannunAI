import { UploadedDocument } from '../../types/document';
import { QAPair } from '../../types/qa';
import { GeminiAIProvider } from './geminiProvider';

/**
 * Grounded Legal Q&A Engine with strict citation mapping and vector RAG retrieval.
 */
export async function askGroundedLegalQuestion(
  document: UploadedDocument,
  question: string,
  history: QAPair[] = []
): Promise<QAPair> {
  const provider = new GeminiAIProvider();
  return provider.answerQuestion(document, question, history);
}
