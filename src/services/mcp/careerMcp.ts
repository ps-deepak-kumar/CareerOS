import { Goal, initialGoals } from '../../data/mockData';

export const careerMcp = {
  get_goals: async (): Promise<Goal[]> => {
    return initialGoals;
  },

  create_goal: async (goalData: Omit<Goal, 'id' | 'createdAt' | 'progress' | 'streak'>): Promise<Goal> => {
    const newGoal: Goal = {
      ...goalData,
      id: `goal-${Date.now()}`,
      progress: 0,
      streak: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    return newGoal;
  },

  get_user_skills: async (): Promise<{ name: string; level: number }[]> => {
    return [
      { name: "AI / ML Foundations", level: 82 },
      { name: "LLMs & Prompt Engineering", level: 74 },
      { name: "Agentic AI & MCP", level: 61 },
      { name: "System Design", level: 43 }
    ];
  },

  save_skill_gap: async (goalId: string, gaps: string[]): Promise<{ saved: boolean; count: number }> => {
    return { saved: true, count: gaps.length };
  }
};
