export interface LegalInconsistencyItem {
  id: string;
  title: string;
  description: string;
  clauseA: {
    title: string;
    text: string;
    section?: string;
    pageNumber?: number;
  };
  clauseB: {
    title: string;
    text: string;
    section?: string;
    pageNumber?: number;
  };
  whyItMatters: string;
  recommendation: string;
  severity: 'high' | 'medium' | 'low';
}
