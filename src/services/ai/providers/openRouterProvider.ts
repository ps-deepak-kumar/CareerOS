/**
 * OpenRouter Provider Adapter
 * Routes to Claude 3.5 Sonnet (or claude-3-haiku as cheaper fallback).
 * Used for the highest-complexity tasks: roadmap generation, reflection, self-critique.
 * Free tier: https://openrouter.ai (requires VITE_OPENROUTER_API_KEY in .env)
 */

export interface ProviderCallResult {
  text: string;
  provider: string;
  model: string;
  latencyMs: number;
}

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const TIMEOUT_MS = 10_000;

export const callOpenRouter = async (
  prompt: string,
  taskType: string
): Promise<ProviderCallResult> => {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  if (!apiKey || apiKey === 'your-openrouter-key-here') {
    throw new Error('OpenRouter API key not configured.');
  }

  const model =
    taskType.includes('roadmap') || taskType.includes('reflect')
      ? 'anthropic/claude-3.5-sonnet'
      : 'anthropic/claude-3-haiku';

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const start = Date.now();
  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'CareerOS',
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
      throw new Error(`OpenRouter error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content ?? '';
    return {
      text,
      provider: 'OpenRouter',
      model,
      latencyMs: Date.now() - start,
    };
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
};
