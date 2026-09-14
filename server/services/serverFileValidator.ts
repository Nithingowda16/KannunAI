/**
 * Server-side File Validation Engine.
 * Performs magic byte buffer inspection, binary size enforcement, and path traversal protection.
 */

export interface ServerValidationResult {
  isValid: boolean;
  error?: string;
  detectedType?: string;
  sanitizedFilename?: string;
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export function validateFileBufferOnServer(
  buffer: Uint8Array,
  originalFilename: string
): ServerValidationResult {
  if (!buffer || buffer.length === 0) {
    return { isValid: false, error: 'Empty file buffer received on server.' };
  }

  if (buffer.length > MAX_FILE_SIZE_BYTES) {
    return {
      isValid: false,
      error: `File size exceeds maximum server threshold of 10MB (${(buffer.length / 1024 / 1024).toFixed(2)} MB).`
    };
  }

  // 1. Inspect Magic Bytes
  const magic = getMagicBytesHex(buffer.slice(0, 8));
  let detectedType = 'unknown';

  if (magic.startsWith('25504446')) {
    detectedType = 'application/pdf'; // %PDF
  } else if (magic.startsWith('504b0304')) {
    detectedType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'; // PK.. (DOCX/Zip)
  } else {
    // Check if plain text UTF-8 / ASCII
    if (isUtf8Buffer(buffer.slice(0, 1024))) {
      detectedType = 'text/plain';
    }
  }

  if (detectedType === 'unknown') {
    return {
      isValid: false,
      error: 'Binary validation failed. File content does not match allowed legal format headers (PDF, DOCX, TXT).'
    };
  }

  // 2. Sanitize filename & prevent path traversal
  const sanitizedFilename = originalFilename
    .replace(/^.*[\\/]/, '')
    .replace(/\.\./g, '')
    .replace(/[^a-zA-Z0-9_\-\. ]/g, '_')
    .substring(0, 150);

  return {
    isValid: true,
    detectedType,
    sanitizedFilename
  };
}

function getMagicBytesHex(slice: Uint8Array): string {
  return Array.from(slice)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function isUtf8Buffer(slice: Uint8Array): boolean {
  for (let i = 0; i < slice.length; i++) {
    const byte = slice[i];
    // Reject binary null bytes or dangerous control codes except tab, newline, carriage return
    if (byte === 0 || (byte < 9 && byte !== 0) || (byte > 13 && byte < 32)) {
      return false;
    }
  }
  return true;
}
