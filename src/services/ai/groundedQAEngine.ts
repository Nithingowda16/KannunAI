import { UploadedDocument } from '../../types/document';
import { QAPair } from '../../types/qa';
import { MockAIProvider } from './mockProvider';

/**
 * Grounded Legal Q&A Engine with strict citation mapping and fallback policy.
 */

export async function askGroundedLegalQuestion(
  document: UploadedDocument,
  question: string,
  history: QAPair[] = []
): Promise<QAPair> {
  const provider = new MockAIProvider();
  return provider.answerQuestion(document, question, history);
}
