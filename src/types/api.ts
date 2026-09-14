import { UploadedDocument } from './document';
import { QAPair } from './qa';

export const API_ACTIONS = {
  HEALTH: 'health',
  VALIDATE_FILE: 'validate-file',
  ANALYZE_DOC: 'analyze-doc',
  QA: 'qa',
  COMPARE: 'compare'
} as const;

export type ApiAction = typeof API_ACTIONS[keyof typeof API_ACTIONS];
export type ApiStatus = 200 | 400 | 404 | 429 | 500 | 502 | 503;

export interface ApiRequestPayload {
  action: ApiAction;
  documentText?: string;
  document?: UploadedDocument;
  question?: string;
  history?: QAPair[];
  documentA?: UploadedDocument;
  documentB?: UploadedDocument;
  fileData?: {
    base64: string;
    filename: string;
  };
}

export type ApiResponse<T> =
  | { ok: true; status: 200; data: T }
  | { ok: false; status: Exclude<ApiStatus, 200>; error: string; code?: string };
