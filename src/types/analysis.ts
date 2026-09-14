import { ClauseItem } from './clause';
import { RiskItem } from './risk';
import { QAPair } from './qa';
import { ChecklistItem } from './checklist';
import { LawyerBrief } from './lawyerBrief';
import { DocumentMetadata } from './document';

export interface PartyInfo {
  name: string;
  role: string;
}

export interface DocumentSummary {
  quickSummary: string;
  detailedSummary: string;
  documentType: string;
  apparentPurpose: string;
  partiesInvolved: string[];
  effectiveDate: string;
  duration: string;
  terminationSummary: string;
  keyObligations: string[];
  keyDeadlines: string[];
  notableRisks: string[];
  missingInformation: string[];
}

export interface DocumentAnalysis {
  id: string;
  documentId: string;
  analyzedAt: string;
  summary: DocumentSummary;
  clauses: ClauseItem[];
  risks: RiskItem[];
  qaHistory: QAPair[];
  checklist: ChecklistItem[];
  lawyerBrief: LawyerBrief;
  metadata: DocumentMetadata;
}
