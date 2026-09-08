import { RoadmapNode, Course } from '../../data/mockData';
import { searchCatalogCourses, generateCustomCourse } from '../../data/coursesData';
import { getGithubReposForTopic } from '../../data/coursesData';
import { stateManager } from '../stateManager';
import { withExponentialBackoff } from '../utils/rateLimiter';
import type { CourseGithubRepo } from '../../data/mockData';

// ─── GitHub REST API (free, 5000 req/hour with token) ─────────────────────────
const GITHUB_API_BASE = 'https://api.github.com';

const searchGitHubRepos = async (topic: string, signal: AbortSignal): Promise<CourseGithubRepo[]> => {
  const token = import.meta.env.VITE_GITHUB_TOKEN;
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
  };
  if (token && token !== 'your-github-token-here') {
    headers['Authorization'] = `token ${token}`;
  }

  const q = encodeURIComponent(`${topic} tutorial learning`);
  const url = `${GITHUB_API_BASE}/search/repositories?q=${q}&sort=stars&order=desc&per_page=5`;
  const res = await fetch(url, { headers, signal });

  if (!res.ok) throw new Error(`GitHub API ${res.status}`);
  const data = await res.json();

  return (data.items ?? []).slice(0, 5).map((repo: any) => ({
    name: repo.name,
    url: repo.html_url,
    description: repo.description?.slice(0, 120) ?? 'No description',
    stars: repo.stargazers_count?.toLocaleString() ?? '0',
    forks: repo.forks_count?.toLocaleString() ?? '0',
    language: repo.language ?? 'Various',
    topics: repo.topics?.slice(0, 4) ?? [],
    cloneCommand: `git clone ${repo.clone_url}`,
  }));
};

export const learningMcp = {
  get_topics: async (goalTitle: string): Promise<string[]> => {
    if (goalTitle.toLowerCase().includes('agentic') || goalTitle.toLowerCase().includes('ai') || goalTitle.toLowerCase().includes('transformer')) {
      return [
        'Neural Networks Foundations', 'Sequence Models & RNNs', 'Introduction to Attention',
        'Self-Attention Mechanics', 'Multi-Head Attention', 'Positional Encoding & Softmax',
        'Transformer Encoder-Decoder', 'LLM Pre-training & Fine-tuning',
        'Agentic Systems & Tool Integration', 'MCP Gateway Project'
      ];
    }
    return ['Foundational Syntax', 'Control Flows', 'Functions & Scopes', 'Object Oriented Programming', 'Advanced Algorithms', 'Capstone Development'];
  },

  get_prerequisites: async (topic: string): Promise<string[]> => {
    const defaultPrereqs: Record<string, string[]> = {
      'Sequence Models & RNNs': ['Neural Networks Foundations'],
      'Introduction to Attention': ['Sequence Models & RNNs'],
      'Self-Attention Mechanics': ['Introduction to Attention'],
      'Multi-Head Attention': ['Self-Attention Mechanics'],
      'Positional Encoding & Softmax': ['Multi-Head Attention'],
      'Transformer Encoder-Decoder': ['Multi-Head Attention', 'Positional Encoding & Softmax'],
      'LLM Pre-training & Fine-tuning': ['Transformer Encoder-Decoder'],
      'Agentic Systems & Tool Integration': ['LLM Pre-training & Fine-tuning'],
      'MCP Gateway Project': ['Agentic Systems & Tool Integration']
    };
    return defaultPrereqs[topic] || [];
  },

  save_roadmap: async (_goalId: string, _nodes: RoadmapNode[]): Promise<{ success: boolean }> => ({ success: true }),

  search_courses: async (query: string, level: string = 'Intermediate', goal: string = 'Master the subject'): Promise<Course[]> =>
    searchCatalogCourses(query, level, goal),

  compare_courses: async (query: string, level: string, goal: string): Promise<Course[]> => {
    const courses = await learningMcp.search_courses(query, level, goal);
    return courses.sort((a, b) => (b.careerOSScore || 0) - (a.careerOSScore || 0));
  },

  /**
   * [UPGRADED Phase 4] Generates a custom roadmap course and enriches it with
   * real GitHub trending repos via the GitHub REST API.
   */
  build_learning_roadmap: async (
    topic: string,
    level: 'Beginner' | 'Intermediate' | 'Advanced',
    goal: string,
    dailyTime: string
  ): Promise<Course> => {
    const course = generateCustomCourse(topic, level, goal, dailyTime);

    // Enrich with real GitHub repos
    try {
      const liveRepos = await withExponentialBackoff(signal => searchGitHubRepos(topic, signal));
      if (liveRepos.length > 0) {
        course.githubRepos = liveRepos;
        stateManager.addLog({
          timestamp: new Date().toLocaleTimeString(),
          agent: 'Resource Curator Agent',
          action: 'github_repos_fetched',
          status: 'success',
          message: `✅ GitHub API: Found ${liveRepos.length} trending repos for "${topic}" (live data).`,
          reasoning: `Repos: ${liveRepos.map(r => r.name).join(', ')}`,
          tool: 'learningMcp.build_learning_roadmap() → GitHub REST API'
        });
      }
    } catch {
      // Fall back to curated mock repos — already set by generateCustomCourse
      course.githubRepos = getGithubReposForTopic(topic);
      stateManager.addLog({
        timestamp: new Date().toLocaleTimeString(),
        agent: 'Resource Curator Agent',
        action: 'github_repos_fallback',
        status: 'warning',
        message: `⚠️ GitHub API unavailable for "${topic}" — using curated offline repos.`,
        reasoning: 'Network error or rate limit reached. Offline data used.',
        tool: 'learningMcp.build_learning_roadmap() → mock fallback'
      });
    }

    return course;
  },

  create_daily_learning_plan: async (courseTitle: string, dailyHours: number): Promise<{ activities: string[]; estimatedMinutes: number }> => {
    const minutes = dailyHours * 60;
    if (minutes <= 30) {
      return { activities: [`📖 Read "${courseTitle}" Chapter overview notes (20m)`, '🧠 Answer 1 chapter quiz question (10m)'], estimatedMinutes: 30 };
    } else if (minutes <= 60) {
      return {
        activities: [
          `🎥 Watch 1 "${courseTitle}" lecture video (25m)`,
          `📖 Read corresponding summary chapter notes (15m)`,
          `🧠 Take chapter assessment quiz (10m)`,
          `💻 Implement practice code snippet exercise (10m)`,
        ],
        estimatedMinutes: 60,
      };
    }
    return {
      activities: [
        `🎥 Watch 2 "${courseTitle}" lecture videos (50m)`,
        `📖 Review comprehensive code repositories (25m)`,
        `🧠 Take chapter assessment quiz (15m)`,
        `💻 Complete hands-on lab assignment code (30m)`,
      ],
      estimatedMinutes: 120,
    };
  },

  create_weekly_learning_plan: async (courseTitle: string): Promise<Record<string, string>> => ({
    'Monday': `Introduction & Chapter 1 for ${courseTitle}`,
    'Tuesday': `Practice problems & terminology reviews`,
    'Wednesday': `Chapter 2: Core implementation structures`,
    'Thursday': `Hands-on practice labs & tests coverage`,
    'Friday': `Chapter 3: Capstone verification & quizzes`,
    'Saturday': `Mini project build and revision tests`,
    'Sunday': `Weekly progress sync & audit reflections`,
  }),
};
