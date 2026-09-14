import { UploadedDocument } from '../../types/document';
import { generateSecureDocumentId } from '../security/fileValidator';
import { createDocumentChunks } from './chunker';

export interface ExtractionResult {
  rawText: string;
  pageCount: number;
  wordCount: number;
  extractedSections: { title: string; text: string; pageNumber: number }[];
}

export async function extractTextFromLegalFile(file: File): Promise<UploadedDocument> {
  const filename = file.name;
  const mimeType = file.type || 'text/plain';
  let rawText = '';
  let pageCount = 1;

  if (filename.endsWith('.txt') || mimeType === 'text/plain') {
    rawText = await file.text();
    // Estimate page count for plain text (~500 words per page)
    const words = rawText.trim().split(/\s+/).length;
    pageCount = Math.max(1, Math.ceil(words / 450));
  } else if (filename.endsWith('.pdf') || mimeType === 'application/pdf') {
    // Basic text extraction for PDF text streams in browser
    const buffer = await file.arrayBuffer();
    const textDecoder = new TextDecoder('utf-8');
    const pdfContent = textDecoder.decode(buffer);

    // Extract text streams between BT (Begin Text) and ET (End Text) or standard text tokens
    const textBlocks: string[] = [];
    const streamRegex = /\(([^)]+)\)\s*Tj|\[([^\]]+)\]\s*TJ/g;
    let match;
    while ((match = streamRegex.exec(pdfContent)) !== null) {
      const textSnippet = match[1] || match[2] || '';
      if (textSnippet.trim().length > 1) {
        textBlocks.push(textSnippet.replace(/\\\(|\x5C\)/g, ''));
      }
    }

    if (textBlocks.length > 5) {
      rawText = textBlocks.join(' ');
    } else {
      // Fallback text cleanup if raw text string available
      rawText = pdfContent.replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s+/g, ' ');
    }

    // Estimate pages based on page markers
    const pageMatches = pdfContent.match(/\/Type\s*\/Page/g);
    pageCount = pageMatches ? Math.max(1, pageMatches.length) : Math.max(1, Math.ceil(rawText.split(/\s+/).length / 450));
  } else {
    // DOCX or fallback
    rawText = await file.text();
    // Clean XML tags if raw docx XML text
    rawText = rawText.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    const words = rawText.trim().split(/\s+/).length;
    pageCount = Math.max(1, Math.ceil(words / 450));
  }

  const cleanText = normalizeExtractedText(rawText);
  const docId = generateSecureDocumentId();
  const chunks = createDocumentChunks(docId, cleanText, pageCount);
  const wordCount = cleanText.trim().split(/\s+/).filter(Boolean).length;

  return {
    id: docId,
    filename,
    fileSize: file.size,
    mimeType,
    uploadedAt: new Date(),
    rawText: cleanText,
    pageCount,
    wordCount,
    chunks,
    hash: await calculateSimpleHash(cleanText)
  };
}

export function normalizeExtractedText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function calculateSimpleHash(text: string): Promise<string> {
  let hash = 0;
  for (let i = 0; i < Math.min(text.length, 5000); i++) {
    const char = text.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return 'hash_' + Math.abs(hash).toString(16);
}
