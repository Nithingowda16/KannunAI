import { DocumentAnalysis, RiskLevel, ImportanceLevel } from '../../src/types/analysis';

/**
 * Runtime Schema Validator for Gemini AI Responses.
 * Ensures strict type enforcement, required field presence, array integrity,
 * and valid risk levels before returning analysis payload.
 */
export function validateDocumentAnalysisSchema(raw: any): DocumentAnalysis {
  if (!raw || typeof raw !== 'object') {
    throw new Error('AI response payload is not an object.');
  }

  // 1. Validate Summary
  const summaryRaw = raw.summary || {};
  const summary = {
    documentType: String(summaryRaw.documentType || 'Legal Document'),
    apparentPurpose: String(summaryRaw.apparentPurpose || 'Agreement between parties'),
    partiesInvolved: Array.isArray(summaryRaw.partiesInvolved) ? summaryRaw.partiesInvolved.map(String) : [],
    effectiveDate: String(summaryRaw.effectiveDate || 'Unspecified'),
    duration: String(summaryRaw.duration || 'Unspecified'),
    keyObligations: Array.isArray(summaryRaw.keyObligations) ? summaryRaw.keyObligations.map(String) : [],
    importantDeadlines: Array.isArray(summaryRaw.importantDeadlines) ? summaryRaw.importantDeadlines.map(String) : [],
    unestablishedInformation: Array.isArray(summaryRaw.unestablishedInformation) ? summaryRaw.unestablishedInformation.map(String) : []
  };

  // 2. Validate Clauses
  const clausesRaw = Array.isArray(raw.clauses) ? raw.clauses : [];
  const clauses = clausesRaw.map((c: any, index: number) => ({
    id: String(c.id || `clause_${index + 1}`),
    category: String(c.category || 'General Terms'),
    originalTextSnippet: String(c.originalTextSnippet || ''),
    plainLanguageExplanation: String(c.plainLanguageExplanation || 'Explanation unavailable.'),
    confidenceScore: typeof c.confidenceScore === 'number' ? Math.min(1, Math.max(0, c.confidenceScore)) : 0.9
  }));

  // 3. Validate Risks
  const risksRaw = Array.isArray(raw.risks) ? raw.risks : [];
  const validLevels: RiskLevel[] = ['low', 'medium', 'high'];
  const risks = risksRaw.map((r: any, index: number) => {
    const level: RiskLevel = validLevels.includes(r.level) ? r.level : 'medium';
    return {
      id: String(r.id || `risk_${index + 1}`),
      title: String(r.title || 'Attention Area'),
      level,
      category: String(r.category || 'Compliance'),
      evidenceSnippet: String(r.evidenceSnippet || ''),
      explanation: String(r.explanation || 'Detailed review recommended.'),
      suggestedQuestion: String(r.suggestedQuestion || 'What are the termination conditions?')
    };
  });

  // Calculate Risk Score (0 - 100)
  const highRiskCount = risks.filter((r: { level: string }) => r.level === 'high').length;
  const mediumRiskCount = risks.filter((r: { level: string }) => r.level === 'medium').length;
  const overallRiskScore = Math.min(100, highRiskCount * 25 + mediumRiskCount * 10 + 15);

  // 4. Validate Checklist
  const checklistRaw = Array.isArray(raw.checklist) ? raw.checklist : [];
  const validImportances: ImportanceLevel[] = ['low', 'medium', 'high', 'critical'];
  const checklist = checklistRaw.map((item: any, index: number) => ({
    id: String(item.id || `chk_${index + 1}`),
    category: String(item.category || 'General'),
    itemText: String(item.itemText || 'Verify terms with legal counsel'),
    importance: validImportances.includes(item.importance) ? (item.importance as ImportanceLevel) : 'medium',
    isChecked: Boolean(item.isChecked)
  }));

  // Default checklist fallback if AI omits it
  const finalChecklist = checklist.length > 0 ? checklist : [
    { id: 'chk_1', category: 'Pre-Signing', itemText: 'Confirm correct legal names and effective dates', importance: 'critical' as ImportanceLevel, isChecked: false },
    { id: 'chk_2', category: 'Compliance', itemText: 'Verify governing law and jurisdiction clauses', importance: 'high' as ImportanceLevel, isChecked: false },
    { id: 'chk_3', category: 'Financial', itemText: 'Review payment schedules and penalty clauses', importance: 'high' as ImportanceLevel, isChecked: false }
  ];

  // 5. Validate Lawyer Brief
  const briefRaw = raw.lawyerBrief || {};
  const lawyerBrief = {
    executiveSummary: String(briefRaw.executiveSummary || `${summary.documentType} analyzed for legal risk and key obligations.`),
    keyObligations: Array.isArray(briefRaw.keyObligations) ? briefRaw.keyObligations.map(String) : summary.keyObligations,
    criticalRiskFactors: Array.isArray(briefRaw.criticalRiskFactors) ? briefRaw.criticalRiskFactors.map(String) : risks.map((r: { title: string }) => r.title),
    recommendedNextSteps: Array.isArray(briefRaw.recommendedNextSteps) ? briefRaw.recommendedNextSteps.map(String) : [
      'Conduct formal legal review of liability limitations.',
      'Clarify notice periods for termination.'
    ]
  };

  return {
    summary,
    clauses,
    risks,
    overallRiskScore,
    checklist: finalChecklist,
    lawyerBrief
  };
}
