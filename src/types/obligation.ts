export interface LegalObligationItem {
  id: string;
  party: string; // WHO
  obligation: string; // WHAT
  deadline?: string; // WHEN
  consequence?: string; // CONSEQUENCE
  evidence: string; // SOURCE document quote
  sourceLocation: {
    pageNumber: number;
    section?: string;
    startChar?: number;
    endChar?: number;
  };
  severity: 'high' | 'medium' | 'low';
}
