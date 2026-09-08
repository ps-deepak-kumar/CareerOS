/**
 * Semantic Similarity Module — Phase 2
 *
 * Uses @xenova/transformers with Xenova/all-MiniLM-L6-v2 (25MB, cached after first load).
 * Provides:
 * - embedText(text) → Float32Array
 * - cosineSimilarity(a, b) → number 0–1
 * - detectDuplicates(chapters) → DuplicateWarning[]
 * - checkTopicRelevance(topic, text) → number 0–1
 *
 * Model downloads from HuggingFace on first use (requires internet), then caches locally.
 */

// Dynamic import to avoid bundling the full model at build time
let pipeline: any = null;
let extractor: any = null;
let isLoading = false;
let loadError: string | null = null;

const MODEL_ID = 'Xenova/all-MiniLM-L6-v2';

/**
 * Lazily initialises the embedding pipeline. Safe to call multiple times.
 */
const getExtractor = async (): Promise<any> => {
  if (extractor) return extractor;
  if (isLoading) {
    // Wait for ongoing load
    return new Promise((resolve, reject) => {
      const poll = setInterval(() => {
        if (extractor) { clearInterval(poll); resolve(extractor); }
        if (loadError) { clearInterval(poll); reject(new Error(loadError)); }
      }, 200);
    });
  }

  isLoading = true;
  try {
    // Dynamic import — only pulled into the bundle if this module is used
    const { pipeline: createPipeline } = await import('@xenova/transformers');
    pipeline = createPipeline;
    extractor = await (pipeline as any)('feature-extraction', MODEL_ID, {
      quantized: true, // use quantized model for smaller size
    });
    isLoading = false;
    return extractor;
  } catch (err) {
    isLoading = false;
    loadError = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to load embedding model: ${loadError}`);
  }
};

/**
 * Embed a string into a Float32Array vector using all-MiniLM-L6-v2.
 */
export const embedText = async (text: string): Promise<Float32Array> => {
  const model = await getExtractor();
  const output = await model(text, { pooling: 'mean', normalize: true });
  return output.data as Float32Array;
};

/**
 * Cosine similarity between two vectors. Returns 0–1.
 */
export const cosineSimilarity = (a: Float32Array, b: Float32Array): number => {
  if (a.length !== b.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
};

export interface DuplicateWarning {
  indexA: number;
  indexB: number;
  titleA: string;
  titleB: string;
  similarity: number; // 0–1
}

const DUPLICATE_THRESHOLD = 0.85;

/**
 * Check all pairs of chapter explanations for near-duplicate content.
 * Returns pairs with cosine similarity above DUPLICATE_THRESHOLD.
 */
export const detectDuplicates = async (
  chapters: { title: string; explanation?: string; analogy?: string }[]
): Promise<DuplicateWarning[]> => {
  const warnings: DuplicateWarning[] = [];
  if (chapters.length < 2) return warnings;

  // Embed all chapters (concatenate title + explanation for richer signal)
  const texts = chapters.map(ch =>
    `${ch.title}. ${ch.explanation ?? ''} ${ch.analogy ?? ''}`.slice(0, 512)
  );

  const embeddings = await Promise.all(texts.map(embedText));

  for (let i = 0; i < embeddings.length; i++) {
    for (let j = i + 1; j < embeddings.length; j++) {
      const sim = cosineSimilarity(embeddings[i], embeddings[j]);
      if (sim >= DUPLICATE_THRESHOLD) {
        warnings.push({
          indexA: i,
          indexB: j,
          titleA: chapters[i].title,
          titleB: chapters[j].title,
          similarity: Math.round(sim * 100) / 100,
        });
      }
    }
  }

  return warnings;
};

/**
 * Check how semantically relevant a block of text is to a given topic.
 * Returns a relevance score 0–1 (below 0.25 suggests filler content).
 */
export const checkTopicRelevance = async (
  topic: string,
  text: string
): Promise<number> => {
  const [topicVec, textVec] = await Promise.all([
    embedText(topic),
    embedText(text.slice(0, 512)),
  ]);
  return cosineSimilarity(topicVec, textVec);
};
