import { RoadmapNode, Course } from '../../data/mockData';
import { searchCatalogCourses, generateCustomCourse } from '../../data/coursesData';
import { stateManager } from '../stateManager';

export const learningMcp = {
  get_topics: async (goalTitle: string): Promise<string[]> => {
    if (goalTitle.toLowerCase().includes('agentic') || goalTitle.toLowerCase().includes('ai') || goalTitle.toLowerCase().includes('transformer')) {
      return [
        'Neural Networks Foundations',
        'Sequence Models & RNNs',
        'Introduction to Attention',
        'Self-Attention Mechanics',
        'Multi-Head Attention',
        'Positional Encoding & Softmax',
        'Transformer Encoder-Decoder',
        'LLM Pre-training & Fine-tuning',
        'Agentic Systems & Tool Integration',
        'MCP Gateway Project'
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

  save_roadmap: async (goalId: string, nodes: RoadmapNode[]): Promise<{ success: boolean }> => {
    return { success: true };
  },

  // NEW EXTENDED MCP COURSE DISCOVERY AND LEARNING PLAN TOOLS
  search_courses: async (query: string, level: string = 'Intermediate', goal: string = 'Master the subject'): Promise<Course[]> => {
    return searchCatalogCourses(query, level, goal);
  },

  compare_courses: async (query: string, level: string, goal: string): Promise<Course[]> => {
    const courses = await learningMcp.search_courses(query, level, goal);
    return courses.sort((a, b) => (b.careerOSScore || 0) - (a.careerOSScore || 0));
  },

  build_learning_roadmap: async (topic: string, level: 'Beginner' | 'Intermediate' | 'Advanced', goal: string, dailyTime: string): Promise<Course> => {
    // Generates a custom roadmap course
    return generateCustomCourse(topic, level, goal, dailyTime);
  },

  create_daily_learning_plan: async (courseTitle: string, dailyHours: number): Promise<{ activities: string[]; estimatedMinutes: number }> => {
    const minutes = dailyHours * 60;
    if (minutes <= 30) {
      return {
        activities: [`📖 Read "${courseTitle}" Chapter overview notes (20m)`, '🧠 Answer 1 chapter quiz question (10m)'],
        estimatedMinutes: 30
      };
    } else if (minutes <= 60) {
      return {
        activities: [
          `🎥 Watch 1 "${courseTitle}" lecture video (25m)`,
          `📖 Read corresponding summary chapter notes (15m)`,
          `🧠 Take chapter assessment quiz (10m)`,
          `💻 Implement practice code snippet exercise (10m)`
        ],
        estimatedMinutes: 60
      };
    } else {
      return {
        activities: [
          `🎥 Watch 2 "${courseTitle}" lecture videos (50m)`,
          `📖 Review comprehensive code repositories (25m)`,
          `🧠 Take chapter assessment quiz (15m)`,
          `💻 Complete hands-on lab assignment code (30m)`
        ],
        estimatedMinutes: 120
      };
    }
  },

  create_weekly_learning_plan: async (courseTitle: string): Promise<Record<string, string>> => {
    return {
      'Monday': `Introduction & Chapter 1 for ${courseTitle}`,
      'Tuesday': `Practice problems & terminology reviews`,
      'Wednesday': `Chapter 2: Core implementation structures`,
      'Thursday': `Hands-on practice labs & tests coverage`,
      'Friday': `Chapter 3: Capstone verification & quizzes`,
      'Saturday': `Mini project build and revision tests`,
      'Sunday': `Weekly progress sync & audit reflections`
    };
  }
};
