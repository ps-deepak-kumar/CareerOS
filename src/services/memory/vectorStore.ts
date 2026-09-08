/**
 * Vector Store — Phase 3
 *
 * Lightweight in-browser vector index backed by localStorage.
 * No server needed. Uses plain Float32Array + cosine similarity.
 *
 * Stores embedded records: quiz mistakes, completed goals, preferences, roadmap feedback.
 */

import { cosineSimilarity } from '../ai/semanticSimilarity';

export type MemoryCategory =
  | 'quiz_mistake'
  | 'goal_completed'
  | 'preference'
  | 'roadmap_feedback';

export interface MemoryRecord {
  id: string;
  category: MemoryCategory;
  content: string; // human-readable memory content
  metadata: Record<string, unknown>;
  vector: number[]; // stored as plain array for JSON serialisation
  timestamp: number; // epoch ms
}

const STORAGE_KEY = 'career_os_memory';
const MAX_RECORDS = 500; // cap to avoid localStorage quota issues

// ─── Internal store ───────────────────────────────────────────────────────────
let records: MemoryRecord[] = [];

const loadFromStorage = (): void => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) records = JSON.parse(raw);
  } catch {
    records = [];
  }
};

const persistToStorage = (): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // Quota exceeded — prune oldest 20% and retry
    records = records.slice(Math.floor(records.length * 0.2));
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(records)); } catch { /* ignore */ }
  }
};

// Initialise on module load
loadFromStorage();

// ─── Public API ───────────────────────────────────────────────────────────────

export const addRecord = (
  category: MemoryCategory,
  content: string,
  metadata: Record<string, unknown>,
  vector: Float32Array
): MemoryRecord => {
  const record: MemoryRecord = {
    id: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    category,
    content,
    metadata,
    vector: Array.from(vector),
    timestamp: Date.now(),
  };

  records.push(record);

  // Cap at MAX_RECORDS (remove oldest)
  if (records.length > MAX_RECORDS) {
    records = records.slice(records.length - MAX_RECORDS);
  }

  persistToStorage();
  return record;
};

export const queryTopK = (
  queryVector: Float32Array,
  k: number,
  filterCategory?: MemoryCategory
): MemoryRecord[] => {
  const pool = filterCategory
    ? records.filter(r => r.category === filterCategory)
    : records;

  if (pool.length === 0) return [];

  const scored = pool.map(r => ({
    record: r,
    score: cosineSimilarity(queryVector, new Float32Array(r.vector)),
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, k).map(s => s.record);
};

export const getAllRecords = (): MemoryRecord[] => [...records];

export const clearMemory = (): void => {
  records = [];
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
};
