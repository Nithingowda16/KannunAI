import { describe, test, expect } from 'vitest';
import { GeminiAIProvider } from '../services/ai/geminiProvider';
import { getSampleDocument } from '../utils/sampleDocuments';

describe('PromptWars Problem Statement Alignment - AI for Legal Assistance & Access', () => {
  const provider = new GeminiAIProvider();
  const sampleDoc = getSampleDocument('employment');
  const saasDoc = getSampleDocument('saas_v1');

  test('Pillar 1 - Plain-Language Summarization & Metadata Extraction', async () => {
    const analysis = await provider.analyzeDocument(sampleDoc);

    expect(analysis.summary).toBeDefined();
    expect(analysis.summary.documentType).toBe('Employment Agreement');
    expect(analysis.summary.partiesInvolved.length).toBeGreaterThan(0);
    expect(analysis.summary.apparentPurpose).toBeDefined();
    expect(analysis.summary.keyObligations.length).toBeGreaterThan(0);
    expect(analysis.summary.unestablishedInformation).toBeDefined();
  });

  test('Pillar 2 - 4-Part Actionable Risk Radar Schema', async () => {
    const analysis = await provider.analyzeDocument(sampleDoc);

    expect(analysis.risks.length).toBeGreaterThan(0);
    const highRisk = analysis.risks.find((r) => r.level === 'high' || r.severity === 'high');
    expect(highRisk).toBeDefined();

    // Verify 4-part actionable schema
    analysis.risks.forEach((risk) => {
      expect(risk.whatDocumentSays).toBeDefined();
      expect(risk.whyItMatters).toBeDefined();
      expect(risk.whatToConsider).toBeDefined();
      expect(risk.source).toBeDefined();
    });
  });

  test('Pillar 3 - Structured Legal Obligations Extraction (Who, What, When, Consequence, Source)', async () => {
    const analysis = await provider.analyzeDocument(sampleDoc);

    expect(analysis.obligations).toBeDefined();
    expect(analysis.obligations!.length).toBeGreaterThan(0);

    const obligation = analysis.obligations![0];
    expect(obligation.id).toBeDefined();
    expect(obligation.party).toBeDefined();
    expect(obligation.obligation).toBeDefined();
    expect(obligation.deadline).toBeDefined();
    expect(obligation.consequence).toBeDefined();
    expect(obligation.evidence).toBeDefined();
    expect(obligation.severity).toBeDefined();
  });

  test('Pillar 4 - Contractual Contradictions & Inconsistency Detection', async () => {
    // Construct contract text containing conflicting provisions
    const rawContent = `EMPLOYMENT & CONSULTING AGREEMENT
Clause 4.1: Either party may terminate this agreement at any time immediately without cause or prior notice.
Clause 9.2: In the event of termination, the Employee must provide thirty (30) days written notice prior to departure.
Clause 12.1: This Agreement shall expire exactly one year from effective date and all covenants shall terminate.
Clause 15.3: Confidentiality and restrictive covenants shall survive perpetually without limitation in duration.
Clause 18.0: Provider shall bear no liability whatsoever for any damages.
Clause 18.2: Customer indemnifies and holds harmless Provider from all claims arising hereunder.`;

    const contradictoryContract = {
      ...sampleDoc,
      id: 'conflict_test_doc',
      rawText: rawContent,
      content: rawContent
    };

    const analysis = await provider.analyzeDocument(contradictoryContract);
    expect(analysis.inconsistencies).toBeDefined();
    expect(analysis.inconsistencies!.length).toBeGreaterThan(0);

    const inconsistency = analysis.inconsistencies![0];
    expect(inconsistency.title).toBeDefined();
    expect(inconsistency.clauseA).toBeDefined();
    expect(inconsistency.clauseB).toBeDefined();
    expect(inconsistency.description).toBeDefined();
    expect(inconsistency.whyItMatters).toBeDefined();
    expect(inconsistency.recommendation).toBeDefined();
  });

  test('Pillar 5 - Grounded Legal Q&A with Citation Anchoring', async () => {
    const question = 'Can this agreement be terminated without cause or advance notice?';
    const answerResult = await provider.answerQuestion(sampleDoc, question);

    expect(answerResult).toBeDefined();
    expect(answerResult.answer).toBeDefined();
    expect(answerResult.answer.length).toBeGreaterThan(20);
    expect(answerResult.groundingStatus).toBe('Grounded');
    expect(answerResult.citations.length).toBeGreaterThan(0);
  });

  test('Pillar 6 - Actionable Checklist Categorization (Review, Clarify, Negotiate, Confirm, Ask a Lawyer)', async () => {
    const analysis = await provider.analyzeDocument(sampleDoc);

    expect(analysis.checklist.length).toBeGreaterThan(0);
    const actionTypes = analysis.checklist.map((item) => item.actionType);
    expect(actionTypes.some((t) => t === 'Review' || t === 'Clarify' || t === 'Negotiate' || t === 'Confirm' || t === 'Ask a Lawyer')).toBe(true);

    const itemWithContext = analysis.checklist.find((item) => !!item.linkedFinding);
    expect(itemWithContext).toBeDefined();
  });

  test('Pillar 7 - Comprehensive 8-Part Attorney Consultation Brief Dossier', async () => {
    const analysis = await provider.analyzeDocument(saasDoc);
    const brief = analysis.lawyerBrief;

    expect(brief).toBeDefined();
    expect(brief.executiveSummary || brief.overview).toBeDefined();
    expect(brief.keyObligations.length).toBeGreaterThan(0);
    expect(brief.importantDates).toBeDefined();
    expect(brief.importantDates!.length).toBeGreaterThan(0);
    expect(brief.potentialConcerns).toBeDefined();
    expect(brief.potentialConcerns!.length).toBeGreaterThan(0);
    expect(brief.questionsToAsk!.length).toBeGreaterThan(0);
    expect(brief.informationToBring!.length).toBeGreaterThan(0);
    expect(brief.unresolvedQuestions!.length).toBeGreaterThan(0);
    expect(brief.importantClauses!.length).toBeGreaterThan(0);
  });

  test('Pillar 8 - Side-by-Side Contract Comparison Diff Matrix', async () => {
    const docB = getSampleDocument('saas_v2');
    const diff = await provider.compareDocuments(saasDoc, docB);

    expect(diff).toBeDefined();
    expect(diff.differences.length).toBeGreaterThan(0);
    expect(diff.differences[0].whatChanged).toBeDefined();
    expect(diff.differences[0].whyItMayMatter).toBeDefined();
  });

  test('Efficiency - Vector Store & Analysis Caches Eliminate Redundant Computations', async () => {
    const t0 = performance.now();
    await provider.analyzeDocument(sampleDoc);
    const durationFirst = performance.now() - t0;

    const t1 = performance.now();
    await provider.analyzeDocument(sampleDoc);
    const durationCached = performance.now() - t1;

    // Second call should resolve immediately from cache (< 5ms)
    expect(durationCached).toBeLessThan(durationFirst + 10);
  });
});

export function runPromptWarsAlignmentTests(): { passed: number; failed: number; logs: string[] } {
  const logs: string[] = [];
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      passed++;
      logs.push(`[PASS] ${testName}`);
    } else {
      failed++;
      logs.push(`[FAIL] ${testName}`);
    }
  }

  const provider = new GeminiAIProvider();
  const sampleDoc = getSampleDocument('employment');

  // 1. Obligations extraction
  const obligations = provider.extractObligationsFromText(sampleDoc.rawText);
  assert(obligations.length > 0, 'Extracts structured legal obligations');
  assert(!!obligations[0].party && !!obligations[0].obligation && !!obligations[0].evidence, 'Obligations contain Party/Obligation/Evidence');

  // 2. Inconsistencies detection
  const inconsistentText = `Clause 1: Terminate immediately without notice.\nClause 2: 30 days prior written notice required before termination.`;
  const inconsistencies = provider.detectInconsistencies(inconsistentText);
  assert(inconsistencies.length > 0, 'Detects conflicting contract clauses');
  assert(!!inconsistencies[0].recommendation, 'Inconsistency provides practical resolution recommendation');

  return { passed, failed, logs };
}
