import { DocumentAnalysis, QuestionAnswerResponse } from '../../src/types/analysis';
import { UploadedDocument } from '../../src/types/document';
import { ComparisonResult } from '../../src/types/comparison';

export const API_ACTIONS = {
  HEALTH: 'health',
  VALIDATE_FILE: 'validate-file',
  ANALYZE_DOC: 'analyze-doc',
  QA: 'qa',
  COMPARE: 'compare'
} as const;

export type ApiAction = typeof API_ACTIONS[keyof typeof API_ACTIONS];

export type ApiStatus = 200 | 400 | 404 | 429 | 500 | 502 | 503;

export interface HealthResponse {
  status: 'healthy';
  timestamp: string;
  service: string;
}

export interface ValidationResponse {
  isValid: boolean;
  error?: string;
  sanitizedFilename?: string;
  fileSizeFormatted?: string;
}

export interface ErrorResponse {
  error: string;
  code?: string;
}

export interface RequestPayload {
  action: ApiAction;
  fileData?: {
    base64: string;
    filename: string;
  };
  documentText?: string;
  document?: UploadedDocument;
  question?: string;
  history?: Array<{ question: string; answer: string }>;
  documentA?: UploadedDocument;
  documentB?: UploadedDocument;
}

export type ServerApiResponse<T> =
  | { status: 200; headers: Record<string, string>; data: T }
  | { status: Exclude<ApiStatus, 200>; headers: Record<string, string>; data: ErrorResponse };
