/**
 * Rate Limiter Utility — Phase 6 (built early for use throughout Phase 4)
 *
 * Wraps async functions with exponential backoff + jitter.
 * Retries on network errors and HTTP 429 (rate limit) responses.
 * All external API calls (YouTube, arXiv, GitHub, Groq, Gemini, Adzuna) use this.
 */

export interface BackoffOptions {
  maxRetries?: number;      // default: 3
  baseDelayMs?: number;     // default: 500ms
  timeoutMs?: number;       // per-attempt timeout (default: 7000ms)
}

/**
 * Wraps an async function with exponential backoff + jitter.
 * Retries on any thrown error or AbortError (timeout).
 */
export const withExponentialBackoff = async <T>(
  fn: (signal: AbortSignal) => Promise<T>,
  options: BackoffOptions = {}
): Promise<T> => {
  const { maxRetries = 3, baseDelayMs = 500, timeoutMs = 7000 } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const result = await fn(controller.signal);
      clearTimeout(timeoutId);
      return result;
    } catch (err) {
      clearTimeout(timeoutId);
      lastError = err instanceof Error ? err : new Error(String(err));

      // Don't retry if this is the last attempt
      if (attempt === maxRetries) break;

      // Exponential backoff with ±20% jitter
      const delay = baseDelayMs * Math.pow(2, attempt);
      const jitter = delay * 0.2 * (Math.random() * 2 - 1);
      await new Promise(resolve => setTimeout(resolve, Math.max(0, delay + jitter)));
    }
  }

  throw lastError ?? new Error('Unknown error in withExponentialBackoff');
};
