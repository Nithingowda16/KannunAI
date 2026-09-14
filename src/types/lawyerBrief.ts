export interface LawyerBrief {
  id: string;
  documentTitle: string;
  generatedAt: string;
  overview: string;
  keyObligations: string[];
  importantDates: string[];
  potentialConcerns: {
    title: string;
    description: string;
    section?: string;
  }[];
  unclearAreas: string[];
  recommendedQuestions: string[];
  flaggedClausesCount: number;
}
