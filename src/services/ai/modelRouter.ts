export interface ModelRouteResult {
  provider: 'Ollama (Local)' | 'OpenRouter (Cloud)';
  modelName: string;
  latencyMs: number;
  reason: string;
}

export const routeModelRequest = (taskType: string, description: string): ModelRouteResult => {
  // Logic to determine routing
  const lowercaseType = taskType.toLowerCase();
  
  if (
    lowercaseType.includes('generate_roadmap') ||
    lowercaseType.includes('explain_concept') ||
    lowercaseType.includes('reflect_progress') ||
    lowercaseType.includes('create_quiz') ||
    description.length > 500
  ) {
    return {
      provider: 'OpenRouter (Cloud)',
      modelName: 'anthropic/claude-3.5-sonnet',
      latencyMs: 1200 + Math.random() * 800,
      reason: 'Task requires high reasoning depth, structured output parsing, and advanced semantic mapping.'
    };
  }
  
  return {
    provider: 'Ollama (Local)',
    modelName: 'llama3:8b-instruct-q8_0',
    latencyMs: 150 + Math.random() * 200,
    reason: 'Task matches local categorization template. Fast response prioritized with low overhead.'
  };
};
