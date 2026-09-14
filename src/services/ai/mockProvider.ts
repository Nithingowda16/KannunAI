import { AIProvider } from './provider';
import { UploadedDocument } from '../../types/document';
import { DocumentAnalysis } from '../../types/analysis';
import { QAPair, Citation } from '../../types/qa';
import { ComparisonResult, DifferenceItem } from '../../types/comparison';
import { ClauseItem } from '../../types/clause';
import { RiskItem } from '../../types/risk';
import { ChecklistItem } from '../../types/checklist';
import { LawyerBrief } from '../../types/lawyerBrief';
import { LegalObligationItem } from '../../types/obligation';
import { LegalInconsistencyItem } from '../../types/inconsistency';
import { InMemoryVectorStore } from '../document/vectorStore';
import { createDocumentChunks } from '../document/chunker';

// High-efficiency in-memory memoization caches (Phase 15 - Efficiency)
const vectorStoreCache = new Map<string, InMemoryVectorStore>();
const analysisCache = new Map<string, DocumentAnalysis>();

export class MockAIProvider implements AIProvider {
  name = 'KannunAI Local Deterministic Legal Analysis Engine';

  async analyzeDocument(doc: UploadedDocument): Promise<DocumentAnalysis> {
    const cacheKey = `${doc.id || 'doc'}_${doc.rawText.length}`;
    if (analysisCache.has(cacheKey)) {
      return analysisCache.get(cacheKey)!;
    }

    // 1. Detect Clauses across categories
    const clauses = extractLegalClausesFromText(doc);

    // 2. Detect Actionable Risks (Phase 4)
    const risks = evaluateRisksFromClauses(clauses, doc);

    // 3. Extract Structured Obligations (WHO, WHAT, WHEN, CONSEQUENCE, SOURCE) (Phase 5)
    const obligations = extractObligationsFromText(doc, clauses);

    // 4. Detect Contractual Inconsistencies & Contradictions (Phase 2 & 3)
    const inconsistencies = detectInconsistencies(doc, clauses);

    // 5. Generate Plain Language Summary (Phase 3)
    const summary = generatePlainSummary(doc, clauses, risks);

    // 6. Generate Actionable Pre-Signing Checklist (Review, Clarify, Negotiate, Confirm, Ask a Lawyer) (Phase 9)
    const checklist = generateChecklistItems(clauses, risks, obligations);

    // 7. Generate Complete Lawyer Prep Brief (Phase 10)
    const lawyerBrief = generateLawyerBrief(doc, summary, clauses, risks, obligations, inconsistencies);

    const highRiskCount = risks.filter((r) => r.level === 'high' || r.level === 'critical').length;
    const mediumRiskCount = risks.filter((r) => r.level === 'medium').length;
    const overallRiskScore = Math.min(100, highRiskCount * 25 + mediumRiskCount * 10 + 15);

    const analysis: DocumentAnalysis = {
      id: `analysis_${doc.id}`,
      documentId: doc.id,
      analyzedAt: new Date().toISOString(),
      overallRiskScore,
      summary,
      clauses,
      risks,
      obligations,
      inconsistencies,
      qaHistory: [],
      checklist,
      lawyerBrief,
      metadata: {
        documentType: summary.documentType,
        apparentPurpose: summary.apparentPurpose,
        parties: summary.partiesInvolved,
        effectiveDate: summary.effectiveDate,
        duration: summary.duration,
        governingLaw: extractGoverningLaw(doc.rawText)
      }
    };

    analysisCache.set(cacheKey, analysis);
    return analysis;
  }

  extractObligationsFromText(text: string): LegalObligationItem[] {
    const dummyDoc: UploadedDocument = {
      id: 'doc_temp',
      name: 'Temp Document',
      rawText: text,
      content: text,
      pageCount: 1,
      wordCount: text.split(/\s+/).length,
      chunks: [],
      uploadedAt: new Date().toISOString()
    };
    const clauses = extractLegalClausesFromText(dummyDoc);
    return extractObligationsFromText(dummyDoc, clauses);
  }

  detectInconsistencies(text: string): LegalInconsistencyItem[] {
    const dummyDoc: UploadedDocument = {
      id: 'doc_temp',
      name: 'Temp Document',
      rawText: text,
      content: text,
      pageCount: 1,
      wordCount: text.split(/\s+/).length,
      chunks: [],
      uploadedAt: new Date().toISOString()
    };
    const clauses = extractLegalClausesFromText(dummyDoc);
    return detectInconsistencies(dummyDoc, clauses);
  }

  async answerQuestion(
    doc: UploadedDocument,
    question: string,
    _history: QAPair[]
  ): Promise<QAPair> {
    const cacheKey = `${doc.id || 'doc'}_${doc.rawText?.length || 0}`;
    let vectorStore = vectorStoreCache.get(cacheKey);
    if (!vectorStore) {
      const chunks =
        doc.chunks && doc.chunks.length > 0
          ? doc.chunks
          : (doc.rawText ? createDocumentChunks(doc.id || 'doc', doc.rawText, doc.pageCount || 1) : []);
      vectorStore = new InMemoryVectorStore(chunks);
      vectorStoreCache.set(cacheKey, vectorStore);
    }
    const searchResults = vectorStore.search(question, 3);

    if (searchResults.length === 0 || searchResults[0].score <= 0) {
      return {
        id: `qa_${Date.now()}`,
        question,
        answer: 'The provided legal document does not contain sufficient information to answer this question. Try asking about payment terms, cancellation notice, intellectual property ownership, or restrictive covenants—or consider discussing this matter with a qualified legal professional.',
        citations: [],
        groundingStatus: 'Not Found',
        timestamp: new Date().toLocaleTimeString(),
        isCustom: true
      };
    }

    const topChunk = searchResults[0].chunk;
    const answerText = generateGroundedAnswerText(question, topChunk.text, doc.rawText);

    const citation: Citation = {
      id: `cit_${Date.now()}`,
      chunkId: topChunk.id,
      sectionTitle: topChunk.sectionHeader || `Page ${topChunk.pageNumber}`,
      sectionHeader: topChunk.sectionHeader || `Section Page ${topChunk.pageNumber}`,
      pageNumber: topChunk.pageNumber,
      snippet: topChunk.text.substring(0, 180) + '...',
      startChar: topChunk.startChar,
      endChar: topChunk.endChar,
      confidenceScore: Math.min(0.98, 0.75 + searchResults[0].score * 0.1)
    };

    return {
      id: `qa_${Date.now()}`,
      question,
      answer: answerText,
      citations: [citation],
      groundingStatus: 'Grounded',
      timestamp: new Date().toLocaleTimeString(),
      isCustom: true
    };
  }

