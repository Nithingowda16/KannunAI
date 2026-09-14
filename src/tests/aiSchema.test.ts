import { describe, test, expect } from 'vitest';
import { validateDocumentAnalysisSchema } from '../../server/services/schemaValidator';

describe('AI Schema & Malicious Payload Security Tests', () => {
  test('Valid AI output parses correctly into DocumentAnalysis', () => {
    const validRaw = {
      summary: {
        documentType: 'Employment Agreement',
        apparentPurpose: 'Define work terms',
        partiesInvolved: ['Company', 'Employee'],
        effectiveDate: '2026-01-15',
        duration: '1 Year',
        keyObligations: ['Work duties', 'Payment'],
        importantDeadlines: ['Jan 15'],
        unestablishedInformation: ['Bonus percentage']
      },
      clauses: [
        {
          id: 'c1',
          category: 'Termination',
          originalTextSnippet: '30 days notice',
          plainLanguageExplanation: '30 days written notice required',
          confidenceScore: 0.95
        }
      ],
      risks: [
        {
          id: 'r1',
          title: 'Short Notice Window',
          level: 'medium',
          category: 'Termination',
          evidenceSnippet: '30 days notice',
          explanation: '30 days may be short for executive replacement',
          suggestedQuestion: 'Can notice be extended?'
        }
      ]
    };

    const validated = validateDocumentAnalysisSchema(validRaw);
    expect(validated.summary.documentType).toBe('Employment Agreement');
    expect(validated.clauses.length).toBe(1);
    expect(validated.risks.length).toBe(1);
    expect(validated.overallRiskScore).toBe(25);
  });

  test('Missing fields in raw AI output are safely normalized with defaults', () => {
    const incompleteRaw = {
      summary: {
        documentType: 'Non-Disclosure Agreement'
      }
    };

    const validated = validateDocumentAnalysisSchema(incompleteRaw);
    expect(validated.summary.documentType).toBe('Non-Disclosure Agreement');
    expect(validated.summary.partiesInvolved).toEqual([]);
    expect(validated.clauses).toEqual([]);
    expect(validated.checklist.length).toBeGreaterThan(0);
  });

  test('Invalid non-object AI payload throws an error', () => {
    expect(() => validateDocumentAnalysisSchema(null)).toThrow('Analysis response payload is not an object.');
    expect(() => validateDocumentAnalysisSchema('string payload')).toThrow('Analysis response payload is not an object.');
  });

  test('Out-of-bounds confidence scores are clamped between 0 and 1', () => {
    const invalidConfidenceRaw = {
      summary: {},
      clauses: [{ confidenceScore: 1.5 }, { confidenceScore: -0.2 }]
    };

    const validated = validateDocumentAnalysisSchema(invalidConfidenceRaw);
    expect(validated.clauses[0].confidenceScore).toBe(1);
    expect(validated.clauses[1].confidenceScore).toBe(0);
  });
});
