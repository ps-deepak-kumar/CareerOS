/**
 * Memory MCP Server — Phase 3
 *
 * MCP tool server exposing add_memory and get_relevant_memories.
 * Uses semanticSimilarity.ts for embeddings + vectorStore.ts for retrieval.
 * Any agent can use this through the same MCP pattern as the rest of the system.
 */

import { embedText } from '../ai/semanticSimilarity';
import { addRecord, queryTopK, type MemoryCategory, type MemoryRecord } from '../memory/vectorStore';
import { stateManager } from '../stateManager';

export const memoryMcp = {
  /**
   * Embed content and store a new memory record.
   * @param category - Type of memory (quiz_mistake, goal_completed, preference, roadmap_feedback)
   * @param content  - Human-readable summary of the memory
   * @param metadata - Structured data (topic, score, goalId, etc.)
   */
  add_memory: async (
    category: MemoryCategory,
    content: string,
    metadata: Record<string, unknown> = {}
  ): Promise<{ id: string; success: boolean }> => {
    try {
      const vector = await embedText(content);
      const record = addRecord(category, content, metadata, vector);

      stateManager.addLog({
        timestamp: new Date().toLocaleTimeString(),
        agent: 'Orchestrator Agent',
        action: 'memory_stored',
        status: 'info',
        message: `💾 Memory stored [${category}]: "${content.slice(0, 80)}${content.length > 80 ? '…' : ''}"`,
        reasoning: `Embedded via all-MiniLM-L6-v2 and indexed to in-browser vector store. Record ID: ${record.id}`,
        tool: 'memoryMcp.add_memory()'
      });

      return { id: record.id, success: true };
    } catch (err) {
      stateManager.addLog({
        timestamp: new Date().toLocaleTimeString(),
        agent: 'Orchestrator Agent',
        action: 'memory_failed',
        status: 'warning',
        message: `⚠️ Memory storage failed for [${category}]: ${err instanceof Error ? err.message : 'unknown error'}`,
        reasoning: 'Embedding model may not be loaded yet. Memory will be skipped.',
        tool: 'memoryMcp.add_memory()'
      });
      return { id: '', success: false };
    }
  },

  /**
   * Retrieve the top-k most semantically relevant memories for a given query.
   * @param query    - Natural language query (e.g. topic name, user intent)
   * @param k        - Number of records to return (default: 3)
   * @param category - Optional category filter
   * @returns Array of memory records sorted by relevance
   */
  get_relevant_memories: async (
    query: string,
    k: number = 3,
    category?: MemoryCategory
  ): Promise<MemoryRecord[]> => {
    try {
      const queryVec = await embedText(query);
      const results = queryTopK(queryVec, k, category);

      if (results.length > 0) {
        stateManager.addLog({
          timestamp: new Date().toLocaleTimeString(),
          agent: 'Orchestrator Agent',
          action: 'memory_retrieved',
          status: 'info',
          message: `🔍 Retrieved ${results.length} relevant memor${results.length === 1 ? 'y' : 'ies'} for query: "${query.slice(0, 60)}"`,
          reasoning: `Top results: ${results.map(r => `"${r.content.slice(0, 40)}"`).join(', ')}`,
          tool: 'memoryMcp.get_relevant_memories()'
        });
      }

      return results;
    } catch {
      // Silently return empty if model not loaded — non-blocking
      return [];
    }
  },

  /**
   * Build a context string from memories to inject into an LLM prompt.
   * Returns an empty string if no memories are found.
   */
  buildMemoryContext: async (query: string, k: number = 3): Promise<string> => {
    const memories = await memoryMcp.get_relevant_memories(query, k);
    if (memories.length === 0) return '';

    const lines = memories.map(m => {
      const date = new Date(m.timestamp).toLocaleDateString();
      return `- [${m.category.replace('_', ' ')} on ${date}] ${m.content}`;
    });

    return `\nRelevant user history (personalize response using this):\n${lines.join('\n')}\n`;
  }
};
