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
  category: string;
  title?: string;
  originalText?: string;
  originalTextSnippet?: string;
  plainLanguage?: string;
  plainLanguageExplanation?: string;
  whyItMatters?: string;
  potentialConcern?: string;
  sourceLocation?: {
    section?: string;
    pageNumber: number;
    startChar?: number;
    endChar?: number;
  };
  confidence?: 'High' | 'Medium' | 'Low';
  confidenceScore?: number;
  status?: 'Detected' | 'Requires Review' | 'Standard';
}
