import { RequestPayload, ValidationResponse, ServerApiResponse } from '../types/api';
import { validateFileBufferOnServer } from '../services/serverFileValidator';

export async function handleValidateRoute(
  payload: RequestPayload,
  securityHeaders: Record<string, string>
): Promise<ServerApiResponse<ValidationResponse>> {
  if (!payload.fileData?.base64 || !payload.fileData?.filename) {
    return {
      status: 400,
      headers: securityHeaders,
      data: { error: 'Missing base64 file data or filename.', code: 'INVALID_PAYLOAD' }
    };
  }

  try {
    const bytes = new Uint8Array(Buffer.from(payload.fileData.base64, 'base64'));
    const validation = validateFileBufferOnServer(bytes, payload.fileData.filename);
    return {
      status: validation.isValid ? 200 : 400,
      headers: securityHeaders,
      data: validation
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to decode binary file stream.';
    return {
      status: 400,
      headers: securityHeaders,
      data: { error: message, code: 'DECODE_ERROR' }
    };
  }
}
