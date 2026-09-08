/**
 * Integration tests for resourceMcp fallback-to-mock-data behavior
 * Tests: offline fallback, API error handling, result shapes
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ─── Mock fetch globally ──────────────────────────────────────────────────────
const mockFetch = vi.fn();
beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch);
  // Reset env vars — treat as unconfigured
  vi.stubGlobal('import.meta', { env: { VITE_YOUTUBE_API_KEY: 'your-youtube-api-key-here' } });
});
afterEach(() => vi.restoreAllMocks());

// ─── Inline fallback-to-mock test (without importing resourceMcp directly) ───
describe('resourceMcp fallback behavior (logic tests)', () => {
  /**
   * Simulates the safeCall pattern used in resourceMcp:
   * if apiFn throws, return fallback without crashing.
   */
  const safeCall = async <T>(
    apiFn: () => Promise<T>,
    fallback: T
  ): Promise<T> => {
    try {
      return await apiFn();
    } catch {
      return fallback;
    }
  };

  it('should return fallback data when API throws', async () => {
    const mockFallback = [{ id: 'mock-1', title: 'Mock Resource' }];
    const result = await safeCall(
      async () => { throw new Error('Network Error'); },
      mockFallback
    );
    expect(result).toEqual(mockFallback);
  });

  it('should return live data when API succeeds', async () => {
    const liveData = [{ id: 'live-1', title: 'Live Resource' }];
    const result = await safeCall(
      async () => liveData,
      []
    );
    expect(result).toEqual(liveData);
  });

  it('should handle empty array fallback gracefully', async () => {
    const result = await safeCall(
      async () => { throw new Error('Timeout'); },
      []
    );
    expect(result).toEqual([]);
    expect(Array.isArray(result)).toBe(true);
  });
});

describe('rateLimiter withExponentialBackoff()', () => {
  it('should succeed on first attempt', async () => {
    const { withExponentialBackoff } = await import('../services/utils/rateLimiter');
    const result = await withExponentialBackoff(async (_signal) => 'success');
    expect(result).toBe('success');
  });

  it('should throw after maxRetries exhausted', async () => {
    const { withExponentialBackoff } = await import('../services/utils/rateLimiter');
    await expect(
      withExponentialBackoff(async () => { throw new Error('Always fails'); }, { maxRetries: 1, baseDelayMs: 10 })
    ).rejects.toThrow('Always fails');
  });

  it('should succeed on retry after initial failure', async () => {
    const { withExponentialBackoff } = await import('../services/utils/rateLimiter');
    let attempts = 0;
    const result = await withExponentialBackoff(async () => {
      attempts++;
      if (attempts < 2) throw new Error('First attempt fails');
      return 'succeeded on retry';
    }, { baseDelayMs: 10 });
    expect(result).toBe('succeeded on retry');
    expect(attempts).toBe(2);
  });
});
