/**
 * Model Router Agent — v2
 *
 * Replaces the old static if/else rule table with:
 * 1. Heuristic complexity scoring (keywords + description length + context constraints)
 * 2. A ranked provider list with automatic fallback on error/timeout
 * 3. In-memory + localStorage response caching (30-min TTL)
 * 4. Full AgentTerminal logging for every attempt
 *
 * Provider priority (highest → lowest quality/complexity):
 *   OpenRouter (Claude 3.5 Sonnet) → Groq (Llama 3.1 70B) → Gemini 1.5 Flash → Ollama (local)
 */

import { callOpenRouter, type ProviderCallResult } from './providers/openRouterProvider';
import { callGroq } from './providers/groqProvider';
import { callGemini } from './providers/geminiProvider';
import { callOllama } from './providers/ollamaProvider';
import { buildCacheKey, getCache, setCache } from './responseCache';

// ─── Legacy-compatible ModelRouteResult (used by stateManager simulation) ────
export interface ModelRouteResult {
  provider: 'Ollama (Local)' | 'OpenRouter (Cloud)' | 'Groq (Cloud)' | 'Google Gemini (Cloud)';
  modelName: string;
  latencyMs: number;
  reason: string;
}

// ─── Heuristic complexity scoring ─────────────────────────────────────────────

const HIGH_COMPLEXITY_KEYWORDS = [
  'generate', 'roadmap', 'explain', 'compare', 'reflect', 'critique',
  'analyze', 'create_quiz', 'summarize', 'design', 'architecture',
  'learning_path', 'self_critique', 'audit'
];

const MEDIUM_COMPLEXITY_KEYWORDS = [
  'search', 'recommend', 'suggest', 'plan', 'review', 'skill_gap',
  'resource', 'course', 'topic', 'prerequisites'
];

/**
 * Returns a complexity score 0–10 based on:
 * - Keyword matches (high: +2 each, medium: +1 each)
 * - Description length (>500 chars: +2, >200: +1)
 * - Number of constraints in context object
 */
export const scoreComplexity = (
  taskType: string,
  description: string,
  context?: Record<string, unknown>
): number => {
  const combined = (taskType + ' ' + description).toLowerCase();

  let score = 0;

  // Keyword scoring
  HIGH_COMPLEXITY_KEYWORDS.forEach(kw => {
    if (combined.includes(kw)) score += 2;
  });
  MEDIUM_COMPLEXITY_KEYWORDS.forEach(kw => {
    if (combined.includes(kw)) score += 1;
  });

  // Description length scoring
  if (description.length > 500) score += 2;
  else if (description.length > 200) score += 1;

  // Context constraints
  if (context) {
    score += Math.min(Object.keys(context).length, 3); // cap at +3
  }

  return Math.min(score, 10); // cap at 10
};

// ─── Provider selection based on complexity score ─────────────────────────────

type ProviderFn = (prompt: string, taskType: string) => Promise<ProviderCallResult>;

interface RankedProvider {
  name: string;
  fn: ProviderFn;
  minScore: number; // minimum complexity score to use this provider
}

const ALL_PROVIDERS: RankedProvider[] = [
  { name: 'OpenRouter (Claude)', fn: callOpenRouter, minScore: 8 },
  { name: 'Groq (Llama 3.1 70B)', fn: callGroq, minScore: 4 },
  { name: 'Google Gemini 1.5 Flash', fn: callGemini, minScore: 2 },
  { name: 'Ollama (Local Llama3)', fn: callOllama, minScore: 0 },
];

/**
 * Returns a ranked list of providers to try for the given complexity score.
 * The list starts at the appropriate tier and includes all lower-tier providers
 * as fallbacks.
 */
const getRankedProviders = (score: number): RankedProvider[] => {
  // Find the starting index: the highest provider whose minScore ≤ score
  let startIdx = 0;
  for (let i = 0; i < ALL_PROVIDERS.length; i++) {
    if (score >= ALL_PROVIDERS[i].minScore) {
      startIdx = i;
      break;
    }
  }
  return ALL_PROVIDERS.slice(startIdx);
};

// ─── Log type (avoids circular import with stateManager) ──────────────────────
type LogFn = (entry: {
  timestamp: string;
  agent: string;
  action: string;
  status: 'success' | 'info' | 'warning' | 'error';
  message: string;
  reasoning?: string;
  tool?: string;
}) => void;

// Lazy-loaded logger to break circular dependency (stateManager imports modelRouter)
let _logFn: LogFn | null = null;
export const setRouterLogger = (fn: LogFn): void => { _logFn = fn; };
const log = (entry: Parameters<LogFn>[0]) => _logFn?.(entry);

// ─── Core routing + fallback function ─────────────────────────────────────────

/**
 * Routes a prompt to the best available LLM provider.
 * Falls back automatically through the ranked list on timeout or error.
 * Checks and updates the response cache.
 *
 * @returns The text response from the first successful provider.
 */
