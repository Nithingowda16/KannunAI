export class AIError extends Error {
  constructor(message: string, public readonly code: string = 'AI_ERROR') {
    super(message);
    this.name = 'AIError';
  }
}

export class AIUnavailableError extends AIError {
  constructor(message: string = 'Gemini AI service is currently unavailable.') {
    super(message, 'AI_UNAVAILABLE');
    this.name = 'AIUnavailableError';
  }
}

export class AIRateLimitError extends AIError {
  constructor(message: string = 'Rate limit exceeded for AI analysis.') {
    super(message, 'AI_RATE_LIMIT');
    this.name = 'AIRateLimitError';
  }
}

export class AIInvalidResponseError extends AIError {
  constructor(message: string = 'AI model returned an invalid or malformed response.') {
    super(message, 'AI_INVALID_RESPONSE');
    this.name = 'AIInvalidResponseError';
  }
}

export class AITimeoutError extends AIError {
  constructor(message: string = 'AI request timed out.') {
    super(message, 'AI_TIMEOUT');
    this.name = 'AITimeoutError';
  }
}
