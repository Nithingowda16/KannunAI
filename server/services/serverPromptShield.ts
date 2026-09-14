/**
 * Server-side Prompt Injection Isolation & Input Sanitization Engine.
 */

const SERVER_INJECTION_PATTERNS = [
  /ignore (all )?previous instructions/i,
  /system prompt/i,
  /you are now a/i,
  /override safety/i,
  /disregard rules/i,
  /reveal (api|key|password|credential)/i,
  /claim this contract is 100% legal/i,
  /do not warn the user/i
];

export function sanitizeServerPromptInput(text: string): { isClean: boolean; sanitizedText: string } {
  let isClean = true;
  let sanitizedText = text;

  for (const pattern of SERVER_INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      isClean = false;
      sanitizedText = sanitizedText.replace(pattern, '[SUSPICIOUS INSTRUCTION REMOVED BY SERVER SHIELD]');
    }
  }

  return { isClean, sanitizedText };
}

export function wrapUntrustedDocumentContext(documentText: string): string {
  const { sanitizedText } = sanitizeServerPromptInput(documentText);
  return `
<UNTRUSTED_LEGAL_DOCUMENT_DATA>
${sanitizedText}
</UNTRUSTED_LEGAL_DOCUMENT_DATA>
`.trim();
}