export const routeAndCall = async (
  taskType: string,
  prompt: string,
  context?: Record<string, unknown>
): Promise<{ text: string; provider: string; model: string; fromCache: boolean }> => {
  // 1. Check cache first
  const cacheKey = buildCacheKey(taskType, prompt);
  const cached = getCache(cacheKey);
  if (cached) {
    log({
      timestamp: new Date().toLocaleTimeString(),
      agent: 'Model Router Agent',
      action: 'cache_hit',
      status: 'info',
      message: `⚡ Cache hit for task "${taskType}". Returning cached ${cached.provider} response.`,
      reasoning: 'Identical request detected in 30-min response cache. Skipping LLM call.',
      tool: 'responseCache.getCache()'
    });
    return { ...cached, fromCache: true };
  }

  // 2. Score complexity and get ranked provider list
  const score = scoreComplexity(taskType, prompt, context);
  const providers = getRankedProviders(score);

  log({
    timestamp: new Date().toLocaleTimeString(),
    agent: 'Model Router Agent',
    action: 'route_decision',
    status: 'info',
    message: `🔀 Complexity score: ${score}/10 for task "${taskType}". Ranked providers: ${providers.map(p => p.name).join(' → ')}`,
    reasoning: `Score derived from keyword analysis + description length (${prompt.length} chars)${context ? ` + ${Object.keys(context).length} context constraints` : ''}.`
  });

  // 3. Try each provider in order, fall back on failure
  let lastError: Error | null = null;
  for (const provider of providers) {
    const start = Date.now();
    try {
      log({
        timestamp: new Date().toLocaleTimeString(),
        agent: 'Model Router Agent',
        action: 'provider_attempt',
        status: 'info',
        message: `🤖 Attempting provider: ${provider.name}...`,
        tool: `${provider.name.split(' ')[0].toLowerCase()}Provider.call()`
      });

      const result = await provider.fn(prompt, taskType);

      log({
        timestamp: new Date().toLocaleTimeString(),
        agent: 'Model Router Agent',
        action: 'provider_success',
        status: 'success',
        message: `✅ ${provider.name} responded in ${result.latencyMs}ms. Model: ${result.model}.`,
        reasoning: `Provider call succeeded. Response length: ${result.text.length} chars.`
      });

      // Cache the successful result
      setCache(cacheKey, result.text, result.provider, result.model);

      return { text: result.text, provider: result.provider, model: result.model, fromCache: false };
    } catch (err) {
      const latencyMs = Date.now() - start;
      lastError = err instanceof Error ? err : new Error(String(err));

      log({
        timestamp: new Date().toLocaleTimeString(),
        agent: 'Model Router Agent',
        action: 'provider_fallback',
        status: 'warning',
        message: `⚠️ ${provider.name} failed after ${latencyMs}ms. Reason: ${lastError.message}. Trying next provider...`,
        reasoning: 'Automatic fallback triggered. Moving to next ranked provider in the chain.'
      });
    }
  }

  // 4. All providers failed — return informative error message
  log({
    timestamp: new Date().toLocaleTimeString(),
    agent: 'Model Router Agent',
    action: 'all_providers_failed',
    status: 'error',
    message: `❌ All providers exhausted for task "${taskType}". Last error: ${lastError?.message ?? 'unknown'}`,
    reasoning: 'No configured providers are available. Check API keys in .env or ensure Ollama is running locally.'
  });

  return {
    text: `[CareerOS AI] Unable to process request "${taskType}" at this time — all providers are currently unavailable. Please check your API keys in the .env file or ensure Ollama is running locally.`,
    provider: 'None',
    model: 'None',
    fromCache: false
  };
};

// ─── Legacy-compatible routeModelRequest (used by existing stateManager simulation) ─
/**
 * Non-async compatibility wrapper for the existing stateManager simulation pipeline.
 * Returns routing metadata (provider, model, latency estimate) without making an actual API call.
 */
export const routeModelRequest = (
  taskType: string,
  description: string,
  context?: Record<string, unknown>
): ModelRouteResult => {
  const score = scoreComplexity(taskType, description, context);

  if (score >= 8) {
    return {
      provider: 'OpenRouter (Cloud)',
      modelName: 'anthropic/claude-3.5-sonnet',
      latencyMs: 1200 + Math.random() * 800,
      reason: `Complexity score ${score}/10 — high reasoning depth task. Route: OpenRouter → Claude 3.5 Sonnet.`,
    };
  }
  if (score >= 4) {
    return {
      provider: 'Groq (Cloud)',
      modelName: 'llama-3.1-70b-versatile',
      latencyMs: 300 + Math.random() * 400,
      reason: `Complexity score ${score}/10 — medium complexity task. Route: Groq → Llama 3.1 70B (fast inference).`,
    };
  }
  if (score >= 2) {
    return {
      provider: 'Google Gemini (Cloud)',
      modelName: 'gemini-1.5-flash',
      latencyMs: 500 + Math.random() * 300,
      reason: `Complexity score ${score}/10 — long-context or moderate task. Route: Gemini 1.5 Flash.`,
    };
  }

  return {
    provider: 'Ollama (Local)',
    modelName: 'llama3:8b-instruct-q8_0',
    latencyMs: 150 + Math.random() * 200,
    reason: `Complexity score ${score}/10 — simple/fast task. Route: Ollama local (zero latency overhead).`,
  };
};
