export type ClauseCategory =
  | 'payment'
  | 'termination'
  | 'renewal'
  | 'liability'
  | 'indemnification'
  | 'confidentiality'
  | 'intellectual_property'
  | 'non_compete'
  | 'non_solicitation'
  | 'dispute_resolution'
  | 'governing_law'
  | 'warranties'
  | 'penalties'
  | 'privacy'
  | 'automatic_renewal'
  | 'notice_periods'
  | 'obligations'
  | 'deadlines'
  | 'general';

export interface ClauseItem {
  id: string;
  category: ClauseCategory;
  title: string;
  originalText: string;
  plainLanguage: string;
  whyItMatters: string;
  potentialConcern: string;
  sourceLocation: {
    section?: string;
    pageNumber: number;
    startChar: number;
    endChar: number;
  };
  confidence: 'High' | 'Medium' | 'Low';
  status: 'Detected' | 'Requires Review' | 'Standard';
}
