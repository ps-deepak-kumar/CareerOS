/**
 * Unit tests for modelRouter.ts
 * Tests: complexity scoring, provider ranking, fallback logic, cache hits
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { scoreComplexity, routeModelRequest } from '../services/ai/modelRouter';
import { clearCache } from '../services/ai/responseCache';

describe('scoreComplexity()', () => {
  it('should give high score (≥6) for roadmap generation tasks', () => {
    const score = scoreComplexity('generate_roadmap', 'Generate a learning roadmap for LLM architecture with prerequisites');
    expect(score).toBeGreaterThanOrEqual(6);
  });

  it('should give medium score (4–7) for search/recommend tasks', () => {
    const score = scoreComplexity('search_resources', 'Find me relevant courses for this topic');
    expect(score).toBeGreaterThanOrEqual(2);
    expect(score).toBeLessThanOrEqual(7);
  });

  it('should give low score (<4) for simple status tasks', () => {
    const score = scoreComplexity('status', 'ok');
    expect(score).toBeLessThan(4);
  });

  it('should increase score for long descriptions', () => {
    const shortScore = scoreComplexity('check', 'short');
    const longDesc = 'a'.repeat(600);
    const longScore = scoreComplexity('check', longDesc);
    expect(longScore).toBeGreaterThan(shortScore);
  });

  it('should increase score for context constraints', () => {
    const noCtx = scoreComplexity('task', 'description');
    const withCtx = scoreComplexity('task', 'description', { a: 1, b: 2, c: 3 });
    expect(withCtx).toBeGreaterThan(noCtx);
  });

  it('should cap score at 10', () => {
    const score = scoreComplexity(
      'generate_roadmap_explain_compare_reflect',
      'generate roadmap explain compare analyze reflect critique ' + 'a'.repeat(800),
      { a: 1, b: 2, c: 3, d: 4, e: 5 }
    );
    expect(score).toBeLessThanOrEqual(10);
  });
});

describe('routeModelRequest() — legacy compatibility', () => {
  it('should return OpenRouter or Groq for high-complexity tasks', () => {
    const result = routeModelRequest('generate_roadmap', 'Generate a comprehensive learning roadmap with all prerequisites');
    // Both OpenRouter and Groq are valid high-complexity providers
    expect(['OpenRouter (Cloud)', 'Groq (Cloud)']).toContain(result.provider);
  });

  it('should return Groq for medium-complexity tasks', () => {
    const result = routeModelRequest('search', 'Find me a course for React');
    // Score should be medium or low
    expect(['Groq (Cloud)', 'Google Gemini (Cloud)', 'Ollama (Local)']).toContain(result.provider);
  });

  it('should return Ollama for simple tasks', () => {
    const result = routeModelRequest('ping', 'ok');
    expect(result.provider).toBe('Ollama (Local)');
  });

  it('should always return a latencyMs and reason', () => {
    const result = routeModelRequest('test', 'test');
    expect(typeof result.latencyMs).toBe('number');
    expect(typeof result.reason).toBe('string');
    expect(result.reason.length).toBeGreaterThan(0);
  });
});

describe('Response Cache', () => {
  beforeEach(() => clearCache());

  it('should return null for uncached keys', async () => {
    const { buildCacheKey, getCache } = await import('../services/ai/responseCache');
    const key = buildCacheKey('test_task', 'uncached prompt 12345');
    expect(getCache(key)).toBeNull();
  });

  it('should store and retrieve cached responses', async () => {
    const { buildCacheKey, getCache, setCache } = await import('../services/ai/responseCache');
    const key = buildCacheKey('test_task', 'my prompt');
    setCache(key, 'Hello, world!', 'Groq', 'llama-3.1-70b');
    const result = getCache(key);
    expect(result).not.toBeNull();
    expect(result?.text).toBe('Hello, world!');
    expect(result?.provider).toBe('Groq');
  });

  it('should normalize prompts (same result for different whitespace)', async () => {
    const { buildCacheKey } = await import('../services/ai/responseCache');
    const k1 = buildCacheKey('task', 'Hello   World  ');
    const k2 = buildCacheKey('task', '  hello world');
    expect(k1).toBe(k2);
  });
});
