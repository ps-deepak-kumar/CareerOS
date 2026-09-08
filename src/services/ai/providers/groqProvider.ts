/**
 * Groq Provider Adapter
 * Free tier with very high speed: https://console.groq.com (no credit card required)
 * Models: llama-3.1-70b-versatile, mixtral-8x7b-32768
 * Used for: complex tasks needing speed (generate_roadmap, explain_concept, create_quiz)
 */

import type { ProviderCallResult } from './openRouterProvider';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const TIMEOUT_MS = 10_000;

// Pick the best model based on task type
const selectModel = (taskType: string): string => {
  if (
    taskType.includes('roadmap') ||
    taskType.includes('generate') ||
    taskType.includes('reflect')
  ) {
    return 'llama-3.1-70b-versatile'; // High capability for complex generation
  }
  return 'mixtral-8x7b-32768'; // Fast for shorter tasks
};

export const callGroq = async (
  prompt: string,
  taskType: string
): Promise<ProviderCallResult> => {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey || apiKey === 'your-groq-key-here') {
    throw new Error('Groq API key not configured.');
  }

  const model = selectModel(taskType);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const start = Date.now();
  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1024,
        temperature: 0.7,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Groq error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content ?? '';
    return {
      text,
      provider: 'Groq',
      model,
      latencyMs: Date.now() - start,
    };
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
};
