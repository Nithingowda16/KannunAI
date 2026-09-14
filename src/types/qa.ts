export interface Citation {
  id: string;
  sectionTitle?: string;
  pageNumber: number;
  snippet: string;
  startChar: number;
  endChar: number;
  confidenceScore: number;
}

export interface QAPair {
  id: string;
  question: string;
  answer: string;
  citations: Citation[];
  groundingStatus: 'Grounded' | 'Partial' | 'Not Found';
  timestamp: string;
  isCustom: boolean;
}
