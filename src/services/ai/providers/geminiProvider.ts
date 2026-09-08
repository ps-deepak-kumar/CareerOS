/**
 * Google Gemini Provider Adapter
 * Free tier: https://aistudio.google.com (requires VITE_GEMINI_API_KEY in .env)
 * Model: gemini-1.5-flash (large context window, generous free quota)
 * Used for: long-context summarization tasks (learning history, full course review)
 */

import type { ProviderCallResult } from './openRouterProvider';

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const MODEL = 'gemini-1.5-flash';
const TIMEOUT_MS = 10_000;

export const callGemini = async (
  prompt: string,
  _taskType: string
): Promise<ProviderCallResult> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your-gemini-key-here') {
    throw new Error('Gemini API key not configured.');
  }

  const url = `${GEMINI_API_BASE}/${MODEL}:generateContent?key=${apiKey}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const start = Date.now();
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    return {
      text,
      provider: 'Google Gemini',
      model: MODEL,
      latencyMs: Date.now() - start,
    };
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
};
