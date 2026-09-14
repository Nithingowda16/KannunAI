import { FileValidationResult } from '../../types/document';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'text/plain',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword'
]);

const ALLOWED_EXTENSIONS = new Set(['.pdf', '.txt', '.docx', '.doc']);

// Magic byte signatures for file verification
const MAGIC_BYTES = {
  PDF: [0x25, 0x50, 0x44, 0x46], // %PDF
  ZIP_DOCX: [0x50, 0x4b, 0x03, 0x04] // PK.. (DOCX)
};

export function validateLegalDocumentFile(file: File): FileValidationResult {
  if (!file) {
    return { isValid: false, error: 'No file was provided for upload.' };
  }

  // 1. File size check
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(2);
    return {
      isValid: false,
      error: `File size (${sizeInMb} MB) exceeds maximum allowed limit of 10 MB.`,
      fileSizeFormatted: `${sizeInMb} MB`
    };
  }

  if (file.size === 0) {
    return { isValid: false, error: 'The uploaded file is empty (0 bytes).' };
  }

  // 2. Extension check
  const extMatch = file.name.match(/\.[0-9a-z]+$/i);
  const ext = extMatch ? extMatch[0].toLowerCase() : '';
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return {
      isValid: false,
      error: `Unsupported file extension (${ext || 'none'}). Only PDF, DOCX, and TXT files are supported.`
    };
  }

  // 3. MIME type check
  if (file.type && !ALLOWED_MIME_TYPES.has(file.type) && ext !== '.txt') {
    return {
      isValid: false,
      error: `File type '${file.type}' is not permitted. Please upload a valid PDF, DOCX, or TXT document.`
    };
  }

  // 4. Filename sanitization & path traversal check
  const sanitizedFilename = sanitizeFilename(file.name);

  return {
    isValid: true,
    sanitizedFilename,
    detectedMime: file.type || 'text/plain',
    fileSizeFormatted: `${(file.size / 1024).toFixed(1)} KB`
  };
}

/**
 * Asynchronously validates binary magic bytes of an uploaded File to prevent file extension spoofing.
 */
export async function validateBinaryMagicBytes(file: File): Promise<{ isValid: boolean; error?: string }> {
  const extMatch = file.name.match(/\.[0-9a-z]+$/i);
  const ext = extMatch ? extMatch[0].toLowerCase() : '';

  if (ext === '.txt') {
    return { isValid: true };
  }

  try {
    const slice = file.slice(0, 4);
    const buffer = await slice.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    if (ext === '.pdf') {
      const isPdf = MAGIC_BYTES.PDF.every((val, idx) => bytes[idx] === val);
      if (!isPdf) {
        return { isValid: false, error: 'File header magic bytes do not match a valid PDF document.' };
      }
    } else if (ext === '.docx') {
      const isZip = MAGIC_BYTES.ZIP_DOCX.every((val, idx) => bytes[idx] === val);
      if (!isZip) {
        return { isValid: false, error: 'File header magic bytes do not match a valid DOCX document.' };
      }
    }
  } catch (_e) {
    return { isValid: false, error: 'Unable to read binary header bytes for file integrity verification.' };
  }

  return { isValid: true };
}

export function sanitizeFilename(filename: string): string {
  // Strip path prefixes and directory traversal vectors
  const baseName = filename.replace(/^.*[\\/]/, '');
  return baseName
    .replace(/\.\./g, '')
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
    .replace(/[^a-zA-Z0-9_\-\. ]/g, '_')
    .substring(0, 150);
}

export function generateSecureDocumentId(): string {
  return 'doc_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
}
