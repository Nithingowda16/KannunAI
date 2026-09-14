import { DocumentAnalysis } from '../../types/analysis';
import { UploadedDocument } from '../../types/document';
import { QAPair } from '../../types/qa';
import { ComparisonResult } from '../../types/comparison';

export interface AIProvider {
  name: string;
  analyzeDocument(doc: UploadedDocument): Promise<DocumentAnalysis>;
  answerQuestion(doc: UploadedDocument, question: string, history: QAPair[]): Promise<QAPair>;
  compareDocuments(docA: UploadedDocument, docB: UploadedDocument): Promise<ComparisonResult>;
}
