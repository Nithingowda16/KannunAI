export type DiffCategory =
  | 'all'
  | 'high_attention'
  | 'obligations'
  | 'financial'
  | 'termination'
  | 'privacy'
  | 'liability';

export type ChangeType = 'added' | 'removed' | 'modified' | 'unchanged';

export interface DifferenceItem {
  id: string;
  category: DiffCategory;
  changeType: ChangeType;
  title: string;
  oldText?: string;
  newText?: string;
  whatChanged: string;
  whyItMayMatter: string;
  severity: 'low' | 'medium' | 'high';
  sourceLocationOld?: { section?: string; pageNumber: number };
  sourceLocationNew?: { section?: string; pageNumber: number };
}

export interface ComparisonResult {
  id: string;
  docAId: string;
  docBId: string;
  docAName: string;
  docBName: string;
  comparedAt: string;
  overallSummary: string;
  differences: DifferenceItem[];
  highRiskCount: number;
}
