/**
 * Reflection Agent — Phase 5
 *
 * Runs on demand (Profile page button) or after 7 consecutive heatmap activity days.
 * Reviews heatmap activity, quiz history, and goal progress, then produces:
 * - A short natural-language reflection summary
 * - 1–3 concrete roadmap adjustments
 *
 * Routes through the Model Router (never calls providers directly).
 * All steps logged to AgentTerminal.
 * Output persisted to memory via memoryMcp.
 */

import { Profile, Goal } from '../../data/mockData';
import { stateManager, routeAndCall } from '../stateManager';
import { memoryMcp } from '../mcp/memoryMcp';
import { showToast } from '../../components/ToastContainer';

export interface ReflectionResult {
  summary: string;
  adjustments: string[];
  suggestedSlowTopics: string[];
  suggestedFastTopics: string[];
  generatedAt: string;
}

export const reflectionAgent = {
  /**
   * Runs a full weekly reflection analysis.
   * @param profile - The user's current profile
   * @param goals   - The user's current goals
   * @param quizHistory - Optional array of recent quiz results
   */
  runReflection: async (
    profile: Profile,
    goals: Goal[],
    quizHistory?: { topic: string; score: number; total: number }[]
  ): Promise<ReflectionResult> => {
    const logStep = (action: string, message: string, reasoning?: string, status: 'info' | 'success' | 'warning' = 'info') => {
      stateManager.addLog({
        timestamp: new Date().toLocaleTimeString(),
        agent: 'Reflection Agent',
        action,
        status,
        message,
        reasoning,
        tool: 'reflectionAgent.runReflection()'
      });
    };

    logStep('reflection_start', `🪞 Reflection Agent activated — analyzing ${profile.name}'s learning patterns...`, 'Reviewing heatmap, goal progress, and quiz history to produce personalized insights.');

    // ── Gather context ────────────────────────────────────────────────────────
    const activeDays = Object.keys(profile.heatmapActivity ?? {}).filter(d => (profile.heatmapActivity[d] || 0) > 0);
    const streakDays = profile.stats.streakDays ?? 0;
    const completedGoals = goals.filter(g => g.status === 'Completed');
    const behindGoals = goals.filter(g => g.status === 'Behind');
    const activeGoals = goals.filter(g => g.status === 'On Track');

    logStep('context_gathered', `📊 Context: ${activeDays.length} active days, ${streakDays} day streak, ${goals.length} goals (${completedGoals.length} completed, ${behindGoals.length} behind).`, 'Heatmap and goal data collected. Building reflection prompt.');

    // ── Get relevant memories ─────────────────────────────────────────────────
    const memoryContext = await memoryMcp.buildMemoryContext('learning progress reflection', 5);

    // ── Build prompt ──────────────────────────────────────────────────────────
    const quizSummary = quizHistory && quizHistory.length > 0
      ? quizHistory.map(q => `  - ${q.topic}: ${q.score}/${q.total} (${Math.round(q.score / q.total * 100)}%)`).join('\n')
      : '  - No recent quiz data available';

    const goalSummary = goals.slice(0, 6).map(g =>
      `  - "${g.title}" [${g.status}] — ${g.progress}% progress, ${g.streak} day streak`
    ).join('\n');

    const prompt = `You are a personalized learning coach performing a weekly reflection for ${profile.name}.

User stats:
- Active days (last 2 weeks): ${activeDays.length}
- Current streak: ${streakDays} days
- XP earned: ${profile.stats.xp ?? 0}
- Learning hours: ${profile.stats.learningHours}

Goals:
${goalSummary}

Recent Quiz Performance:
${quizSummary}
${memoryContext}

Produce a reflection JSON (no markdown, pure JSON):
{
  "summary": "<2-3 sentence personalized reflection on progress, encouragement, and areas to watch>",
  "adjustments": ["<concrete adjustment 1>", "<concrete adjustment 2>", "<concrete adjustment 3>"],
  "suggestedSlowTopics": ["<topic to slow down on>"],
  "suggestedFastTopics": ["<topic user can accelerate>"]
}`;

    logStep('llm_routing', `🤖 Routing reflection prompt to Model Router (complexity: high)...`, 'Reflection requires reasoning depth — routing to best available provider.');

    // ── Call LLM through router ───────────────────────────────────────────────
    let result: ReflectionResult = {
      summary: `You've been active for ${activeDays.length} days recently with a ${streakDays}-day streak — great consistency! Focus on completing your behind-schedule goals and keep up the momentum.`,
      adjustments: [
        'Review goals marked "Behind" and break them into smaller daily tasks.',
        'Dedicate 15 minutes each morning to reviewing yesterday\'s key concepts.',
        'Schedule a weekly quiz session to reinforce weak areas.',
      ],
      suggestedSlowTopics: behindGoals.map(g => g.title).slice(0, 2),
      suggestedFastTopics: completedGoals.map(g => g.title).slice(0, 1),
      generatedAt: new Date().toISOString(),
    };

    try {
      const llmResult = await routeAndCall('reflect_progress', prompt);
      const jsonMatch = llmResult.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        result = {
          summary: parsed.summary ?? result.summary,
          adjustments: parsed.adjustments ?? result.adjustments,
          suggestedSlowTopics: parsed.suggestedSlowTopics ?? result.suggestedSlowTopics,
          suggestedFastTopics: parsed.suggestedFastTopics ?? result.suggestedFastTopics,
          generatedAt: new Date().toISOString(),
        };
        logStep('llm_complete', `✅ Reflection generated via ${llmResult.provider} (${llmResult.fromCache ? 'cached' : 'fresh'}).`, result.summary.slice(0, 100), 'success');
      }
    } catch (err) {
      logStep('llm_fallback', `⚠️ LLM unavailable — using heuristic reflection. ${err instanceof Error ? err.message : ''}`, 'Fallback reflection based on goal data and heatmap statistics.', 'warning');
    }

    // ── Persist to memory ─────────────────────────────────────────────────────
    await memoryMcp.add_memory(
      'roadmap_feedback',
      `Weekly reflection (${new Date().toLocaleDateString()}): ${result.summary}`,
      { adjustments: result.adjustments, slowTopics: result.suggestedSlowTopics, fastTopics: result.suggestedFastTopics }
    );

    // ── Persist to localStorage ───────────────────────────────────────────────
    try {
      localStorage.setItem('career_os_last_reflection', JSON.stringify(result));
    } catch { /* ignore */ }

    logStep('reflection_complete', `🎯 Reflection complete. ${result.adjustments.length} adjustments generated and persisted to memory.`, undefined, 'success');

    showToast(`🪞 Weekly Reflection complete! ${result.adjustments.length} adjustments generated.`, 'badge');

    return result;
  },

  getLastReflection: (): ReflectionResult | null => {
    try {
      const raw = localStorage.getItem('career_os_last_reflection');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
};