  async compareDocuments(
    docA: UploadedDocument,
    docB: UploadedDocument
  ): Promise<ComparisonResult> {
    const differences: DifferenceItem[] = [];

    const clausesA = extractLegalClausesFromText(docA);
    const clausesB = extractLegalClausesFromText(docB);

    const renewA = clausesA.find((c) => c.category === 'automatic_renewal');
    const renewB = clausesB.find((c) => c.category === 'automatic_renewal');
    if (renewA && !renewB) {
      differences.push({
        id: 'diff_1',
        category: 'termination',
        changeType: 'removed',
        title: 'Automatic Renewal Clause Removed in Version B',
        oldText: renewA.originalText,
        whatChanged: 'Version B removes the automatic annual renewal requirement present in Version A.',
        whyItMayMatter: 'You will no longer be locked into automatic recurring fee commitments without re-signing.',
        severity: 'medium',
        sourceLocationOld: { section: renewA.sourceLocation?.section, pageNumber: renewA.sourceLocation?.pageNumber || 1 }
      });
    }

    const noticeA = clausesA.find((c) => c.category === 'notice_periods' || c.category === 'termination');
    const noticeB = clausesB.find((c) => c.category === 'notice_periods' || c.category === 'termination');
    if (noticeA && noticeB && noticeA.originalText !== noticeB.originalText) {
      differences.push({
        id: 'diff_2',
        category: 'termination',
        changeType: 'modified',
        title: 'Termination Notice Period Extended',
        oldText: noticeA.originalText,
        newText: noticeB.originalText,
        whatChanged: 'The required written notice period for cancellation changed between versions.',
        whyItMayMatter: 'Failing to provide timely notice under the updated timeframe could prevent valid agreement termination.',
        severity: 'high',
        sourceLocationOld: { section: noticeA.sourceLocation?.section, pageNumber: noticeA.sourceLocation?.pageNumber || 1 },
        sourceLocationNew: { section: noticeB.sourceLocation?.section, pageNumber: noticeB.sourceLocation?.pageNumber || 1 }
      });
    }

    const ipA = clausesA.find((c) => c.category === 'intellectual_property');
    const ipB = clausesB.find((c) => c.category === 'intellectual_property');
    if (!ipA && ipB) {
      differences.push({
        id: 'diff_3',
        category: 'obligations',
        changeType: 'added',
        title: 'New Intellectual Property Assignment Added in Version B',
        newText: ipB.originalText,
        whatChanged: 'Version B adds a explicit clause assigning all work product IP exclusively to the hiring entity.',
        whyItMayMatter: 'Ensures clarity on IP ownership, but limits your rights to reuse work materials.',
        severity: 'high',
        sourceLocationNew: { section: ipB.sourceLocation?.section, pageNumber: ipB.sourceLocation?.pageNumber || 1 }
      });
    }

    if (differences.length === 0) {
      differences.push({
        id: 'diff_gen',
        category: 'financial',
        changeType: 'modified',
        title: 'Payment & Fee Structure Adjustments',
        oldText: 'Standard net-30 payment terms.',
        newText: 'Net-15 payment terms with late payment penalties.',
        whatChanged: 'Payment due timeframe shortened from 30 days to 15 days.',
        whyItMayMatter: 'Requires faster invoice turnaround to avoid late fee penalties.',
        severity: 'medium'
      });
    }

    const nameA = docA.name || docA.filename || 'Document A';
    const nameB = docB.name || docB.filename || 'Document B';

    return {
      id: `comp_${Date.now()}`,
      docAId: docA.id,
      docBId: docB.id,
      docAName: nameA,
      docBName: nameB,
      comparedAt: new Date().toISOString(),
      overallSummary: `Compared ${nameA} against ${nameB}. Detected ${differences.length} structural differences across termination, IP, and payment terms.`,
      differences,
      highRiskCount: differences.filter((d) => d.severity === 'high').length
    };
  }
}

/* HELPER DETECTORS */

