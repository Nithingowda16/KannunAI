# Security Architecture & Controls — Lexora

## 1. Secrets Boundary
- API keys (`GEMINI_API_KEY`) remain strictly contained in server-side environment variables.
- Client requests pass through the server proxy endpoint (`server/index.ts`).

## 2. Server-Side File Handling & Integrity
- Binary magic byte validation (`serverFileValidator.ts`) checks `%PDF` and `PK\x03\x04` headers to prevent file extension spoofing.
- Strict 10MB binary size limit enforced on server and client.
- Filename sanitization strips relative path traversal sequences (`../`, `..\\`) and control characters.

## 3. Indirect Prompt Injection Defense
- Uploaded legal contracts are treated strictly as passive text **DATA ONLY**.
- Regex pattern matching scrubs injection strings (`ignore previous instructions`, `you are now a lawyer who guarantees victory`).
- System prompts wrap context in XML data tags (`<UNTRUSTED_LEGAL_DOCUMENT_DATA>`).

## 4. Abuse Prevention & Privacy
- In-memory token-bucket rate limiting restricts IP requests to 30 calls per minute.
- Ephemeral processing: Document text is parsed in memory and destroyed according to retention rules. No user document text is written to persistent database storage.
