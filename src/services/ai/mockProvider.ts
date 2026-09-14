import { AIProvider } from './provider';
import { UploadedDocument } from '../../types/document';
import { DocumentAnalysis } from '../../types/analysis';
import { QAPair, Citation } from '../../types/qa';
import { ComparisonResult, DifferenceItem } from '../../types/comparison';
import { ClauseItem } from '../../types/clause';
import { RiskItem } from '../../types/risk';
import { ChecklistItem } from '../../types/checklist';
import { LawyerBrief } from '../../types/lawyerBrief';
import { InMemoryVectorStore } from '../document/vectorStore';

export class MockAIProvider implements AIProvider {
  name = 'KannunAI Local Deterministic Legal Analysis Engine';

  async analyzeDocument(doc: UploadedDocument): Promise<DocumentAnalysis> {
    // 1. Detect Clauses across categories
    const clauses = extractLegalClausesFromText(doc);

    // 2. Detect Risks
    const risks = evaluateRisksFromClauses(clauses, doc);

    // 3. Generate Plain Language Summary
    const summary = generatePlainSummary(doc, clauses, risks);

    // 4. Generate Pre-Signing Checklist
    const checklist = generateChecklistItems(clauses, risks);

    // 5. Generate Lawyer Prep Brief
    const lawyerBrief = generateLawyerBrief(doc, summary, clauses, risks);

    const highRiskCount = risks.filter((r) => r.level === 'high' || r.level === 'critical').length;
    const mediumRiskCount = risks.filter((r) => r.level === 'medium').length;
    const overallRiskScore = Math.min(100, highRiskCount * 25 + mediumRiskCount * 10 + 15);

    return {
      id: `analysis_${doc.id}`,
      documentId: doc.id,
      analyzedAt: new Date().toISOString(),
      overallRiskScore,
      summary,
      clauses,
      risks,
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
  }

  async answerQuestion(
    doc: UploadedDocument,
    question: string,
    _history: QAPair[]
  ): Promise<QAPair> {
    const vectorStore = new InMemoryVectorStore(doc.chunks || []);
    const searchResults = vectorStore.search(question, 3);

    if (searchResults.length === 0 || searchResults[0].score < 0.1) {
      return {
        id: `qa_${Date.now()}`,
        question,
        answer: 'Not established in this document.',
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

function evaluateRisksFromClauses(clauses: ClauseItem[], doc: UploadedDocument): RiskItem[] {
  const risks: RiskItem[] = [];

  for (const clause of clauses) {
    if (clause.category === 'automatic_renewal') {
      risks.push({
        id: 'risk_auto_renew',
        title: 'Automatic Renewal Notice Window Risk',
        level: 'high',
        severity: 'high',
        category: 'Termination & Fees',
        explanation: 'Agreement automatically renews for successive terms unless written notice is given within the specified window.',
        evidenceSnippet: clause.originalTextSnippet || clause.originalText,
        evidenceText: clause.originalTextSnippet || clause.originalText,
        sourceLocation: { pageNumber: clause.sourceLocation?.pageNumber || 1, section: clause.sourceLocation?.section },
        reasonForFlagging: 'Potential recurring financial obligation if cancellation notice deadline is missed.',
        suggestedQuestion: 'What is the exact deadline for sending cancellation notice, and via what communication channel?',
        suggestedAction: 'Consider asking: What is the exact deadline for sending cancellation notice, and via what communication channel?'
      });
    }

    if (clause.category === 'non_compete') {
      risks.push({
        id: 'risk_non_compete',
        title: 'Post-Contract Restrictive Covenant',
        level: 'high',
        severity: 'high',
        category: 'Career & Competition',
        explanation: 'Restricts performing similar work or soliciting clients for a specified period after contract end.',
        evidenceSnippet: clause.originalTextSnippet || clause.originalText,
        evidenceText: clause.originalTextSnippet || clause.originalText,
        sourceLocation: { pageNumber: clause.sourceLocation?.pageNumber || 1, section: clause.sourceLocation?.section },
        reasonForFlagging: 'May limit future employment or business options after termination.',
        suggestedQuestion: 'Can the non-compete duration or geographic scope be narrowed?',
        suggestedAction: 'Consider asking: Can the non-compete duration or geographic scope be narrowed?'
      });
    }

    if (clause.category === 'liability' && (clause.potentialConcern?.includes('uncapped') || clause.potentialConcern?.includes('sole'))) {
      risks.push({
        id: 'risk_liability',
        title: 'Broad Uncapped Indemnification Burden',
        level: 'high',
        severity: 'high',
        category: 'Financial Exposure',
        explanation: 'Indemnification clause may expose you to third-party legal costs without a clear liability cap.',
        evidenceSnippet: clause.originalTextSnippet || clause.originalText,
        evidenceText: clause.originalTextSnippet || clause.originalText,
        sourceLocation: { pageNumber: clause.sourceLocation?.pageNumber || 1, section: clause.sourceLocation?.section },
        reasonForFlagging: 'Uncapped financial liability in legal proceedings.',
        suggestedQuestion: 'Can we insert a mutual liability cap tied to total contract fees paid?',
        suggestedAction: 'Consider asking: Can we insert a mutual liability cap tied to total contract fees paid?'
      });
    }

    if (clause.category === 'termination' && clause.potentialConcern?.includes('immediate')) {
      risks.push({
        id: 'risk_term_immediate',
        title: 'Immediate Termination Rights',
        level: 'medium',
        severity: 'medium',
        category: 'Contract Duration',
        explanation: 'Allows termination without extended notice period under specific circumstances.',
        evidenceSnippet: clause.originalTextSnippet || clause.originalText,
        evidenceText: clause.originalTextSnippet || clause.originalText,
        sourceLocation: { pageNumber: clause.sourceLocation?.pageNumber || 1, section: clause.sourceLocation?.section },
        reasonForFlagging: 'Contract could end suddenly with limited transition time.',
        suggestedQuestion: 'What notice period is required for convenience vs default?',
        suggestedAction: 'Consider asking: What notice period is required for convenience vs default?'
      });
    }
  }

  if (risks.length === 0) {
    risks.push({
      id: 'risk_std',
      title: 'Standard Legal Review Recommendation',
      level: 'low',
      severity: 'low',
      category: 'General Governance',
      explanation: 'No high-attention unusual clauses detected in standard pattern scans.',
      evidenceSnippet: doc.rawText.substring(0, 200),
      evidenceText: doc.rawText.substring(0, 200),
      sourceLocation: { pageNumber: 1, section: 'Overview' },
      reasonForFlagging: 'Routine verification recommended before final signature.',
      suggestedQuestion: 'Consider reviewing payment due dates and dispute resolution venue.',
      suggestedAction: 'Consider reviewing payment due dates and dispute resolution venue.'
    });
  }

  return risks;
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

function generateChecklistItems(_clauses: ClauseItem[], _risks: RiskItem[]): ChecklistItem[] {
  return [
    {
      id: 'chk_1',
      category: 'Financial',
      itemText: 'Confirm Payment Schedule & Fee Amounts',
      label: 'Confirm Payment Schedule & Fee Amounts',
      description: 'Verify payment terms, due dates, invoicing schedules, and potential late fee penalties.',
      importance: 'high',
      isChecked: false
    },
    {
      id: 'chk_2',
      category: 'Termination',
      itemText: 'Review Cancellation Notice Deadline',
      label: 'Review Cancellation Notice Deadline',
      description: 'Check required advance notice days needed to terminate before automatic renewal.',
      importance: 'critical',
      isChecked: false
    },
    {
      id: 'chk_3',
      category: 'IP',
      itemText: 'Verify Intellectual Property Ownership Rights',
      label: 'Verify Intellectual Property Ownership Rights',
      description: 'Ensure clear assignment or retention of created inventions, code, or materials.',
      importance: 'high',
      isChecked: false
    },
    {
      id: 'chk_4',
      category: 'Liability',
      itemText: 'Check Liability Cap Limitations',
      label: 'Check Liability Cap Limitations',
      description: 'Confirm maximum financial liability and mutual indemnification scope.',
      importance: 'high',
      isChecked: false
    },
    {
      id: 'chk_5',
      category: 'General',
      itemText: 'Discuss Flagged Concerns with Legal Counsel',
      label: 'Discuss Flagged Concerns with Legal Counsel',
      description: 'Prepare specific questions regarding high-attention risk provisions.',
      importance: 'medium',
      isChecked: false
    }
  ];
}

function generateLawyerBrief(
  doc: UploadedDocument,
  summary: any,
  _clauses: ClauseItem[],
  risks: RiskItem[]
): LawyerBrief {
  const docTitle = doc.name || doc.filename || 'Legal Document';
  return {
    id: `brief_${doc.id}`,
    documentTitle: docTitle,
    generatedAt: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    executiveSummary: summary.quickSummary,
    overview: summary.quickSummary,
    keyObligations: summary.keyObligations,
    importantDates: summary.keyDeadlines,
    criticalRiskFactors: risks.map((r) => r.title),
    potentialConcerns: risks.map((r) => ({
      title: r.title,
      description: r.explanation,
      section: r.sourceLocation?.section
    })),
    unclearAreas: summary.unestablishedInformation,
    recommendedNextSteps: [
      'Conduct formal legal review of liability limitations.',
      'Clarify notice periods for termination.'
    ],
    recommendedQuestions: [
      'What happens if notice of termination is sent 5 days past the deadline?',
      'Can the liability cap be amended to match total annual fees paid?',
      'Are there geographic or industry scope restrictions on post-contract activities?'
    ],
    flaggedClausesCount: risks.length
  };
}

function generateGroundedAnswerText(question: string, chunkText: string, _fullText: string): string {
  const qLower = question.toLowerCase();
  const chunkLower = chunkText.toLowerCase();

  if (qLower.includes('terminate') || qLower.includes('cancel')) {
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