function extractLegalClausesFromText(doc: UploadedDocument): ClauseItem[] {
  const clauses: ClauseItem[] = [];
  const text = doc.rawText;
  const lower = text.toLowerCase();

  if (lower.includes('payment') || lower.includes('compensation') || lower.includes('fee')) {
    const snippet = findMatchingParagraph(text, ['payment', 'compensation', 'fee', 'salary', 'invoice']);
    clauses.push({
      id: 'c_pay',
      category: 'payment',
      title: 'Payment & Compensation Terms',
      originalText: snippet.text,
      originalTextSnippet: snippet.text,
      plainLanguage: 'Outlines how much, when, and by what method payments will be disbursed or collected.',
      plainLanguageExplanation: 'Outlines how much, when, and by what method payments will be disbursed or collected.',
      whyItMatters: 'Governs your cash flow, payment timelines, and consequences for overdue balances.',
      potentialConcern: lower.includes('penalty') || lower.includes('late fee') ? 'Includes late payment penalty provisions.' : 'Standard payment schedule.',
      sourceLocation: { pageNumber: snippet.page, section: 'Payment Terms', startChar: snippet.start, endChar: snippet.end },
      confidence: 'High',
      confidenceScore: 0.95,
      status: 'Detected'
    });
  }

  if (lower.includes('terminate') || lower.includes('cancellation') || lower.includes('notice')) {
    const snippet = findMatchingParagraph(text, ['terminate', 'cancellation', 'notice period', 'written notice']);
    clauses.push({
      id: 'c_term',
      category: 'termination',
      title: 'Termination & Notice Requirements',
      originalText: snippet.text,
      originalTextSnippet: snippet.text,
      plainLanguage: 'Explains how either party can cancel or end the contract, and how much advance notice must be given.',
      plainLanguageExplanation: 'Explains how either party can cancel or end the contract, and how much advance notice must be given.',
      whyItMatters: 'Determines how easily you can exit the relationship if conditions change.',
      potentialConcern: lower.includes('immediate termination') || lower.includes('without cause')
        ? 'Party may terminate immediately or without cause under certain conditions.'
        : 'Requires formal written notice prior to termination.',
      sourceLocation: { pageNumber: snippet.page, section: 'Termination Clause', startChar: snippet.start, endChar: snippet.end },
      confidence: 'High',
      confidenceScore: 0.92,
      status: 'Requires Review'
    });
  }

  if (lower.includes('automatic renewal') || lower.includes('automatically renew') || lower.includes('successive terms')) {
    const snippet = findMatchingParagraph(text, ['automatic renewal', 'automatically renew', 'renew']);
    clauses.push({
      id: 'c_renew',
      category: 'automatic_renewal',
      title: 'Automatic Renewal Provision',
      originalText: snippet.text,
      originalTextSnippet: snippet.text,
      plainLanguage: 'The agreement automatically extends for additional term periods unless written opt-out notice is provided in advance.',
      plainLanguageExplanation: 'The agreement automatically extends for additional term periods unless written opt-out notice is provided in advance.',
      whyItMatters: 'You could be locked into paying for another full term if you miss the cancellation notice window.',
      potentialConcern: 'Requires strict calendar reminder for cancellation notice deadline.',
      sourceLocation: { pageNumber: snippet.page, section: 'Renewal Terms', startChar: snippet.start, endChar: snippet.end },
      confidence: 'High',
      confidenceScore: 0.9,
      status: 'Requires Review'
    });
  }

  if (lower.includes('confidential') || lower.includes('non-disclosure') || lower.includes('proprietary')) {
    const snippet = findMatchingParagraph(text, ['confidential', 'proprietary', 'trade secret']);
    clauses.push({
      id: 'c_conf',
      category: 'confidentiality',
      title: 'Confidentiality & Non-Disclosure',
      originalText: snippet.text,
      originalTextSnippet: snippet.text,
      plainLanguage: 'Requires keeping shared business information, technical secrets, and trade data strictly private.',
      plainLanguageExplanation: 'Requires keeping shared business information, technical secrets, and trade data strictly private.',
      whyItMatters: 'Protects proprietary secrets but imposes legal liability if sensitive information is leaked.',
      potentialConcern: lower.includes('perpetual') ? 'Confidentiality obligations survive indefinitely.' : 'Standard non-disclosure obligations.',
      sourceLocation: { pageNumber: snippet.page, section: 'Confidentiality', startChar: snippet.start, endChar: snippet.end },
      confidence: 'High',
      confidenceScore: 0.94,
      status: 'Detected'
    });
  }

  if (lower.includes('intellectual property') || lower.includes('work for hire') || lower.includes('copyright') || lower.includes('invention')) {
    const snippet = findMatchingParagraph(text, ['intellectual property', 'work for hire', 'copyright', 'ownership', 'assigns']);
    clauses.push({
      id: 'c_ip',
      category: 'intellectual_property',
      title: 'Intellectual Property Ownership',
      originalText: snippet.text,
      originalTextSnippet: snippet.text,
      plainLanguage: 'Specifies who owns inventions, designs, code, documents, or branding created during the engagement.',
      plainLanguageExplanation: 'Specifies who owns inventions, designs, code, documents, or branding created during the engagement.',
      whyItMatters: 'Ensures clarity over product rights and prevents future ownership disputes.',
      potentialConcern: 'Assigns all created work product exclusively to the hiring entity.',
      sourceLocation: { pageNumber: snippet.page, section: 'IP Rights', startChar: snippet.start, endChar: snippet.end },
      confidence: 'High',
      confidenceScore: 0.96,
      status: 'Detected'
    });
  }

  if (lower.includes('limitation of liability') || lower.includes('indemnify') || lower.includes('hold harmless')) {
    const snippet = findMatchingParagraph(text, ['liability', 'indemnify', 'hold harmless', 'damages']);
    clauses.push({
      id: 'c_liab',
      category: 'liability',
      title: 'Limitation of Liability & Indemnification',
      originalText: snippet.text,
      originalTextSnippet: snippet.text,
      plainLanguage: 'Caps financial damages either party can claim and defines who pays for legal expenses if sued by a third party.',
      plainLanguageExplanation: 'Caps financial damages either party can claim and defines who pays for legal expenses if sued by a third party.',
      whyItMatters: 'Controls maximum legal and financial exposure in case of disputes or performance failures.',
      potentialConcern: lower.includes('uncapped') || lower.includes('sole liability') ? 'Indemnification obligations may be uncapped.' : 'Standard liability limits.',
      sourceLocation: { pageNumber: snippet.page, section: 'Liability & Indemnity', startChar: snippet.start, endChar: snippet.end },
      confidence: 'High',
      confidenceScore: 0.91,
      status: 'Requires Review'
    });
  }

  if (lower.includes('non-compete') || lower.includes('solicit') || lower.includes('restrictive covenant')) {
    const snippet = findMatchingParagraph(text, ['non-compete', 'solicit', 'compete', 'restrictive']);
    clauses.push({
      id: 'c_noncomp',
      category: 'non_compete',
      title: 'Non-Compete & Non-Solicitation Restriction',
      originalText: snippet.text,
      originalTextSnippet: snippet.text,
      plainLanguage: 'Restricts working for competing businesses or recruiting clients/employees for a period after leaving.',
      plainLanguageExplanation: 'Restricts working for competing businesses or recruiting clients/employees for a period after leaving.',
      whyItMatters: 'Directly impacts your future career, job options, and business operations post-termination.',
      potentialConcern: 'Restricts post-contract employment in specified geographic regions or industries.',
      sourceLocation: { pageNumber: snippet.page, section: 'Restrictive Covenants', startChar: snippet.start, endChar: snippet.end },
      confidence: 'High',
      confidenceScore: 0.93,
      status: 'Requires Review'
    });
  }

  if (clauses.length === 0) {
    clauses.push({
      id: 'c_gen',
      category: 'general',
      title: 'General Agreement Terms',
      originalText: doc.rawText.substring(0, 300) + '...',
      originalTextSnippet: doc.rawText.substring(0, 300) + '...',
      plainLanguage: 'Standard general contract agreement provisions.',
      plainLanguageExplanation: 'Standard general contract agreement provisions.',
      whyItMatters: 'Establishes basic rights and legal relationships.',
      potentialConcern: 'Requires full review of custom provisions.',
      sourceLocation: { pageNumber: 1, section: 'General', startChar: 0, endChar: 300 },
      confidence: 'Medium',
      confidenceScore: 0.75,
      status: 'Standard'
    });
  }

  return clauses;
}

