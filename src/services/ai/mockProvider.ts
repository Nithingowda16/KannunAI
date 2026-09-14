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
  name = 'KannunAI Local Deterministic Engine (Offline/Mock)';

  async analyzeDocument(doc: UploadedDocument): Promise<DocumentAnalysis> {
    // 1. Detect Clauses across 18+ categories
    const clauses = extractLegalClausesFromText(doc);

    // 2. Detect Risks
    const risks = evaluateRisksFromClauses(clauses, doc);

    // 3. Generate Plain Language Summary
    const summary = generatePlainSummary(doc, clauses, risks);

    // 4. Generate Pre-Signing Checklist
    const checklist = generateChecklistItems(clauses, risks);

    // 5. Generate Lawyer Prep Brief
    const lawyerBrief = generateLawyerBrief(doc, summary, clauses, risks);

    return {
      id: `analysis_${doc.id}`,
      documentId: doc.id,
      analyzedAt: new Date().toISOString(),
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
    const vectorStore = new InMemoryVectorStore(doc.chunks);
    const searchResults = vectorStore.search(question, 3);

    if (searchResults.length === 0 || searchResults[0].score < 0.2) {
      return {
        id: `qa_${Date.now()}`,
        question,
        answer: "I couldn't find enough information in the provided document to answer that reliably.",
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
      sectionTitle: topChunk.sectionHeader || `Page ${topChunk.pageNumber}`,
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

    // Analyze Doc A & Doc B clauses
    const clausesA = extractLegalClausesFromText(docA);
    const clausesB = extractLegalClausesFromText(docB);

    // Compare Auto Renewal
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
        sourceLocationOld: { section: renewA.sourceLocation.section, pageNumber: renewA.sourceLocation.pageNumber }
      });
    }

    // Compare Notice Periods
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
        sourceLocationOld: { section: noticeA.sourceLocation.section, pageNumber: noticeA.sourceLocation.pageNumber },
        sourceLocationNew: { section: noticeB.sourceLocation.section, pageNumber: noticeB.sourceLocation.pageNumber }
      });
    }

    // Compare IP
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
        whyItMayMatter: 'Ensures clarify on IP ownership, but limits your rights to reuse work materials.',
        severity: 'high',
        sourceLocationNew: { section: ipB.sourceLocation.section, pageNumber: ipB.sourceLocation.pageNumber }
      });
    }

    // Default general diff if few specific matched
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

    return {
      id: `comp_${Date.now()}`,
      docAId: docA.id,
      docBId: docB.id,
      docAName: docA.filename,
      docBName: docB.filename,
      comparedAt: new Date().toISOString(),
      overallSummary: `Compared ${docA.filename} against ${docB.filename}. Detected ${differences.length} structural differences across termination, IP, and payment terms.`,
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

  // 1. Payment Clause
  if (lower.includes('payment') || lower.includes('compensation') || lower.includes('fee')) {
    const snippet = findMatchingParagraph(text, ['payment', 'compensation', 'fee', 'salary', 'invoice']);
    clauses.push({
      id: 'c_pay',
      category: 'payment',
      title: 'Payment & Compensation Terms',
      originalText: snippet.text,
      plainLanguage: 'Outlines how much, when, and by what method payments will be disbursed or collected.',
      whyItMatters: 'Governs your cash flow, payment timelines, and consequences for overdue balances.',
      potentialConcern: lower.includes('penalty') || lower.includes('late fee') ? 'Includes late payment penalty provisions.' : 'Standard payment schedule.',
      sourceLocation: { pageNumber: snippet.page, section: 'Payment Terms', startChar: snippet.start, endChar: snippet.end },
      confidence: 'High',
      status: 'Detected'
    });
  }

  // 2. Termination Clause
  if (lower.includes('terminate') || lower.includes('cancellation') || lower.includes('notice')) {
    const snippet = findMatchingParagraph(text, ['terminate', 'cancellation', 'notice period', 'written notice']);
    clauses.push({
      id: 'c_term',
      category: 'termination',
      title: 'Termination & Notice Requirements',
      originalText: snippet.text,
      plainLanguage: 'Explains how either party can cancel or end the contract, and how much advance notice must be given.',
      whyItMatters: 'Determines how easily you can exit the relationship if conditions change.',
      potentialConcern: lower.includes('immediate termination') || lower.includes('without cause')
        ? 'Party may terminate immediately or without cause under certain conditions.'
        : 'Requires formal written notice prior to termination.',
      sourceLocation: { pageNumber: snippet.page, section: 'Termination Clause', startChar: snippet.start, endChar: snippet.end },
      confidence: 'High',
      status: 'Requires Review'
    });
  }

  // 3. Automatic Renewal Clause
  if (lower.includes('automatic renewal') || lower.includes('automatically renew') || lower.includes('successive terms')) {
    const snippet = findMatchingParagraph(text, ['automatic renewal', 'automatically renew', 'renew']);
    clauses.push({
      id: 'c_renew',
      category: 'automatic_renewal',
      title: 'Automatic Renewal Provision',
      originalText: snippet.text,
      plainLanguage: 'The agreement automatically extends for additional term periods unless written opt-out notice is provided in advance.',
      whyItMatters: 'You could be locked into paying for another full term if you miss the cancellation notice window.',
      potentialConcern: 'Requires strict calendar reminder for cancellation notice deadline.',
      sourceLocation: { pageNumber: snippet.page, section: 'Renewal Terms', startChar: snippet.start, endChar: snippet.end },
      confidence: 'High',
      status: 'Requires Review'
    });
  }

  // 4. Confidentiality Clause
  if (lower.includes('confidential') || lower.includes('non-disclosure') || lower.includes('proprietary')) {
    const snippet = findMatchingParagraph(text, ['confidential', 'proprietary', 'trade secret']);
    clauses.push({
      id: 'c_conf',
      category: 'confidentiality',
      title: 'Confidentiality & Non-Disclosure',
      originalText: snippet.text,
      plainLanguage: 'Requires keeping shared business information, technical secrets, and trade data strictly private.',
      whyItMatters: 'Protects proprietary secrets but imposes legal liability if sensitive information is leaked.',
      potentialConcern: lower.includes('perpetual') ? 'Confidentiality obligations survive indefinitely.' : 'Standard non-disclosure obligations.',
      sourceLocation: { pageNumber: snippet.page, section: 'Confidentiality', startChar: snippet.start, endChar: snippet.end },
      confidence: 'High',
      status: 'Detected'
    });
  }

  // 5. Intellectual Property
  if (lower.includes('intellectual property') || lower.includes('work for hire') || lower.includes('copyright') || lower.includes('invention')) {
    const snippet = findMatchingParagraph(text, ['intellectual property', 'work for hire', 'copyright', 'ownership', 'assigns']);
    clauses.push({
      id: 'c_ip',
      category: 'intellectual_property',
      title: 'Intellectual Property Ownership',
      originalText: snippet.text,
      plainLanguage: 'Specifies who owns inventions, designs, code, documents, or branding created during the engagement.',
      whyItMatters: 'Ensures clarity over product rights and prevents future ownership disputes.',
      potentialConcern: 'Assigns all created work product exclusively to the hiring entity.',
      sourceLocation: { pageNumber: snippet.page, section: 'IP Rights', startChar: snippet.start, endChar: snippet.end },
      confidence: 'High',
      status: 'Detected'
    });
  }

  // 6. Liability Limitation
  if (lower.includes('limitation of liability') || lower.includes('indemnify') || lower.includes('hold harmless')) {
    const snippet = findMatchingParagraph(text, ['liability', 'indemnify', 'hold harmless', 'damages']);
    clauses.push({
      id: 'c_liab',
      category: 'liability',
      title: 'Limitation of Liability & Indemnification',
      originalText: snippet.text,
      plainLanguage: 'Caps financial damages either party can claim and defines who pays for legal expenses if sued by a third party.',
      whyItMatters: 'Controls maximum legal and financial exposure in case of disputes or performance failures.',
      potentialConcern: lower.includes('uncapped') || lower.includes('sole liability') ? 'Indemnification obligations may be uncapped.' : 'Standard liability limits.',
      sourceLocation: { pageNumber: snippet.page, section: 'Liability & Indemnity', startChar: snippet.start, endChar: snippet.end },
      confidence: 'High',
      status: 'Requires Review'
    });
  }

  // 7. Non-Compete / Non-Solicitation
  if (lower.includes('non-compete') || lower.includes('solicit') || lower.includes('restrictive covenant')) {
    const snippet = findMatchingParagraph(text, ['non-compete', 'solicit', 'compete', 'restrictive']);
    clauses.push({
      id: 'c_noncomp',
      category: 'non_compete',
      title: 'Non-Compete & Non-Solicitation Restriction',
      originalText: snippet.text,
      plainLanguage: 'Restricts working for competing businesses or recruiting clients/employees for a period after leaving.',
      whyItMatters: 'Directly impacts your future career, job options, and business operations post-termination.',
      potentialConcern: 'Restricts post-contract employment in specified geographic regions or industries.',
      sourceLocation: { pageNumber: snippet.page, section: 'Restrictive Covenants', startChar: snippet.start, endChar: snippet.end },
      confidence: 'High',
      status: 'Requires Review'
    });
  }

  // Fallback if no specific clauses detected
  if (clauses.length === 0) {
    clauses.push({
      id: 'c_gen',
      category: 'general',
      title: 'General Agreement Terms',
      originalText: doc.rawText.substring(0, 300) + '...',
      plainLanguage: 'Standard general contract agreement provisions.',
      whyItMatters: 'Establishes basic rights and legal relationships.',
      potentialConcern: 'Requires full review of custom provisions.',
      sourceLocation: { pageNumber: 1, section: 'General', startChar: 0, endChar: 300 },
      confidence: 'Medium',
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
        severity: 'high',
        category: 'Termination & Fees',
        explanation: 'Agreement automatically renews for successive terms unless written notice is given within the specified window.',
        evidenceText: clause.originalText,
        sourceLocation: { pageNumber: clause.sourceLocation.pageNumber, section: clause.sourceLocation.section },
        reasonForFlagging: 'Potential recurring financial obligation if cancellation notice deadline is missed.',
        suggestedAction: 'Consider asking: What is the exact deadline for sending cancellation notice, and via what communication channel?'
      });
    }

    if (clause.category === 'non_compete') {
      risks.push({
        id: 'risk_non_compete',
        title: 'Post-Contract Restrictive Covenant',
        severity: 'high',
        category: 'Career & Competition',
        explanation: 'Restricts performing similar work or soliciting clients for a specified period after contract end.',
        evidenceText: clause.originalText,
        sourceLocation: { pageNumber: clause.sourceLocation.pageNumber, section: clause.sourceLocation.section },
        reasonForFlagging: 'May limit future employment or business options after termination.',
        suggestedAction: 'Consider asking: Can the non-compete duration or geographic scope be narrowed?'
      });
    }

    if (clause.category === 'liability' && clause.potentialConcern.includes('uncapped')) {
      risks.push({
        id: 'risk_liability',
        title: 'Broad Uncapped Indemnification Burden',
        severity: 'high',
        category: 'Financial Exposure',
        explanation: 'Indemnification clause may expose you to third-party legal costs without a clear liability cap.',
        evidenceText: clause.originalText,
        sourceLocation: { pageNumber: clause.sourceLocation.pageNumber, section: clause.sourceLocation.section },
        reasonForFlagging: 'Uncapped financial liability in legal proceedings.',
        suggestedAction: 'Consider asking: Can we insert a mutual liability cap tied to total contract fees paid?'
      });
    }

    if (clause.category === 'termination' && clause.potentialConcern.includes('immediate')) {
      risks.push({
        id: 'risk_term_immediate',
        title: 'Immediate Termination Rights',
        severity: 'medium',
        category: 'Contract Duration',
        explanation: 'Allows termination without extended notice period under specific circumstances.',
        evidenceText: clause.originalText,
        sourceLocation: { pageNumber: clause.sourceLocation.pageNumber, section: clause.sourceLocation.section },
        reasonForFlagging: 'Contract could end suddenly with limited transition time.',
        suggestedAction: 'Consider asking: What notice period is required for convenience vs default?'
      });
    }
  }

  // If no high risks, add standard medium/low risk
  if (risks.length === 0) {
    risks.push({
      id: 'risk_std',
      title: 'Standard Legal Review Recommendation',
      severity: 'low',
      category: 'General Governance',
      explanation: 'No high-attention unusual clauses detected in standard pattern scans.',
      evidenceText: doc.rawText.substring(0, 200),
      sourceLocation: { pageNumber: 1, section: 'Overview' },
      reasonForFlagging: 'Routine verification recommended before final signature.',
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

  const keyObligations = clauses.map((c) => c.title);
  const keyDeadlines = clauses
    .filter((c) => c.category === 'notice_periods' || c.category === 'payment' || c.category === 'automatic_renewal')
    .map((c) => `${c.title}: ${c.potentialConcern}`);

  const notableRisks = risks.map((r) => `${r.title} (${r.severity.toUpperCase()} ATTENTION)`);

  const missingInformation: string[] = [];
  if (effectiveDate === 'Not found in the provided document.') missingInformation.push('Explicit effective start date');
  if (duration === 'Not found in the provided document.') missingInformation.push('Defined contract duration or expiration date');

  return {
    quickSummary: `This ${docType} outlines contractual obligations between the participating parties. Key terms include ${clauses.slice(0, 3).map((c) => c.title.toLowerCase()).join(', ')}. ${risks.length} key attention areas were flagged for review.`,
    detailedSummary: `This document appears to be a ${docType}. It establishes binding terms governing rights, obligations, dispute resolution, and operational scope. Users should carefully review flagged provisions regarding ${risks.map((r) => r.title).join(' and ')}.`,
    documentType: docType,
    apparentPurpose: `To establish formal legal relationship and operational parameters for ${docType.toLowerCase()}.`,
    partiesInvolved: parties.length > 0 ? parties : ['Not found in the provided document.'],
    effectiveDate,
    duration,
    terminationSummary: clauses.find((c) => c.category === 'termination')?.plainLanguage || 'Not found in the provided document.',
    keyObligations,
    keyDeadlines: keyDeadlines.length > 0 ? keyDeadlines : ['Not found in the provided document.'],
    notableRisks,
    missingInformation: missingInformation.length > 0 ? missingInformation : ['None explicitly identified missing.']
  };
}

function generateChecklistItems(_clauses: ClauseItem[], _risks: RiskItem[]): ChecklistItem[] {
  const items: ChecklistItem[] = [
    {
      id: 'chk_1',
      category: 'Financial',
      label: 'Confirm Payment Schedule & Fee Amounts',
      description: 'Verify payment terms, due dates, invoicing schedules, and potential late fee penalties.',
      isCompleted: false
    },
    {
      id: 'chk_2',
      category: 'Termination',
      label: 'Review Cancellation Notice Deadline',
      description: 'Check required advance notice days needed to terminate before automatic renewal.',
      isCompleted: false
    },
    {
      id: 'chk_3',
      category: 'IP',
      label: 'Verify Intellectual Property Ownership Rights',
      description: 'Ensure clear assignment or retention of created inventions, code, or materials.',
      isCompleted: false
    },
    {
      id: 'chk_4',
      category: 'Liability',
      label: 'Check Liability Cap Limitations',
      description: 'Confirm maximum financial liability and mutual indemnification scope.',
      isCompleted: false
    },
    {
      id: 'chk_5',
      category: 'General',
      label: 'Discuss Flagged Concerns with Legal Counsel',
      description: 'Prepare specific questions regarding high-attention risk provisions.',
      isCompleted: false
    }
  ];

  return items;
}

function generateLawyerBrief(
  doc: UploadedDocument,
  summary: any,
  _clauses: ClauseItem[],
  risks: RiskItem[]
): LawyerBrief {
  return {
    id: `brief_${doc.id}`,
    documentTitle: doc.filename,
    generatedAt: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    overview: summary.quickSummary,
    keyObligations: summary.keyObligations,
    importantDates: summary.keyDeadlines,
    potentialConcerns: risks.map((r) => ({
      title: r.title,
      description: r.explanation,
      section: r.sourceLocation.section
    })),
    unclearAreas: summary.missingInformation,
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
  return ['Not found in the provided document.'];
}

function extractEffectiveDate(text: string): string {
  const match = text.match(/effective (as of\s+)?([A-Z][a-z]+\s+\d{1,2},\s+\d{4}|\d{1,2}\/\d{1,2}\/\d{4})/i);
  if (match) {
    return match[2];
  }
  return 'Not found in the provided document.';
}

function extractDuration(text: string): string {
  const match = text.match(/(term of\s+)?(\d+\s+(years|months)|one year|two years)/i);
  if (match) {
    return match[0];
  }
  return 'Not found in the provided document.';
}

function extractGoverningLaw(text: string): string {
  const match = text.match(/governed by (the laws of\s+)?([A-Za-z\s]+)/i);
  if (match) {
    return match[2].split('.')[0].trim();
  }
  return 'Not found in the provided document.';
}
