import { describe, test, expect } from 'vitest';
import { validateLegalDocumentFile, sanitizeFilename } from '../services/security/fileValidator';
import { createDocumentChunks } from '../services/document/chunker';
import { InMemoryVectorStore, tokenize } from '../services/document/vectorStore';

describe('Unit Test Suite - Core Data Structures & Utilities', () => {
  test('Sanitize filename strips path traversal sequences', () => {
    const cleanFilename = sanitizeFilename('../../../etc/passwd_contract.pdf');
    expect(cleanFilename.includes('..')).toBe(false);
    expect(cleanFilename.includes('/etc/')).toBe(false);
  });

  test('File validator rejects non-legal extension (.exe)', () => {
    const mockFile = new File(['test'], 'malicious.exe', { type: 'application/x-msdownload' });
    const validation = validateLegalDocumentFile(mockFile);
    expect(validation.isValid).toBe(false);
  });

  test('Sliding window semantic chunker preserves section headers', () => {
    const sampleText = 'SECTION 1. DEFINITIONS.\n\nThis is paragraph one.\n\nThis is paragraph two.';
    const chunks = createDocumentChunks('test_doc', sampleText, 1);
    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks[0].sectionHeader).toBe('SECTION 1. DEFINITIONS.');
  });

  test('Vector store retrieves top matching chunk using TF-IDF', () => {
    const sampleText = 'SECTION 1. DEFINITIONS.\n\nThis is paragraph one.\n\nThis is paragraph two.';
    const chunks = createDocumentChunks('test_doc', sampleText, 1);
    const vectorStore = new InMemoryVectorStore(chunks);
    const results = vectorStore.search('definitions', 1);
    expect(results.length).toBeGreaterThan(0);
  });

  test('Unicode & Kannada script tokenization preserves multilingual legal terms', () => {
    const kannadaText = 'ಒಪ್ಪಂದದ ನಿಯಮಗಳು (Agreement Terms): Termination notice 30 days.';
    const tokens = tokenize(kannadaText);
    expect(tokens.includes('ಒಪ್ಪಂದದ')).toBe(true);
    expect(tokens.includes('termination')).toBe(true);
  });
});

export function runUnitTests(): { passed: number; failed: number; logs: string[] } {
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

  // 1. Path Traversal Stripping
  const cleanFilename = sanitizeFilename('../../../etc/passwd_contract.pdf');
  assert(!cleanFilename.includes('..') && !cleanFilename.includes('/etc/'), 'Sanitize filename strips path traversal');

  // 2. Extension Enforcement
  const validation = validateLegalDocumentFile(new File(['test'], 'malicious.exe', { type: 'application/x-msdownload' }));
  assert(!validation.isValid, 'File validator rejects non-legal extension (.exe)');

  // 3. Sliding Window Semantic Chunker
  const sampleText = 'SECTION 1. DEFINITIONS.\n\nThis is paragraph one.\n\nThis is paragraph two.';
  const chunks = createDocumentChunks('test_doc', sampleText, 1);
  assert(chunks.length > 0 && chunks[0].sectionHeader === 'SECTION 1. DEFINITIONS.', 'Chunker preserves section headers');

  // 4. TF-IDF Vector Retrieval
  const vectorStore = new InMemoryVectorStore(chunks);
  const results = vectorStore.search('definitions', 1);
  assert(results.length > 0, 'Vector store retrieves top matching chunk');

  // 5. Unicode & Kannada Script Tokenization
  const kannadaText = 'ಒಪ್ಪಂದದ ನಿಯಮಗಳು (Agreement Terms): Termination notice 30 days.';
  const tokens = tokenize(kannadaText);
  assert(tokens.includes('ಒಪ್ಪಂದದ') && tokens.includes('termination'), 'Tokenizer preserves Unicode Kannada script');

  return { passed, failed, logs };
}