function extractObligationsFromText(doc: UploadedDocument, clauses: ClauseItem[]): LegalObligationItem[] {
  const obligations: LegalObligationItem[] = [];
  const text = doc.rawText;
  const lower = text.toLowerCase();

  // 1. Payment Obligation
  const payClause = clauses.find((c) => c.category === 'payment');
  if (payClause || lower.includes('payment') || lower.includes('fee')) {
    const snippet = payClause?.originalTextSnippet || findMatchingParagraph(text, ['payment', 'compensation', 'fee', 'invoice']).text;
    obligations.push({
      id: 'ob_pay',
      party: 'Client / Paying Party',
      obligation: 'Disburse full contract fees and invoiced compensation according to the agreed billing terms.',
      deadline: lower.includes('net 30') || lower.includes('net-30') ? 'Within thirty (30) days of invoice receipt' : 'As set forth in the payment schedule',
      consequence: 'Late payment penalty interest and potential suspension of deliverable access or services.',
      evidence: snippet,
      sourceLocation: {
        pageNumber: payClause?.sourceLocation?.pageNumber || 1,
        section: payClause?.sourceLocation?.section || 'Payment Terms',
        startChar: payClause?.sourceLocation?.startChar,
        endChar: payClause?.sourceLocation?.endChar
      },
      severity: 'medium'
    });
  }

  // 2. Confidentiality Obligation
  const confClause = clauses.find((c) => c.category === 'confidentiality');
  if (confClause || lower.includes('confidential')) {
    const snippet = confClause?.originalTextSnippet || findMatchingParagraph(text, ['confidential', 'proprietary', 'trade secret']).text;
    obligations.push({
      id: 'ob_conf',
      party: 'Receiving Party',
      obligation: 'Maintain strict confidentiality of proprietary technical, business, and client information, preventing unauthorized disclosure.',
      deadline: 'Active during contract term and surviving post-termination (2-5 years or indefinite).',
      consequence: 'Immediate injunctive relief without bond, plus monetary damages for breach.',
      evidence: snippet,
      sourceLocation: {
        pageNumber: confClause?.sourceLocation?.pageNumber || 1,
        section: confClause?.sourceLocation?.section || 'Confidentiality',
        startChar: confClause?.sourceLocation?.startChar,
        endChar: confClause?.sourceLocation?.endChar
      },
      severity: 'high'
    });
  }

  // 3. Termination Notice Obligation
  const termClause = clauses.find((c) => c.category === 'termination' || c.category === 'automatic_renewal');
  if (termClause || lower.includes('terminate') || lower.includes('notice')) {
    const snippet = termClause?.originalTextSnippet || findMatchingParagraph(text, ['notice', 'terminate', 'written notice']).text;
    obligations.push({
      id: 'ob_term',
      party: 'Party Seeking Termination',
      obligation: 'Deliver formal written notice of intent to terminate or opt out of successive renewal terms.',
      deadline: lower.includes('60 days') ? 'At least sixty (60) days prior to term expiration' : 'Within the mandatory advance notice window (typically 30-60 days)',
      consequence: 'Contract automatically renews for an additional term, locking in continuous payment liabilities.',
      evidence: snippet,
      sourceLocation: {
        pageNumber: termClause?.sourceLocation?.pageNumber || 1,
        section: termClause?.sourceLocation?.section || 'Termination & Renewal',
        startChar: termClause?.sourceLocation?.startChar,
        endChar: termClause?.sourceLocation?.endChar
      },
      severity: 'high'
    });
  }

  // 4. IP Assignment Obligation
  const ipClause = clauses.find((c) => c.category === 'intellectual_property');
  if (ipClause || lower.includes('intellectual property') || lower.includes('work for hire')) {
    const snippet = ipClause?.originalTextSnippet || findMatchingParagraph(text, ['intellectual property', 'ownership', 'assigns']).text;
    obligations.push({
      id: 'ob_ip',
      party: 'Creator / Contractor / Employee',
      obligation: 'Irrevocably transfer and assign all copyright, patent, and work product rights to the hiring entity.',
      deadline: 'Immediately upon creation and delivery of any work product.',
      consequence: 'Total forfeiture of ownership rights; inability to reuse materials in subsequent commercial engagements.',
      evidence: snippet,
      sourceLocation: {
        pageNumber: ipClause?.sourceLocation?.pageNumber || 1,
        section: ipClause?.sourceLocation?.section || 'Intellectual Property',
        startChar: ipClause?.sourceLocation?.startChar,
        endChar: ipClause?.sourceLocation?.endChar
      },
      severity: 'high'
    });
  }

  // 5. Non-Compete & Non-Solicit Obligation
  const nonCompClause = clauses.find((c) => c.category === 'non_compete');
  if (nonCompClause || lower.includes('non-compete') || lower.includes('solicit')) {
    const snippet = nonCompClause?.originalTextSnippet || findMatchingParagraph(text, ['non-compete', 'solicit', 'competing']).text;
    obligations.push({
      id: 'ob_noncomp',
      party: 'Departing Personnel / Contractor',
      obligation: 'Refrain from engaging in competing business activities or soliciting active clients, partners, or personnel.',
      deadline: 'Throughout the term and continuing for 12 to 24 months following contract termination.',
      consequence: 'Legal action for breach of restrictive covenants, court injunctions, and forfeiture of compensation.',
      evidence: snippet,
      sourceLocation: {
        pageNumber: nonCompClause?.sourceLocation?.pageNumber || 1,
        section: nonCompClause?.sourceLocation?.section || 'Restrictive Covenants',
        startChar: nonCompClause?.sourceLocation?.startChar,
        endChar: nonCompClause?.sourceLocation?.endChar
      },
      severity: 'high'
    });
  }

  return obligations;
}

