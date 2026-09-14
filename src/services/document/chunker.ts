import { DocumentChunk } from '../../types/document';

/**
 * Sliding window semantic chunker for legal documents.
 * Preserves section headers, paragraph boundaries, and page numbers.
 */

export function createDocumentChunks(
  documentId: string,
  rawText: string,
  totalPages: number
): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];
  const paragraphs = rawText.split(/\n\s*\n/);
  
  let currentChunkText = '';
  let currentSectionHeader = 'General Terms';
  let charOffset = 0;
  let chunkIndex = 0;

  const totalChars = rawText.length;

  for (const paragraph of paragraphs) {
    const trimmed = paragraph.trim();
    if (!trimmed) continue;

    // Detect section headers (e.g. "SECTION 1. DEFINITIONS", "8. TERMINATION", "CLAUSE A")
    if (isSectionHeader(trimmed)) {
      currentSectionHeader = trimmed;
    }

    // Check if adding this paragraph exceeds target chunk size (~1200 chars / ~200-300 words)
    if (currentChunkText.length + trimmed.length > 1200 && currentChunkText.length > 0) {
      const endChar = charOffset + currentChunkText.length;
      const estimatedPage = Math.max(1, Math.min(totalPages, Math.ceil((endChar / totalChars) * totalPages)));

      chunks.push({
        id: `${documentId}_chunk_${chunkIndex}`,
        documentId,
        chunkIndex,
        text: currentChunkText.trim(),
        sectionHeader: currentSectionHeader,
        pageNumber: estimatedPage,
        startChar: charOffset,
        endChar
      });

      // Maintain overlap (~200 chars from end of current chunk)
      const overlapStart = Math.max(0, currentChunkText.length - 200);
      const overlapText = currentChunkText.substring(overlapStart);

      charOffset = endChar - overlapText.length;
      currentChunkText = overlapText + '\n\n' + trimmed;
      chunkIndex++;
    } else {
      currentChunkText += (currentChunkText ? '\n\n' : '') + trimmed;
    }
  }

  // Flush remaining text
  if (currentChunkText.trim()) {
    const endChar = charOffset + currentChunkText.length;
    const estimatedPage = Math.max(1, Math.min(totalPages, Math.ceil((endChar / Math.max(1, totalChars)) * totalPages)));

    chunks.push({
      id: `${documentId}_chunk_${chunkIndex}`,
      documentId,
      chunkIndex,
      text: currentChunkText.trim(),
      sectionHeader: currentSectionHeader,
      pageNumber: estimatedPage,
      startChar: charOffset,
      endChar
    });
  }

  return chunks;
}

function isSectionHeader(text: string): boolean {
  if (text.length > 120) return false;
  const headerPatterns = [
    /^(section|clause|article|paragraph)\s+[0-9a-z\.\-\:]+/i,
    /^[0-9]+\.[\sA-Z]+$/,
    /^[A-Z\s]{4,60}$/
  ];
  return headerPatterns.some((p) => p.test(text.trim()));
}
