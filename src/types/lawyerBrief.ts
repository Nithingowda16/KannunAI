export interface PotentialConcern {
  title: string;
  description: string;
  section?: string;
}

export interface LawyerBrief {
  id?: string;
  documentTitle?: string;
  generatedAt?: string;
  executiveSummary: string;
  overview?: string;
  keyObligations: string[];
  importantDates?: string[];
  criticalRiskFactors: string[];
  potentialConcerns?: PotentialConcern[];
  unclearAreas?: string[];
  recommendedNextSteps: string[];
  recommendedQuestions?: string[];
  flaggedClausesCount?: number;
}