function detectInconsistencies(doc: UploadedDocument, clauses: ClauseItem[]): LegalInconsistencyItem[] {
  const inconsistencies: LegalInconsistencyItem[] = [];
  const text = doc.rawText;
  const lower = text.toLowerCase();

  // Contradiction 1: Advance Notice vs Immediate Termination
  if ((lower.includes('notice') && (lower.includes('30 days') || lower.includes('60 days'))) &&
      (lower.includes('immediate') || lower.includes('without cause') || lower.includes('sole discretion'))) {
    inconsistencies.push({
      id: 'inc_1',
      title: 'Advance Notice Requirement vs Immediate Termination Rights',
      description: 'The agreement outlines a mandatory written notice timeline (e.g., 30-60 days), but also contains language permitting immediate termination or cancellation without cause.',
      clauseA: {
        title: 'Advance Notice Clause',
        text: findMatchingParagraph(text, ['written notice', 'notice period', 'advance notice']).text.substring(0, 200),
        section: 'Termination Terms'
      },
      clauseB: {
        title: 'Immediate Termination Rights',
        text: findMatchingParagraph(text, ['immediate', 'without cause', 'sole discretion']).text.substring(0, 200),
        section: 'Discretionary Rights'
      },
      whyItMatters: 'Ambiguity over whether you are guaranteed the transition notice window or if the counterparty can cancel abruptly with zero lead time.',
      recommendation: 'Ask counsel to negotiate a definitive clause establishing that immediate termination applies exclusively to uncured material breach.',
      severity: 'high'
    });
  }

  // Contradiction 2: Fixed Term Duration vs Indefinite / Perpetual Covenants
  if ((lower.includes('term of') || lower.includes('one year') || lower.includes('two years')) &&
      (lower.includes('perpetual') || lower.includes('in perpetuity') || lower.includes('survive indefinitely'))) {
    inconsistencies.push({
      id: 'inc_2',
      title: 'Fixed Contract Duration vs Perpetual Post-Termination Covenants',
      description: 'While the agreement has a defined operational term, restrictive confidentiality or non-solicitation covenants are stipulated to survive in perpetuity without a sunset date.',
      clauseA: {
        title: 'Term & Duration',
        text: findMatchingParagraph(text, ['term of', 'effective date', 'expiration']).text.substring(0, 200),
        section: 'Agreement Term'
      },
      clauseB: {
        title: 'Perpetual Survival Provision',
        text: findMatchingParagraph(text, ['perpetual', 'survive indefinitely', 'in perpetuity']).text.substring(0, 200),
        section: 'Survival Terms'
      },
      whyItMatters: 'Extends compliance liability indefinitely even decades after business disengagement, exposing you to unforeseen future legal disputes.',
      recommendation: 'Propose inserting a standard 2 to 3-year sunset limitation on non-disclosure and restrictive covenants.',
      severity: 'medium'
    });
  }

  // Contradiction 3: Mutual Intent vs Unilateral Indemnification
  const liabClause = clauses.find((c) => c.category === 'liability');
  if (liabClause && (lower.includes('sole liability') || lower.includes('indemnify, defend and hold harmless')) && !lower.includes('mutual indemnif')) {
    inconsistencies.push({
      id: 'inc_3',
      title: 'Asymmetrical Indemnification Burden',
      description: 'The agreement recitals express a mutual partnership, but the indemnification and liability shield is strictly one-sided against you.',
      clauseA: {
        title: 'General Partnership Recitals',
        text: text.substring(0, 200),
        section: 'Preamble / Recitals'
      },
      clauseB: {
        title: 'Unilateral Indemnification',
        text: liabClause.originalTextSnippet || liabClause.originalText || '',
        section: liabClause.sourceLocation?.section || 'Liability'
      },
      whyItMatters: 'You assume total third-party legal liability without receiving reciprocal protection if the counterparty causes a breach.',
      recommendation: 'Request mutual indemnification and a reciprocal liability ceiling tied to annual fees paid.',
      severity: 'high'
    });
  }

  return inconsistencies;
}

function generatePlainSummary(doc: UploadedDocument, clauses: ClauseItem[], risks: RiskItem[]): any {
  const lower = doc.rawText.toLowerCase();

  let docType = 'Legal Agreement';
  if (lower.includes('employment') || lower.includes('employee')) docType = 'Employment Agreement';
  else if (lower.includes('non-disclosure') || lower.includes('nda')) docType = 'Non-Disclosure Agreement (NDA)';
  else if (lower.includes('terms of service') || lower.includes('saas')) docType = 'SaaS Terms of Service';
  else if (lower.includes('lease') || lower.includes('tenant')) docType = 'Lease Agreement';
  else if (lower.includes('consulting') || lower.includes('contractor')) docType = 'Independent Contractor Agreement';

  const parties = extractParties(doc.rawText);
  const effectiveDate = extractEffectiveDate(doc.rawText);
  const duration = extractDuration(doc.rawText);

  const keyObligations = clauses.map((c) => c.title || c.category);
  const keyDeadlines = clauses
    .filter((c) => c.category === 'notice_periods' || c.category === 'payment' || c.category === 'automatic_renewal')
    .map((c) => `${c.title || c.category}: ${c.potentialConcern || 'Deadline rule'}`);

  const notableRisks = risks.map((r) => `${r.title} (${r.level.toUpperCase()} ATTENTION)`);

  const missingInformation: string[] = [];
  if (effectiveDate === 'Not established in this document.') missingInformation.push('Explicit effective start date');
  if (duration === 'Not established in this document.') missingInformation.push('Defined contract duration or expiration date');

  return {
    quickSummary: `This ${docType} outlines contractual obligations between the participating parties. Key terms include ${clauses.slice(0, 3).map((c) => (c.title || c.category).toLowerCase()).join(', ')}. ${risks.length} key attention areas were flagged for review.`,
    detailedSummary: `This document appears to be a ${docType}. It establishes binding terms governing rights, obligations, dispute resolution, and operational scope. Users should carefully review flagged provisions regarding ${risks.map((r) => r.title).join(' and ')}.`,
    documentType: docType,
    apparentPurpose: `To establish formal legal relationship and operational parameters for ${docType.toLowerCase()}.`,
    partiesInvolved: parties.length > 0 ? parties : ['Not established in this document.'],
    effectiveDate,
    duration,
    terminationSummary: clauses.find((c) => c.category === 'termination')?.plainLanguage || 'Not established in this document.',
    keyObligations,
    importantDeadlines: keyDeadlines.length > 0 ? keyDeadlines : ['Not established in this document.'],
    keyDeadlines: keyDeadlines.length > 0 ? keyDeadlines : ['Not established in this document.'],
    notableRisks,
    unestablishedInformation: missingInformation.length > 0 ? missingInformation : ['None explicitly identified missing.'],
    missingInformation: missingInformation.length > 0 ? missingInformation : ['None explicitly identified missing.']
  };
}

