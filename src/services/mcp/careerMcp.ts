import { Goal, initialGoals } from '../../data/mockData';
import { withExponentialBackoff } from '../utils/rateLimiter';

// ─── RemoteOK API (free, no key, CORS-friendly) ───────────────────────────────
const REMOTEOK_BASE = 'https://remoteok.com/api';

interface RemoteOKJob {
  position?: string;
  tags?: string[];
  description?: string;
}

const fetchJobMarketSkills = async (role: string, signal: AbortSignal): Promise<string[]> => {
  const url = `${REMOTEOK_BASE}?tag=${encodeURIComponent(role.toLowerCase().replace(/\s+/g, '-'))}`;
  const res = await fetch(url, {
    signal,
    headers: { 'User-Agent': 'CareerOS/1.0' }
  });
  if (!res.ok) throw new Error(`RemoteOK API ${res.status}`);
  const data: (RemoteOKJob | { legal?: string })[] = await res.json();

  // Skip the first item (legal notice), extract tags from job listings
  const jobs = data.slice(1, 11) as RemoteOKJob[];
  const tagSet = new Set<string>();
  jobs.forEach(job => {
    (job.tags ?? []).forEach(tag => {
      if (tag.length > 1 && tag.length < 30) tagSet.add(tag);
    });
  });

  return Array.from(tagSet).slice(0, 15);
};

// ─── Fallback skill maps by role ──────────────────────────────────────────────
const FALLBACK_SKILLS: Record<string, string[]> = {
  default: ['Python', 'Machine Learning', 'System Design', 'Communication', 'Problem Solving'],
  ai: ['LLMs', 'RAG', 'PyTorch', 'Transformers', 'Vector Databases', 'MCP', 'Agentic AI'],
  frontend: ['React', 'TypeScript', 'CSS', 'Performance', 'Accessibility', 'Testing'],
  backend: ['Node.js', 'REST APIs', 'SQL', 'Microservices', 'Docker', 'Kubernetes'],
  cloud: ['AWS', 'Azure', 'GCP', 'Infrastructure as Code', 'CI/CD', 'Cost Optimization'],
};

const getFallbackSkills = (role: string): string[] => {
  const r = role.toLowerCase();
  if (r.includes('ai') || r.includes('ml') || r.includes('llm') || r.includes('agent')) return FALLBACK_SKILLS.ai;
  if (r.includes('frontend') || r.includes('react') || r.includes('ui')) return FALLBACK_SKILLS.frontend;
  if (r.includes('backend') || r.includes('node') || r.includes('api')) return FALLBACK_SKILLS.backend;
  if (r.includes('cloud') || r.includes('devops') || r.includes('aws')) return FALLBACK_SKILLS.cloud;
  return FALLBACK_SKILLS.default;
};

// ─── MCP Server ───────────────────────────────────────────────────────────────
export const careerMcp = {
  get_goals: async (): Promise<Goal[]> => initialGoals,

  create_goal: async (goalData: Omit<Goal, 'id' | 'createdAt' | 'progress' | 'streak'>): Promise<Goal> => ({
    ...goalData,
    id: `goal-${Date.now()}`,
    progress: 0,
    streak: 0,
    createdAt: new Date().toISOString().split('T')[0],
  }),

  get_user_skills: async (): Promise<{ name: string; level: number }[]> => [
    { name: 'AI / ML Foundations', level: 82 },
    { name: 'LLMs & Prompt Engineering', level: 74 },
    { name: 'Agentic AI & MCP', level: 61 },
    { name: 'System Design', level: 43 },
  ],

  save_skill_gap: async (goalId: string, gaps: string[]): Promise<{ saved: boolean; count: number }> =>
    ({ saved: true, count: gaps.length }),

  /**
   * [NEW Phase 4] Fetch real job-market trending skills for a role from RemoteOK.
   * Falls back to curated skill map if API unavailable.
   */
  get_job_market_skills: async (role: string): Promise<{ skills: string[]; source: 'live' | 'cached' }> => {
    try {
      const skills = await withExponentialBackoff(signal => fetchJobMarketSkills(role, signal));
      if (skills.length > 0) {
        return { skills, source: 'live' };
      }
      return { skills: getFallbackSkills(role), source: 'cached' };
    } catch {
      return { skills: getFallbackSkills(role), source: 'cached' };
    }
  },
};
