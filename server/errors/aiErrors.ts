export class ServerAIError extends Error {
  constructor(message: string, public readonly code: string = 'SERVER_AI_ERROR', public readonly statusCode: number = 500) {
    super(message);
    this.name = 'ServerAIError';
  }
}

export class ServerAIUnavailableError extends ServerAIError {
  constructor(message: string = 'GEMINI_API_KEY is not configured or server AI service is offline.') {
    super(message, 'AI_UNAVAILABLE', 503);
    this.name = 'ServerAIUnavailableError';
  }
}

export class ServerAIRateLimitError extends ServerAIError {
  constructor(message: string = 'Too many requests. Please slow down and try again.') {
    super(message, 'RATE_LIMIT_EXCEEDED', 429);
    this.name = 'ServerAIRateLimitError';
  }
}

export class ServerAIInvalidResponseError extends ServerAIError {
  constructor(message: string = 'AI returned malformed or unparsable output.') {
    super(message, 'INVALID_AI_RESPONSE', 502);
    this.name = 'ServerAIInvalidResponseError';
  }
}