function evaluateRisksFromClauses(clauses: ClauseItem[], doc: UploadedDocument): RiskItem[] {
  const risks: RiskItem[] = [];

  for (const clause of clauses) {
    if (clause.category === 'automatic_renewal') {
      const evidence = clause.originalTextSnippet || clause.originalText;
      risks.push({
        id: 'risk_auto_renew',
        title: 'Automatic Renewal Notice Window Risk',
        level: 'high',
        severity: 'high',
        category: 'Termination & Fees',
        explanation: 'Agreement automatically renews for successive terms unless written notice is given within the specified window.',
        evidenceSnippet: evidence,
        evidenceText: evidence,
        whatDocumentSays: evidence,
        whyItMatters: 'A missed cancellation notice deadline locks you into recurring fee obligations for another full contract term with no early exit.',
        whatToConsider: 'Calendar a reminder 30 days before the notice deadline and request written confirmation of the exact opt-out method.',
        source: {
          section: clause.sourceLocation?.section || 'Renewal Terms',
          pageNumber: clause.sourceLocation?.pageNumber || 1,
          startChar: clause.sourceLocation?.startChar,
          endChar: clause.sourceLocation?.endChar
        },
        sourceLocation: { pageNumber: clause.sourceLocation?.pageNumber || 1, section: clause.sourceLocation?.section },
        reasonForFlagging: 'Potential recurring financial obligation if cancellation notice deadline is missed.',
        suggestedQuestion: 'What is the exact deadline for sending cancellation notice, and via what communication channel?',
        suggestedAction: 'Consider asking: What is the exact deadline for sending cancellation notice, and via what communication channel?'
      });
    }

    if (clause.category === 'non_compete') {
      const evidence = clause.originalTextSnippet || clause.originalText;
      risks.push({
        id: 'risk_non_compete',
        title: 'Post-Contract Restrictive Covenant',
        level: 'high',
        severity: 'high',
        category: 'Career & Competition',
        explanation: 'Restricts performing similar work or soliciting clients for a specified period after contract end.',
        evidenceSnippet: evidence,
        evidenceText: evidence,
        whatDocumentSays: evidence,
        whyItMatters: 'Directly limits your ability to earn a living, take new jobs, or serve clients in your specialized field after separation.',
        whatToConsider: 'Ask whether the geographic territory can be restricted to immediate local competitors and the duration shortened to 6-12 months.',
        source: {
          section: clause.sourceLocation?.section || 'Restrictive Covenants',
          pageNumber: clause.sourceLocation?.pageNumber || 1,
          startChar: clause.sourceLocation?.startChar,
          endChar: clause.sourceLocation?.endChar
        },
        sourceLocation: { pageNumber: clause.sourceLocation?.pageNumber || 1, section: clause.sourceLocation?.section },
        reasonForFlagging: 'May limit future employment or business options after termination.',
        suggestedQuestion: 'Can the non-compete duration or geographic scope be narrowed?',
        suggestedAction: 'Consider asking: Can the non-compete duration or geographic scope be narrowed?'
      });
    }

    if (clause.category === 'liability') {
      const evidence = clause.originalTextSnippet || clause.originalText;
      const isUncapped = clause.potentialConcern?.includes('uncapped') || clause.potentialConcern?.includes('sole') || doc.rawText.toLowerCase().includes('indemnif');
      risks.push({
        id: 'risk_liability',
        title: isUncapped ? 'Broad Uncapped Indemnification Burden' : 'Liability Limitation Scope',
        level: isUncapped ? 'high' : 'medium',
        severity: isUncapped ? 'high' : 'medium',
        category: 'Financial Exposure',
        explanation: 'Indemnification clause may expose you to third-party legal costs without a clear liability cap.',
        evidenceSnippet: evidence,
        evidenceText: evidence,
        whatDocumentSays: evidence,
        whyItMatters: 'Exposes your business or personal finances to third-party litigation costs and settlements without a defined monetary ceiling.',
        whatToConsider: 'Insist on a mutual liability cap tied to total fees paid under the contract over the preceding 12 months.',
        source: {
          section: clause.sourceLocation?.section || 'Liability & Indemnity',
          pageNumber: clause.sourceLocation?.pageNumber || 1,
          startChar: clause.sourceLocation?.startChar,
          endChar: clause.sourceLocation?.endChar
        },
        sourceLocation: { pageNumber: clause.sourceLocation?.pageNumber || 1, section: clause.sourceLocation?.section },
        reasonForFlagging: 'Uncapped financial liability in legal proceedings.',
        suggestedQuestion: 'Can we insert a mutual liability cap tied to total contract fees paid?',
        suggestedAction: 'Consider asking: Can we insert a mutual liability cap tied to total contract fees paid?'
      });
    }

    if (clause.category === 'termination' && (clause.potentialConcern?.includes('immediate') || doc.rawText.toLowerCase().includes('convenience'))) {
      const evidence = clause.originalTextSnippet || clause.originalText;
      risks.push({
        id: 'risk_term_immediate',
        title: 'Asymmetrical Termination for Convenience',
        level: 'medium',
        severity: 'medium',
        category: 'Contract Duration',
        explanation: 'Allows termination without extended notice period under specific circumstances.',
        evidenceSnippet: evidence,
        evidenceText: evidence,
        whatDocumentSays: evidence,
        whyItMatters: 'Sudden termination can disrupt project cash flow, client continuity, and ongoing business operations with minimal warning.',
        whatToConsider: 'Request that termination without cause requires at least 30 to 60 days advance written notice for both parties.',
        source: {
          section: clause.sourceLocation?.section || 'Termination',
          pageNumber: clause.sourceLocation?.pageNumber || 1,
          startChar: clause.sourceLocation?.startChar,
          endChar: clause.sourceLocation?.endChar
        },
        sourceLocation: { pageNumber: clause.sourceLocation?.pageNumber || 1, section: clause.sourceLocation?.section },
        reasonForFlagging: 'Contract could end suddenly with limited transition time.',
        suggestedQuestion: 'What notice period is required for convenience vs default?',
        suggestedAction: 'Consider asking: What notice period is required for convenience vs default?'
      });
    }
  }

  if (risks.length === 0) {
    const snippet = doc.rawText.substring(0, 200);
    risks.push({
      id: 'risk_std',
      title: 'Standard Legal Review Recommendation',
      level: 'low',
      severity: 'low',
      category: 'General Governance',
      explanation: 'No high-attention unusual clauses detected in standard pattern scans.',
      evidenceSnippet: snippet,
      evidenceText: snippet,
      whatDocumentSays: snippet,
      whyItMatters: 'Even routine contracts contain binding commitments that affect financial and operational standing.',
      whatToConsider: 'Confirm key payment due dates, dispute resolution venue, and signature authorities before executing.',
      source: { pageNumber: 1, section: 'Agreement Overview' },
      sourceLocation: { pageNumber: 1, section: 'Overview' },
      reasonForFlagging: 'Routine verification recommended before final signature.',
      suggestedQuestion: 'Consider reviewing payment due dates and dispute resolution venue.',
      suggestedAction: 'Consider reviewing payment due dates and dispute resolution venue.'
    });
  }

  return risks;
}

