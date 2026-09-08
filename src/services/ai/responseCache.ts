/**
 * Response Cache — in-memory + localStorage persistence
 * Keyed by a lightweight hash of (taskType + normalized prompt).
 * TTL: 30 minutes. Prevents duplicate LLM calls for identical requests
 * (e.g. re-opening the same course triggers the same verification prompt).
 */

const CACHE_KEY = 'career_os_llm_cache';
const TTL_MS = 30 * 60 * 1000; // 30 minutes

interface CacheEntry {
  text: string;
  provider: string;
  model: string;
  cachedAt: number; // epoch ms
}

type CacheStore = Record<string, CacheEntry>;

// ─── Lightweight hash (djb2) ─────────────────────────────────────────────────
const hash = (str: string): string => {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h) ^ str.charCodeAt(i);
    h = h >>> 0; // keep unsigned 32-bit
  }
  return h.toString(36);
};

// Normalize prompt: lowercase, collapse whitespace, trim
const normalize = (s: string): string =>
  s.toLowerCase().replace(/\s+/g, ' ').trim();

export const buildCacheKey = (taskType: string, prompt: string): string =>
  hash(taskType + '::' + normalize(prompt));

// ─── In-memory layer ─────────────────────────────────────────────────────────
const memCache = new Map<string, CacheEntry>();

// ─── Load from localStorage on module init ───────────────────────────────────
const loadFromStorage = (): void => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return;
    const store: CacheStore = JSON.parse(raw);
    const now = Date.now();
    for (const [k, v] of Object.entries(store)) {
      if (now - v.cachedAt < TTL_MS) {
        memCache.set(k, v);
      }
    }
  } catch {
    /* ignore corrupt cache */
  }
};
loadFromStorage();

// ─── Persist to localStorage ─────────────────────────────────────────────────
const persistToStorage = (): void => {
  try {
    const store: CacheStore = {};
    memCache.forEach((v, k) => {
      store[k] = v;
    });
    localStorage.setItem(CACHE_KEY, JSON.stringify(store));
  } catch {
    /* ignore quota errors */
  }
};

// ─── Public API ───────────────────────────────────────────────────────────────

export const getCache = (
  key: string
): { text: string; provider: string; model: string } | null => {
  const entry = memCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.cachedAt > TTL_MS) {
    memCache.delete(key);
    return null;
  }
  return { text: entry.text, provider: entry.provider, model: entry.model };
};

export const setCache = (
  key: string,
  text: string,
  provider: string,
  model: string
): void => {
  memCache.set(key, { text, provider, model, cachedAt: Date.now() });
  persistToStorage();
};

export const clearCache = (): void => {
  memCache.clear();
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch { /* ignore */ }
};
