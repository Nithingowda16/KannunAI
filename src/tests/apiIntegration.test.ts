import { describe, test, expect } from 'vitest';
import { handleServerApiRequest } from '../../server/index';
import { API_ACTIONS } from '../../server/types/api';

describe('API Integration Test Matrix - Server Proxy Endpoints', () => {
  test('GET /health endpoint returns 200 and healthy status', async () => {
    const response = await handleServerApiRequest({ action: API_ACTIONS.HEALTH });
    expect(response.status).toBe(200);
    expect(response.data.status).toBe('healthy');
    expect(response.data.service).toContain('KannunAI');
  });

  test('POST /validate-file returns 200 for valid base64 PDF stream', async () => {
    // Valid PDF header "%PDF-1.5..." base64 encoded
    const pdfBase64 = Buffer.from('%PDF-1.5 Sample Document Text Stream').toString('base64');
    const response = await handleServerApiRequest({
      action: API_ACTIONS.VALIDATE_FILE,
      fileData: { base64: pdfBase64, filename: 'contract.pdf' }
    });
    expect(response.status).toBe(200);
    expect(response.data.isValid).toBe(true);
  });

  test('POST /validate-file returns 400 for missing fileData payload', async () => {
    const response = await handleServerApiRequest({ action: API_ACTIONS.VALIDATE_FILE });
    expect(response.status).toBe(400);
    expect(response.data.error).toBeDefined();
  });

  test('POST /analyze-doc returns 400 when documentText is missing', async () => {
    const response = await handleServerApiRequest({ action: API_ACTIONS.ANALYZE_DOC });
    expect(response.status).toBe(400);
    expect(response.data.error).toContain('Document text is required');
  });

  test('POST /qa returns 400 when document or question is missing', async () => {
    const response = await handleServerApiRequest({ action: API_ACTIONS.QA });
    expect(response.status).toBe(400);
    expect(response.data.code).toBe('MISSING_QA_PARAM');
  });

  test('POST /compare returns 400 when document text is missing', async () => {
    const response = await handleServerApiRequest({ action: API_ACTIONS.COMPARE });
    expect(response.status).toBe(400);
    expect(response.data.code).toBe('MISSING_COMPARE_TEXT');
  });

  test('Unknown API action returns 404', async () => {
    const response = await handleServerApiRequest({ action: 'invalid-action' as any });
    expect(response.status).toBe(404);
    expect(response.data.code).toBe('ROUTE_NOT_FOUND');
  });

  test('Rate limit middleware blocks requests exceeding threshold', async () => {
    const floodedIp = '192.168.1.99';
    let lastResponse: any;

    for (let i = 0; i < 65; i++) {
      lastResponse = await handleServerApiRequest(
        { action: API_ACTIONS.HEALTH },
        { ip: floodedIp }
      );
    }

    expect(lastResponse.status).toBe(429);
    expect(lastResponse.data.code).toBe('RATE_LIMIT_EXCEEDED');
  });
});
