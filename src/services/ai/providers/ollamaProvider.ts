/**
 * Ollama Local Provider Adapter
 * Free, always-available offline fallback using a locally running Ollama instance.
 * Default model: llama3:8b-instruct-q8_0
 * Start Ollama: `ollama serve` + `ollama pull llama3`
 * No API key needed — runs entirely on-device.
 */

import type { ProviderCallResult } from './openRouterProvider';

const OLLAMA_API_URL =
  (import.meta.env.VITE_OLLAMA_BASE_URL ?? 'http://localhost:11434') +
  '/api/generate';
const MODEL = 'llama3:8b-instruct-q8_0';
const TIMEOUT_MS = 10_000;

export const callOllama = async (
  prompt: string,
  _taskType: string
): Promise<ProviderCallResult> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const start = Date.now();
  try {
    const response = await fetch(OLLAMA_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        prompt,
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 512,
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Ollama error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const text = data?.response ?? '';

    return {
      text,
      provider: 'Ollama (Local)',
      model: MODEL,
      latencyMs: Date.now() - start,
    };
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
};
