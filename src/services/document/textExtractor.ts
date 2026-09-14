import { UploadedDocument } from '../../types/document';
import { generateSecureDocumentId } from '../security/fileValidator';
import { createDocumentChunks } from './chunker';

export interface ExtractionResult {
  text: string;
  rawText: string;
  pageCount: number;
  wordCount: number;
  chunks: any[];
  extractedSections: { title: string; text: string; pageNumber: number }[];
}

export async function extractTextFromLegalFile(file: File): Promise<UploadedDocument> {
  const name = file.name;
  const mimeType = file.type || 'text/plain';
  let rawText = '';
  let pageCount = 1;

  if (name.endsWith('.txt') || mimeType === 'text/plain') {
    rawText = await file.text();
    const words = rawText.trim().split(/\s+/).length;
    pageCount = Math.max(1, Math.ceil(words / 450));
  } else if (name.endsWith('.pdf') || mimeType === 'application/pdf') {
    const buffer = await file.arrayBuffer();
    const textDecoder = new TextDecoder('utf-8');
    const pdfContent = textDecoder.decode(buffer);

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
      rawText = pdfContent.replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s+/g, ' ');
    }

    const pageMatches = pdfContent.match(/\/Type\s*\/Page/g);
    pageCount = pageMatches ? Math.max(1, pageMatches.length) : Math.max(1, Math.ceil(rawText.split(/\s+/).length / 450));
  } else {
    rawText = await file.text();
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
    name,
    filename: name,
    fileSize: file.size,
    sizeFormatted: `${Math.round(file.size / 1024)} KB`,
    mimeType,
    uploadedAt: new Date().toLocaleTimeString(),
    rawText: cleanText,
    pageCount,
    wordCount,
    chunks,
    hash: await calculateSimpleHash(cleanText)
  };
}

export async function extractTextFromFile(file: File): Promise<ExtractionResult> {
  const doc = await extractTextFromLegalFile(file);
  return {
    text: doc.rawText,
    rawText: doc.rawText,
    pageCount: doc.pageCount || 1,
    wordCount: doc.wordCount || doc.rawText.split(/\s+/).length,
    chunks: doc.chunks,
    extractedSections: doc.chunks.map((c) => ({
      title: c.sectionHeader || 'Section',
      text: c.text,
      pageNumber: c.pageNumber
    }))
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