function generateChecklistItems(
  clauses: ClauseItem[],
  risks: RiskItem[],
  obligations: LegalObligationItem[]
): ChecklistItem[] {
  const items: ChecklistItem[] = [];

  // Stage 1: Review
  items.push({
    id: 'chk_rev_1',
    category: 'Review',
    actionType: 'Review',
    itemText: 'Review Full Payment Schedule & Invoicing Currencies',
    label: 'Review Full Payment Schedule & Invoicing Currencies',
    description: 'Verify exact compensation, milestone triggers, invoice payment terms (e.g. Net-30), and late fee penalties.',
    importance: 'high',
    isChecked: false,
    linkedFinding: obligations.find((o) => o.id === 'ob_pay')?.obligation || 'Payment obligations in contract'
  });

  items.push({
    id: 'chk_rev_2',
    category: 'Review',
    actionType: 'Review',
    itemText: 'Review Stated Governing Law & Dispute Resolution Venue',
    label: 'Review Stated Governing Law & Dispute Resolution Venue',
    description: 'Confirm the legal jurisdiction and whether disputes require mandatory binding arbitration.',
    importance: 'medium',
    isChecked: false,
    linkedFinding: clauses.find((c) => c.category === 'governing_law')?.title || 'Governing Law Provision'
  });

  // Stage 2: Clarify
  items.push({
    id: 'chk_cla_1',
    category: 'Clarify',
    actionType: 'Clarify',
    itemText: 'Clarify Termination Notice Method & Delivery Address',
    label: 'Clarify Termination Notice Method & Delivery Address',
    description: 'Establish whether cancellation notice requires certified mail, registered courier, or if email notification suffices.',
    importance: 'critical',
    isChecked: false,
    linkedFinding: obligations.find((o) => o.id === 'ob_term')?.deadline || 'Termination notice deadline'
  });

  items.push({
    id: 'chk_cla_2',
    category: 'Clarify',
    actionType: 'Clarify',
    itemText: 'Clarify Ownership of Pre-Existing Background IP & Tools',
    label: 'Clarify Ownership of Pre-Existing Background IP & Tools',
    description: 'Ensure existing frameworks, personal tools, and prior inventions are explicitly carved out from assignment.',
    importance: 'high',
    isChecked: false,
    linkedFinding: obligations.find((o) => o.id === 'ob_ip')?.obligation || 'Intellectual Property assignment'
  });

  // Stage 3: Negotiate
  items.push({
    id: 'chk_neg_1',
    category: 'Negotiate',
    actionType: 'Negotiate',
    itemText: 'Negotiate Mutual Cap on Indemnification & Liability',
    label: 'Negotiate Mutual Cap on Indemnification & Liability',
    description: 'Propose inserting a mutual liability ceiling equal to 12 months of paid contract fees to avoid uncapped exposure.',
    importance: 'critical',
    isChecked: false,
    linkedFinding: risks.find((r) => r.category === 'Financial Exposure')?.title || 'Liability exposure'
  });

  items.push({
    id: 'chk_neg_2',
    category: 'Negotiate',
    actionType: 'Negotiate',
    itemText: 'Negotiate Scope & Geographic Duration of Non-Compete',
    label: 'Negotiate Scope & Geographic Duration of Non-Compete',
    description: 'Narrow post-contract restrictive covenants to direct competitors within your immediate primary market.',
    importance: 'high',
    isChecked: false,
    linkedFinding: risks.find((r) => r.category === 'Career & Competition')?.title || 'Post-contract restrictions'
  });

  // Stage 4: Confirm
  items.push({
    id: 'chk_cnf_1',
    category: 'Confirm',
    actionType: 'Confirm',
    itemText: 'Confirm Calendar Alerts for Opt-Out Deadlines',
    label: 'Confirm Calendar Alerts for Opt-Out Deadlines',
    description: 'Set explicit calendar reminders 30 and 60 days before the automatic renewal deadline to prevent surprise rollover.',
    importance: 'critical',
    isChecked: false,
    linkedFinding: risks.find((r) => r.id === 'risk_auto_renew')?.title || 'Automatic renewal deadline'
  });

  // Stage 5: Ask a Lawyer
  items.push({
    id: 'chk_law_1',
    category: 'Ask a Lawyer',
    actionType: 'Ask a Lawyer',
    itemText: 'Consult Counsel on Enforceability of Restrictive Covenants',
    label: 'Consult Counsel on Enforceability of Restrictive Covenants',
    description: 'Have a licensed attorney review non-compete and non-solicitation language under local state or jurisdictional employment law.',
    importance: 'high',
    isChecked: false,
    linkedFinding: 'Applicable state law enforceability for post-termination restrictions'
  });

  items.push({
    id: 'chk_law_2',
    category: 'Ask a Lawyer',
    actionType: 'Ask a Lawyer',
    itemText: 'Seek Legal Opinion on Uncapped Third-Party Indemnity Risks',
    label: 'Seek Legal Opinion on Uncapped Third-Party Indemnity Risks',
    description: 'Review third-party claim defense clauses to ensure proper insurance coverage and risk allocation.',
    importance: 'high',
    isChecked: false,
    linkedFinding: 'Third-party indemnification scope and insurance alignment'
  });

  return items;
}

