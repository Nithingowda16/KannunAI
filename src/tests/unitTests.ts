import { validateLegalDocumentFile, sanitizeFilename } from '../services/security/fileValidator';
import { createDocumentChunks } from '../services/document/chunker';
import { InMemoryVectorStore } from '../services/document/vectorStore';

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

  // Test 1: Filename Sanitization against Path Traversal
  const dirtyFilename = '../../../etc/passwd_contract.pdf';
  const cleanFilename = sanitizeFilename(dirtyFilename);
  assert(
    !cleanFilename.includes('..') && !cleanFilename.includes('/etc/'),
    'Sanitize filename strips path traversal sequences'
  );

  // Test 2: File Validation Size Enforcer
  const mockLargeFile = new File(['a'.repeat(100)], 'huge.exe', { type: 'application/x-msdownload' });
  const validation = validateLegalDocumentFile(mockLargeFile);
  assert(!validation.isValid, 'File validator rejects non-legal extension (.exe)');

  // Test 3: Sliding Window Semantic Chunker
  const sampleText = 'SECTION 1. DEFINITIONS.\n\nThis is paragraph one.\n\nThis is paragraph two.';
  const chunks = createDocumentChunks('test_doc', sampleText, 1);
  assert(chunks.length > 0 && chunks[0].sectionHeader === 'SECTION 1. DEFINITIONS.', 'Chunker preserves section headers');

  // Test 4: Vector Index TF-IDF Retrieval
  const vectorStore = new InMemoryVectorStore(chunks);
  const results = vectorStore.search('definitions', 1);
  assert(results.length > 0, 'Vector store retrieves top matching chunk');

  return { passed, failed, logs };
}
