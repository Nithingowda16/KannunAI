import { describe, test, expect } from 'vitest';
import { validateLegalDocumentFile } from '../services/security/fileValidator';
import { extractTextFromFile } from '../services/document/textExtractor';
import { MockAIProvider } from '../services/ai/mockProvider';
import { UploadedDocument } from '../types/document';

describe('E2E Integration Test Suite - User Document Processing Journey', () => {
  test('Full end-to-end document processing pipeline', async () => {
    const sampleContent = `
EMPLOYMENT AGREEMENT
Effective Date: January 15, 2026.
1. POSITION: Software Engineer.
2. COMPENSATION: $160,000 per annum.
3. TERMINATION: 30 days written notice.
4. GOVERNING LAW: California.
`.trim();

    const mockFile = new File([sampleContent], 'employment_agreement.txt', { type: 'text/plain' });
    const validation = validateLegalDocumentFile(mockFile);
    expect(validation.isValid).toBe(true);

    const extraction = await extractTextFromFile(mockFile);
    const mockDoc: UploadedDocument = {
      id: 'doc_e2e_1',
      name: validation.sanitizedFilename || 'employment_agreement.txt',
      filename: validation.sanitizedFilename || 'employment_agreement.txt',
      sizeFormatted: validation.fileSizeFormatted || '1 KB',
      uploadedAt: new Date().toLocaleTimeString(),
      rawText: extraction.text,
      chunks: extraction.chunks
    };
    expect(mockDoc.chunks.length).toBeGreaterThan(0);

    const provider = new MockAIProvider();
    const analysis = await provider.analyzeDocument(mockDoc);
    expect(analysis.summary.documentType.length).toBeGreaterThan(0);
    expect(analysis.risks.length).toBeGreaterThan(0);

    const qa = await provider.answerQuestion(mockDoc, 'What is the notice period?', []);
    expect(qa.groundingStatus).toBe('Grounded');
    expect(qa.citations.length).toBeGreaterThan(0);

    expect(analysis.checklist.length).toBeGreaterThan(0);
    expect(analysis.lawyerBrief.keyObligations.length).toBeGreaterThan(0);
  });
});

export async function runE2ETests(): Promise<{ passed: number; failed: number; logs: string[] }> {
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
Effective Date: January 15, 2026.
1. POSITION: Software Engineer.
2. COMPENSATION: $160,000 per annum.
3. TERMINATION: 30 days written notice.
4. GOVERNING LAW: California.
`.trim();

    const mockFile = new File([sampleContent], 'employment_agreement.txt', { type: 'text/plain' });
    const validation = validateLegalDocumentFile(mockFile);
    assert(validation.isValid, 'E2E Step 1: File Validation passes');

    const extraction = await extractTextFromFile(mockFile);
    const mockDoc: UploadedDocument = {
      id: 'doc_e2e_1',
      name: validation.sanitizedFilename || 'employment_agreement.txt',
      filename: validation.sanitizedFilename || 'employment_agreement.txt',
      sizeFormatted: validation.fileSizeFormatted || '1 KB',
      uploadedAt: new Date().toLocaleTimeString(),
      rawText: extraction.text,
      chunks: extraction.chunks
    };
    assert(mockDoc.chunks.length > 0, 'E2E Step 2: Text extraction & semantic chunking succeeds');

    const provider = new MockAIProvider();
    const analysis = await provider.analyzeDocument(mockDoc);
    assert(analysis.summary.documentType.length > 0, 'E2E Step 3: Analysis summary establishes document type');
    assert(analysis.risks.length > 0, 'E2E Step 4: Risk Radar categorizes attention areas');

    const qa = await provider.answerQuestion(mockDoc, 'What is the notice period?', []);
    assert(qa.groundingStatus === 'Grounded' && qa.citations.length > 0, 'E2E Step 5: Grounded Q&A returns citation');

    assert(analysis.checklist.length > 0, 'E2E Step 6: Pre-signing checklist generated');
    assert(analysis.lawyerBrief.keyObligations.length > 0, 'E2E Step 7: Lawyer Brief generated');

  } catch (error: unknown) {
    failed++;
    const message = error instanceof Error ? error.message : 'E2E Execution Error';
    logs.push(`[FAIL] E2E Execution Error: ${message}`);
  }

  return { passed, failed, logs };
}