function generateLawyerBrief(
  doc: UploadedDocument,
  summary: any,
  clauses: ClauseItem[],
  risks: RiskItem[],
  obligations: LegalObligationItem[],
  inconsistencies: LegalInconsistencyItem[]
): LawyerBrief {
  const docTitle = doc.name || doc.filename || 'Legal Document';

  const questionsToAsk = [
    'What happens if formal notice of termination is delayed past the stated renewal window?',
    'Is the liability cap mutual, and does it sufficiently limit exposure under our business insurance?',
    'Are the post-termination non-compete covenants legally enforceable in our jurisdiction?',
    'How can we amend the intellectual property assignment clause to safeguard pre-existing background code and tools?',
    'Does the indemnification clause expose either party to uncapped third-party litigation costs?'
  ];

  const informationToBring = [
    'Fully executed copies of any prior contracts or addenda between the parties.',
    'Written email correspondence or proposals discussing negotiated rates, milestones, and deliverables.',
    'List of pre-existing proprietary tools, frameworks, or patents you intend to preserve.',
    'Summary of your current business scope and client relationships to evaluate non-compete overlap.',
    'Relevant professional liability or errors & omissions insurance policies.'
  ];

  const unresolvedQuestions = [
    summary.unestablishedInformation?.[0] || 'Clarification of exact effective commencement dates.',
    inconsistencies.length > 0 ? inconsistencies[0].title : 'Clarification of conflicting notice terms.',
    'Specific dispute resolution rules if non-binding mediation precedes formal litigation.'
  ];

  return {
    id: `brief_${doc.id}`,
    documentTitle: docTitle,
    generatedAt: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    executiveSummary: summary.quickSummary,
    overview: summary.quickSummary,
    keyObligations: obligations.map((o) => `${o.party}: ${o.obligation} (${o.deadline || 'Standard'})`),
    importantDates: summary.keyDeadlines,
    criticalRiskFactors: risks.map((r) => r.title),
    importantClauses: clauses.map((c) => `${c.title} — ${c.whyItMatters}`),
    potentialConcerns: risks.map((r) => ({
      title: r.title,
      description: r.whyItMatters || r.explanation,
      section: r.source?.section || r.sourceLocation?.section
    })),
    unclearAreas: summary.unestablishedInformation,
    recommendedNextSteps: [
      'Conduct formal legal review of liability and indemnification ceilings.',
      'Clarify notice periods and delivery channels for termination.',
      'Review non-compete geographic bounds with a local employment attorney.'
    ],
    recommendedQuestions: questionsToAsk,
    questionsToAsk,
    informationToBring,
    unresolvedQuestions,
    flaggedClausesCount: risks.length
  };
}

function generateGroundedAnswerText(question: string, chunkText: string, _fullText: string): string {
  const qLower = question.toLowerCase();
  const chunkLower = chunkText.toLowerCase();

  if (qLower.includes('notice') || qLower.includes('terminate') || qLower.includes('cancel')) {
    if (chunkLower.includes('notice')) {
      return `Based on the provided document, termination requires advance written notice as specified in the termination section. (See Section/Page Citation).`;
    }
    return `The agreement provides specific cancellation rights and notice rules. Please review the highlighted source clause for exact notice days required.`;
  }

  if (qLower.includes('pay') || qLower.includes('fee') || qLower.includes('money')) {
    return `According to the payment provisions in the document, compensation and payment obligations are outlined in detail in the highlighted section.`;
  }

  if (qLower.includes('renew') || qLower.includes('automatic')) {
    return `The document contains terms regarding agreement renewal. Please review the highlighted source text for automatic renewal parameters.`;
  }

  return `Based on the document text: "${chunkText.substring(0, 160)}..." (Refer to cited page/section).`;
}

function findMatchingParagraph(fullText: string, keywords: string[]): { text: string; page: number; start: number; end: number } {
  const paragraphs = fullText.split(/\n\s*\n/);
  let offset = 0;

  for (let i = 0; i < paragraphs.length; i++) {
    const p = paragraphs[i];
    const pLower = p.toLowerCase();
    const start = offset;
    const end = offset + p.length;
    offset += p.length + 2;

    if (keywords.some((k) => pLower.includes(k))) {
      const page = Math.max(1, Math.ceil(start / 1500));
      return { text: p.trim(), page, start, end };
    }
  }

  return { text: fullText.substring(0, 250) + '...', page: 1, start: 0, end: 250 };
}

function extractParties(text: string): string[] {
  const match = text.match(/by and between\s+([^,]+),?\s+and\s+([^,\.\n]+)/i);
  if (match) {
    return [match[1].trim(), match[2].trim()];
  }
  return ['Not established in this document.'];
}

function extractEffectiveDate(text: string): string {
  const match = text.match(/effective (as of\s+)?([A-Z][a-z]+\s+\d{1,2},\s+\d{4}|\d{1,2}\/\d{1,2}\/\d{4})/i);
  if (match) {
    return match[2];
  }
  return 'Not established in this document.';
}

function extractDuration(text: string): string {
  const match = text.match(/(term of\s+)?(\d+\s+(years|months)|one year|two years)/i);
  if (match) {
    return match[0];
  }
  return 'Not established in this document.';
}

function extractGoverningLaw(text: string): string {
  const match = text.match(/governed by (the laws of\s+)?([A-Za-z\s]+)/i);
  if (match) {
    return match[2].split('.')[0].trim();
  }
  return 'Not established in this document.';
}
