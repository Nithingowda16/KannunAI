export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type RiskSeverity = RiskLevel;

export interface RiskItem {
  id: string;
  title: string;
  level: RiskLevel;
  severity?: RiskSeverity;
  category: string;
  explanation: string;
  evidenceSnippet?: string;
  evidenceText?: string;
  suggestedQuestion?: string;
  sourceLocation?: {
    section?: string;
    pageNumber: number;
  };
  reasonForFlagging?: string;
  suggestedAction?: string;
  clauseId?: string;
}
