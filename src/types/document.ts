export interface UploadedDocument {
  id: string;
  name: string;
  filename?: string;
  fileSize?: number;
  sizeFormatted?: string;
  mimeType?: string;
  uploadedAt: string;
  rawText: string;
  pageCount?: number;
  wordCount?: number;
  chunks: DocumentChunk[];
  hash?: string;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  chunkIndex: number;
  text: string;
  sectionHeader?: string;
  pageNumber: number;
  startChar: number;
  endChar: number;
}

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedFilename?: string;
  detectedMime?: string;
  fileSizeFormatted?: string;
}

export interface DocumentMetadata {
  documentType: string;
  apparentPurpose: string;
  parties: string[];
  effectiveDate: string;
  duration: string;
  governingLaw: string;
}
