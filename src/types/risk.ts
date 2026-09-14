export type RiskSeverity = 'low' | 'medium' | 'high';

export interface RiskItem {
  id: string;
  title: string;
  severity: RiskSeverity;
  category: string;
  explanation: string;
  evidenceText: string;
  sourceLocation: {
    section?: string;
    pageNumber: number;
  };
  reasonForFlagging: string;
  suggestedAction: string;
  clauseId?: string;
}
