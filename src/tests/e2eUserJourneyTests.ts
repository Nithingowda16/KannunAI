import { validateLegalDocumentFile } from '../services/security/fileValidator';
import { extractTextFromFile } from '../services/document/textExtractor';
import { MockAIProvider } from '../services/ai/mockProvider';
import { UploadedDocument } from '../types/document';

export async function runE2EUserJourneyTests(): Promise<{ passed: number; failed: number; logs: string[] }> {
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

  try {
    const sampleContent = `
EMPLOYMENT AGREEMENT

This Employment Agreement is entered into by and between Acme Corp ("Company") and Jane Doe ("Employee").
Effective Date: January 15, 2026.

1. POSITION AND DUTIES
Employee shall serve as Senior Software Engineer reporting to the Chief Technology Officer.

2. COMPENSATION
Base Salary: $160,000 per annum paid semi-monthly.

3. TERMINATION AND NOTICE
Either party may terminate this agreement by providing thirty (30) days written notice. Company reserves the right to terminate immediately for Cause.

4. NON-COMPETE CLAUSE
Employee agrees not to engage in any competing technology business worldwide for a period of 24 months post-termination.

5. GOVERNING LAW
This Agreement shall be governed by the laws of the State of California.
`.trim();

    const mockFile = new File([sampleContent], 'sample_employment_agreement.txt', { type: 'text/plain' });
    const validation = validateLegalDocumentFile(mockFile);
    assert(validation.isValid, 'Step 1: Upload & File Validation passes');

    const extraction = await extractTextFromFile(mockFile);
    const mockDoc: UploadedDocument = {
      id: 'doc_e2e_test_123',
      name: validation.sanitizedFilename || 'sample_employment_agreement.txt',
      filename: validation.sanitizedFilename || 'sample_employment_agreement.txt',
      sizeFormatted: validation.fileSizeFormatted || '2 KB',
      uploadedAt: new Date().toLocaleTimeString(),
      rawText: extraction.text,
      chunks: extraction.chunks
    };
    assert(mockDoc.chunks.length > 0, 'Step 2: Document text extraction & semantic chunking succeeds');

    const aiProvider = new MockAIProvider();
    const analysis = await aiProvider.analyzeDocument(mockDoc);
    assert(
      analysis.summary.documentType.length > 0 && analysis.summary.partiesInvolved.length > 0,
      'Step 3: Plain-language summary establishes document type & parties'
    );

    assert(analysis.risks.length > 0, 'Step 4: Risk Radar identifies potential concern areas');

    const qaResult = await aiProvider.answerQuestion(mockDoc, 'What is the non compete period?', []);
    assert(
      qaResult.groundingStatus === 'Grounded' && qaResult.citations.length > 0,
      'Step 5: Grounded Q&A returns citation-backed answer'
    );

    assert(analysis.checklist.length > 0, 'Step 6: Actionable pre-signing checklist generated');

    assert(
      analysis.lawyerBrief.keyObligations.length > 0 && (analysis.lawyerBrief.recommendedQuestions?.length || 0) > 0,
      'Step 7: Structured Lawyer Preparation Brief generated successfully'
    );

  } catch (error: unknown) {
    failed++;
    const message = error instanceof Error ? error.message : 'E2E Execution Error';
    logs.push(`[FAIL] E2E User Journey Execution Error: ${message}`);
  }

  return { passed, failed, logs };
}
