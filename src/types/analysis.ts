import { ClauseItem } from './clause';
import { RiskItem, RiskLevel } from './risk';
import { QAPair, Citation, QuestionAnswerResponse } from './qa';
import { ChecklistItem, ImportanceLevel } from './checklist';
import { LawyerBrief } from './lawyerBrief';
import { DocumentMetadata } from './document';

export interface PartyInfo {
  name: string;
  role: string;
}

export interface DocumentSummary {
  quickSummary?: string;
  detailedSummary?: string;
  documentType: string;
  apparentPurpose: string;
  partiesInvolved: string[];
  effectiveDate: string;
  duration: string;
  terminationSummary?: string;
  keyObligations: string[];
  importantDeadlines: string[];
  keyDeadlines?: string[];
  notableRisks?: string[];
  unestablishedInformation: string[];
  missingInformation?: string[];
}

export interface DocumentAnalysis {
  id?: string;
  documentId?: string;
  analyzedAt?: string;
  overallRiskScore: number;
  summary: DocumentSummary;
  clauses: ClauseItem[];
  risks: RiskItem[];
  qaHistory?: QAPair[];
  checklist: ChecklistItem[];
  lawyerBrief: LawyerBrief;
  metadata?: DocumentMetadata;
}

export type { RiskLevel, ImportanceLevel, Citation, QAPair, QuestionAnswerResponse };
