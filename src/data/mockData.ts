export interface AgentLog {
  timestamp: string;
  agent: string;
  action: string;
  status: 'success' | 'info' | 'warning' | 'error';
  message: string;
  reasoning?: string;
  tool?: string;
  payload?: any;
}

export interface Task {
  id: string;
  title: string;
  source: 'teams' | 'custom';
  estimatedTime: number; // in hours
  status: 'completed' | 'pending' | 'backlog';
  priority: 'low' | 'medium' | 'high';
  deadline: string; // YYYY-MM-DD
  timeOfDay?: string; // e.g. "10:00 AM" or "4:00 PM"
  category: 'work' | 'learning';
  completedAt?: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  currentLevel: string;
  targetLevel: string;
  deadlineDays: number;
  progress: number; // 0 to 100
  streak: number;
  status: 'On Track' | 'Behind' | 'Completed' | 'Paused';
  category: string;
  expectedOutcome?: string;
  studyTimePreference?: string;
  learningStylePreference?: string;
  createdAt: string;
}

export interface RoadmapNode {
  id: string;
  title: string;
  phase: string;
  status: 'completed' | 'current' | 'locked';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  prerequisites: string[];
  completionPercent: number;
}

export interface CourseGithubRepo {
  name: string;
  url: string;
  description: string;
  stars?: string;
  forks?: string;
  language?: string;
  topics?: string[];
  cloneCommand?: string;
}

export interface CourseVideoProject {
  title: string;
  videoUrl: string; // YouTube video ID or URL
  channel?: string;
  duration?: string;
  description?: string;
  keyConcepts?: string[];
  githubUrl?: string;
}

export interface Course {
  id: string;
  title: string;
  thumbnail: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  progress: number;
  totalLessons: number;
  completedLessons: number;
  totalQuizzes: number;
  completedQuizzes: number;
  estimatedTime: string;
  currentChapter: string;
  chapters: {
    id: string;
    title: string;
    status: 'completed' | 'current' | 'locked';
    // Textbook chapters detailed layouts
    explanation?: string;
    analogy?: string;
    videoUrl?: string; // YouTube video ID or full URL
    keyTerminology?: string[];
    quizQuestion?: {
      question: string;
      options: string[];
      answerIdx: number;
      explanation: string;
    };
    practiceTask?: string;
    summary?: string;
  }[];
  // Normalized course metadata
  provider?: string;
  university?: string;
  instructor?: string;
  description?: string;
  sourceType?: 'university' | 'youtube' | 'platform';
  sourceUrl?: string;
  videoUrl?: string;
  prerequisites?: string[];
  careerOSScore?: number;
  strengths?: string[];
  weaknesses?: string[];
  license?: string;
  // Dynamic Quality Ratings
  rating?: number;
  comprehensiveness?: number; // 0 to 10
  theoryDepth?: number;       // 0 to 10
  practicalLearning?: number; // 0 to 10
  beginnerFriendly?: number;  // 0 to 10
  // Curated GitHub Repos & Video Projects
  githubRepos?: CourseGithubRepo[];
  videoProjects?: CourseVideoProject[];
  // Course lifecycle status (persisted to localStorage)
  courseStatus?: 'active' | 'wishlist' | 'archived';
  wishlist?: boolean; // legacy compat alias
  addedAt?: string;   // ISO date when course was added/enrolled
}

export interface Resource {
  id: string;
  title: string;
  type: 'video' | 'course' | 'book' | 'paper' | 'doc' | 'project';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  whyRecommended: string;
  url: string;
  completed: boolean;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}export interface Profile {
  name: string;
  title: string;
  avatar: string;
  bio: string;
  username: string;
  company?: string;
  location?: string;
  school?: string;
  website?: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
  heatmapActivity: { [dateStr: string]: number }; // YYYY-MM-DD -> score
  stats: {
    coursesCompleted: number;
    goalsCompleted: number;
    quizzesCompleted: number;
    projectsCompleted: number;
    learningHours: number;
    badgesCount: number;
    activeDays?: number;
    streakDays?: number;
    xp?: number;
    coursesEnrolled?: number;
    badgesEarned?: number;
  };
  skills: {
    name: string;
    level: number; // 0 to 100
  }[];
  recentActivity: {
    id: string;
    text: string;
    timestamp: string;
  }[];
}

const getLocalDateString = (date = new Date()) => {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - (offset * 60 * 1000));
  return localDate.toISOString().split('T')[0];
};

const generateMockHeatmapActivity = (): { [dateStr: string]: number } => {
  const activity: { [dateStr: string]: number } = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Real 2-week active usage period: Seed past 14 days up to today with dark/high-activity color (score 4-5)
  for (let i = 0; i < 14; i++) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const dateString = getLocalDateString(d);
    activity[dateString] = 5; // Max intensity / dark emerald color
  }

  return activity;
};

// Initial Mock Data Sets
export const initialProfile: Profile = {
  name: "Deepak Chaudhary",
  title: "AI Engineer",
  username: "deepak_chaudhary",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80", // Premium profile placeholder
  bio: "Building with LLMs, RAG, MCP & Agentic AI. Passionate about automated reasoning and cognitive architectures.",
  company: "Google Cloud AI Team",
  location: "San Francisco, CA",
  school: "Stanford University",
  website: "https://deepak.ai",
  github: "https://github.com/deepakchaudhary",
  linkedin: "https://linkedin.com/in/deepakchaudhary",
  twitter: "https://twitter.com/deepak_ai",
  heatmapActivity: generateMockHeatmapActivity(),
  stats: {
    coursesCompleted: 2,
    goalsCompleted: 1,
    quizzesCompleted: 6,
    projectsCompleted: 2,
    learningHours: 24,
    badgesCount: 3,
    activeDays: 4,
    streakDays: 4,
    xp: 450,
    coursesEnrolled: 3,
    badgesEarned: 3
  },
  skills: [
    { name: "AI / ML Foundations", level: 82 },
    { name: "LLMs & Prompt Engineering", level: 74 },
    { name: "Agentic AI & MCP", level: 61 },
    { name: "System Design", level: 43 }
  ],
  recentActivity: [
    { id: "act-1", text: "Completed 'Transformer Attention' lesson", timestamp: "2 hours ago" },
    { id: "act-2", text: "Scored 90% in 'Self-Attention Mechanisms' quiz", timestamp: "5 hours ago" },
    { id: "act-3", text: "Created 'Become an Advanced AI Engineer' goal", timestamp: "1 day ago" },
    { id: "act-4", text: "Logged 2.5 hours of focus study", timestamp: "1 day ago" }
  ]
};

const todayStr = getLocalDateString();
const tomorrowStr = getLocalDateString(new Date(Date.now() + 24 * 60 * 60 * 1000));
const threeDaysAfterStr = getLocalDateString(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000));
const fiveDaysAfterStr = getLocalDateString(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000));
const eightDaysAfterStr = getLocalDateString(new Date(Date.now() + 8 * 24 * 60 * 60 * 1000));
const twoWeeksAfterStr = getLocalDateString(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000));
const threeWeeksAfterStr = getLocalDateString(new Date(Date.now() + 21 * 24 * 60 * 60 * 1000));

export const initialTasks: Task[] = [
  // --- M365 COMPANY WORK TASKS ---
  // Today's Work Tasks
  {
    id: "task-work-1",
    title: "Fix authentication bug in gateway services",
    source: "teams",
    estimatedTime: 2,
    status: "completed",
    priority: "high",
    deadline: todayStr,
    timeOfDay: "11:30 AM",
    category: "work"
  },
  {
    id: "task-work-2",
    title: "Perform peer code reviews for v2 pull request",
    source: "teams",
    estimatedTime: 1.5,
    status: "completed",
    priority: "medium",
    deadline: todayStr,
    timeOfDay: "4:00 PM",
    category: "work"
  },
  {
    id: "task-work-3",
    title: "Complete MCP assignment implementation for engineering dashboard",
    source: "teams",
    estimatedTime: 2.5,
    status: "pending",
    priority: "high",
    deadline: todayStr,
    timeOfDay: "2:00 PM",
    category: "work"
  },
  {
    id: "task-work-5",
    title: "M365 Integration Sync Meeting",
    source: "teams",
    estimatedTime: 1,
    status: "pending",
    priority: "low",
    deadline: todayStr,
    timeOfDay: "10:00 AM",
    category: "work"
  },
  // This Week's Work Tasks
  {
    id: "task-work-4",
    title: "Prepare technical architecture documentation for Q4 rollout",
    source: "teams",
    estimatedTime: 2,
    status: "pending",
    priority: "medium",
    deadline: tomorrowStr,
    timeOfDay: "1:30 PM",
    category: "work"
  },
  {
    id: "task-work-6",
    title: "QA Automation Test Suite & E2E Validation Review",
    source: "teams",
    estimatedTime: 1.5,
    status: "pending",
    priority: "low",
    deadline: threeDaysAfterStr,
    timeOfDay: "3:00 PM",
    category: "work"
  },
  {
    id: "task-work-7",
    title: "Sprint Retrospective & Velocity Planning for AI Team",
    source: "teams",
    estimatedTime: 1,
    status: "pending",
    priority: "medium",
    deadline: fiveDaysAfterStr,
    timeOfDay: "11:00 AM",
    category: "work"
  },
  // This Month's Work Tasks
  {
    id: "task-work-8",
    title: "Enterprise Cloud Architecture Audit & Cost Optimization",
    source: "teams",
    estimatedTime: 4,
    status: "pending",
    priority: "high",
    deadline: twoWeeksAfterStr,
    category: "work"
  },
  {
    id: "task-work-9",
    title: "SOC2 Security Compliance & Secrets Rotation Checklist",
    source: "teams",
    estimatedTime: 3,
    status: "pending",
    priority: "medium",
    deadline: threeWeeksAfterStr,
    category: "work"
  },
  
  // --- TARGETED SYLLABUS LEARNING TASKS ---
  // Today's Study Tasks
  {
    id: "task-learn-1",
    title: "Study Transformer Attention Mechanics & Dot Products",
    source: "custom",
    estimatedTime: 1,
    status: "completed",
    priority: "high",
    deadline: todayStr,
    timeOfDay: "6:00 PM",
    category: "learning"
  },
  {
    id: "task-learn-2",
    title: "Complete MCP Client Development & JSON-RPC Protocol Lesson",
    source: "custom",
    estimatedTime: 0.75,
    status: "pending",
    priority: "medium",
    deadline: todayStr,
    timeOfDay: "7:00 PM",
    category: "learning"
  },
  {
    id: "task-learn-3",
    title: "Take Multi-Head Attention Diagnostic Assessment Quiz",
    source: "custom",
    estimatedTime: 0.3,
    status: "pending",
    priority: "high",
    deadline: todayStr,
    timeOfDay: "7:45 PM",
    category: "learning"
  },
  {
    id: "task-learn-4",
    title: "Hands-on Code Review of Sample Multi-Agent Orchestration Loop",
    source: "custom",
    estimatedTime: 0.5,
    status: "pending",
    priority: "low",
    deadline: todayStr,
    timeOfDay: "8:15 PM",
    category: "learning"
  },
  // This Week's Study Tasks
  {
    id: "task-learn-5",
    title: "Positional Encoding & Softmax Temperature Scaling Lab",
    source: "custom",
    estimatedTime: 1.5,
    status: "pending",
    priority: "high",
    deadline: tomorrowStr,
    timeOfDay: "6:30 PM",
    category: "learning"
  },
  {
    id: "task-learn-6",
    title: "Implement Custom PyTorch Scaled Dot-Product Attention Layer",
    source: "custom",
    estimatedTime: 2,
    status: "pending",
    priority: "medium",
    deadline: threeDaysAfterStr,
    timeOfDay: "7:00 PM",
    category: "learning"
  },
  {
    id: "task-learn-7",
    title: "Review Stanford CS224N Lecture 5 & Read Vaswani et al. Paper",
    source: "custom",
    estimatedTime: 1.5,
    status: "pending",
    priority: "low",
    deadline: fiveDaysAfterStr,
    timeOfDay: "5:30 PM",
    category: "learning"
  },
  // This Month's Study Tasks
  {
    id: "task-learn-8",
    title: "Complete Transformer Encoder-Decoder Architecture Module",
    source: "custom",
    estimatedTime: 3.5,
    status: "pending",
    priority: "high",
    deadline: eightDaysAfterStr,
    category: "learning"
  },
  {
    id: "task-learn-9",
    title: "Fine-tune Llama 3 on Custom Dataset using LoRA / QLoRA",
    source: "custom",
    estimatedTime: 4,
    status: "pending",
    priority: "high",
    deadline: twoWeeksAfterStr,
    category: "learning"
  },
  {
    id: "task-learn-10",
    title: "Deploy Production Multi-Agent MCP Gateway Capstone Project",
    source: "custom",
    estimatedTime: 5,
    status: "pending",
    priority: "high",
    deadline: threeWeeksAfterStr,
    category: "learning"
  }
];

export const initialGoals: Goal[] = [
  {
    id: "goal-1",
    title: "Become an Advanced AI Engineer",
    description: "Master modern foundation models, sequence architectures, Agentic workflows, and MCP tool protocols.",
    difficulty: "Advanced",
    currentLevel: "Intermediate",
    targetLevel: "Advanced",
    deadlineDays: 60,
    progress: 71,
    streak: 14,
    status: "On Track",
    category: "AI Engineering",
    expectedOutcome: "Build production-ready agent grids and design high-throughput MCP orchestration routers.",
    studyTimePreference: "1 hour/day",
    learningStylePreference: "Mixed",
    createdAt: "2026-07-28"
  },
  {
    id: "goal-2",
    title: "Production RAG Specialist",
    description: "Deep dive into vector databases, semantic chunking, query expansion, and hybrid search pipelines.",
    difficulty: "Intermediate",
    currentLevel: "Beginner",
    targetLevel: "Intermediate",
    deadlineDays: 30,
    progress: 100,
    streak: 5,
    status: "Completed",
    category: "Data Systems",
    expectedOutcome: "Re-architect team search microservice to achieve 95% retrieval accuracy.",
    studyTimePreference: "30 min/day",
    learningStylePreference: "Projects",
    createdAt: "2026-06-15"
  },
  {
    id: "goal-3",
    title: "Master Kubernetes & Orchestration",
    description: "Understand pod networking, operators, stateful sets, and service meshes.",
    difficulty: "Intermediate",
    currentLevel: "Beginner",
    targetLevel: "Intermediate",
    deadlineDays: 45,
    progress: 15,
    streak: 0,
    status: "Paused",
    category: "DevOps",
    expectedOutcome: "Deploy multi-agent cluster topologies on isolated node pools.",
    studyTimePreference: "2 hours/day",
    learningStylePreference: "Hands-on coding",
    createdAt: "2026-08-01"
  },
  {
    id: "goal-4",
    title: "IBM Cloud Native & Microservices",
    description: "Master modern microservices decomposition, Docker containerization, Kubernetes pods, and resilient service meshes.",
    difficulty: "Intermediate",
    currentLevel: "Intermediate",
    targetLevel: "Advanced",
    deadlineDays: 50,
    progress: 40,
    streak: 6,
    status: "On Track",
    category: "Enterprise Cloud",
    expectedOutcome: "Refactor monolith architectures into fault-tolerant IBM standard microservices.",
    studyTimePreference: "1.5 hours/day",
    learningStylePreference: "Projects",
    createdAt: "2026-08-10"
  },
  {
    id: "goal-5",
    title: "Microsoft Azure Solutions Architecture",
    description: "Design high-availability cloud systems, Cosmos DB partitions, hub-and-spoke virtual networks, and zero-trust architectures.",
    difficulty: "Advanced",
    currentLevel: "Intermediate",
    targetLevel: "Advanced",
    deadlineDays: 60,
    progress: 25,
    streak: 3,
    status: "On Track",
    category: "Cloud Architecture",
    expectedOutcome: "Attain Microsoft Azure Solutions Architect Enterprise Certification standards.",
    studyTimePreference: "1 hour/day",
    learningStylePreference: "Mixed",
    createdAt: "2026-08-14"
  },
  {
    id: "goal-6",
    title: "Meta React 19 Architecture",
    description: "Master React 19 Fiber reconciler, Concurrent Mode, React Server Components (RSC), and 60fps rendering at 1B+ scale.",
    difficulty: "Advanced",
    currentLevel: "Intermediate",
    targetLevel: "Advanced",
    deadlineDays: 40,
    progress: 55,
    streak: 8,
    status: "On Track",
    category: "Frontend Engineering",
    expectedOutcome: "Build ultra-responsive web applications with sub-millisecond interaction latency.",
    studyTimePreference: "1 hour/day",
    learningStylePreference: "Hands-on coding",
    createdAt: "2026-08-18"
  }
];

export const initialRoadmap: RoadmapNode[] = [
  { id: "node-1", title: "Neural Networks Foundations", phase: "FOUNDATIONS", status: "completed", difficulty: "Beginner", estimatedTime: "6 hours", prerequisites: [], completionPercent: 100 },
  { id: "node-2", title: "Sequence Models & RNNs", phase: "FOUNDATIONS", status: "completed", difficulty: "Beginner", estimatedTime: "8 hours", prerequisites: ["node-1"], completionPercent: 100 },
  { id: "node-3", title: "Introduction to Attention", phase: "CORE", status: "completed", difficulty: "Intermediate", estimatedTime: "4 hours", prerequisites: ["node-2"], completionPercent: 100 },
  { id: "node-4", title: "Self-Attention Mechanics", phase: "CORE", status: "completed", difficulty: "Intermediate", estimatedTime: "5 hours", prerequisites: ["node-3"], completionPercent: 100 },
  { id: "node-5", title: "Multi-Head Attention", phase: "CORE", status: "current", difficulty: "Intermediate", estimatedTime: "6 hours", prerequisites: ["node-4"], completionPercent: 60 },
  { id: "node-6", title: "Positional Encoding & Softmax", phase: "CORE", status: "locked", difficulty: "Intermediate", estimatedTime: "5 hours", prerequisites: ["node-5"], completionPercent: 0 },
  { id: "node-7", title: "Transformer Encoder-Decoder", phase: "ARCHITECTURE", status: "locked", difficulty: "Advanced", estimatedTime: "10 hours", prerequisites: ["node-5", "node-6"], completionPercent: 0 },
  { id: "node-8", title: "LLM Pre-training & Fine-tuning", phase: "ARCHITECTURE", status: "locked", difficulty: "Advanced", estimatedTime: "12 hours", prerequisites: ["node-7"], completionPercent: 0 },
  { id: "node-9", title: "Agentic Systems & Tool Integration", phase: "APPLICATIONS", status: "locked", difficulty: "Advanced", estimatedTime: "15 hours", prerequisites: ["node-8"], completionPercent: 0 },
  { id: "node-10", title: "MCP Gateway Capstone Project", phase: "APPLICATIONS", status: "locked", difficulty: "Advanced", estimatedTime: "20 hours", prerequisites: ["node-9"], completionPercent: 0 }
];

export const initialCourses: Course[] = [
  {
    id: "course-1",
    title: "Advanced Transformers & Attention Mechanics",
    thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80",
    difficulty: "Advanced",
    progress: 64,
    totalLessons: 50,
    completedLessons: 32,
    totalQuizzes: 12,
    completedQuizzes: 8,
    estimatedTime: "18h total",
    currentChapter: "Multi-Head Attention Layers",
    provider: "Stanford Online",
    instructor: "Prof. Christopher Manning",
    description: "A deep-dive into Transformer architecture internals: attention mechanics, positional encodings, multi-head projections, and scaling laws for large language models.",
    license: "Stanford Open Syllabus Terms",
    rating: 4.9,
    comprehensiveness: 9.8,
    theoryDepth: 9.9,
    practicalLearning: 8.0,
    beginnerFriendly: 5.5,
    videoUrl: "kCc8FmEb1nY",
    chapters: [
      {
        id: "ch-1-1",
        title: "Vector Attention Foundations",
        status: "completed",
        videoUrl: "kCc8FmEb1nY",
        explanation: "Attention mechanisms allow models to dynamically weight the importance of different input tokens when producing each output. The foundation is computing similarity scores between query vectors and key vectors across all positions in the sequence.",
        analogy: "Imagine you are a librarian. A patron hands you a query slip (query vector). You scan all the book index cards (key vectors). The books most relevant to the query get pulled off the shelf (high attention weight) while irrelevant ones stay put.",
        keyTerminology: ["Attention Score", "Query Vector", "Key Vector", "Value Vector", "Context Window"],
        quizQuestion: {
          question: "What is the primary purpose of computing attention scores in a Transformer model?",
          options: [
            "To reduce the memory footprint of the embedding table.",
            "To determine how much each token should influence the representation of another token.",
            "To normalize the input distribution before feeding into the feedforward layers.",
            "To convert discrete tokens into continuous positional embeddings."
          ],
          answerIdx: 1,
          explanation: "Attention scores quantify the relevance between tokens, allowing the model to dynamically focus on the most contextually important positions in the sequence when computing each output representation."
        },
        practiceTask: "Write a NumPy function that computes raw dot-product attention scores between a single query vector and a matrix of key vectors. Verify the shape of the output.",
        summary: "Attention scores are similarity dot products that determine token influence weights across a sequence."
      },
      {
        id: "ch-1-2",
        title: "Query, Key, and Value Projections",
        status: "completed",
        videoUrl: "kCc8FmEb1nY",
        explanation: "Inputs are linearly projected into three separate spaces using learned weight matrices W_Q, W_K, and W_V. This separation allows the model to ask questions (Q), present matchable keys (K), and provide retrieved content (V) independently.",
        analogy: "Think of a job interview. You (query) ask a question. The candidate presents their resume keywords (key). Their actual answer to the question (value) is what gets used to build your final impression. Q, K, and V are three distinct roles in the same conversation.",
        keyTerminology: ["Projection Matrix", "W_Q", "W_K", "W_V", "Linear Transformation"],
        quizQuestion: {
          question: "Why are separate weight matrices used for Q, K, and V projections instead of using the raw embeddings directly?",
          options: [
            "To triple the number of parameters for better generalization automatically.",
            "To allow the model to learn different representation subspaces optimized for matching versus content retrieval.",
            "To enforce orthogonality constraints between token embeddings.",
            "To reduce computational complexity by halving vector dimensions."
          ],
          answerIdx: 1,
          explanation: "Separate projections give the model flexibility to learn that the best key for matching is not necessarily the same vector needed for value retrieval, enabling richer representational capacity."
        },
        practiceTask: "Implement the Q, K, V projection step in PyTorch using nn.Linear layers with d_model=512 and d_k=64. Pass a batch of embeddings through and print the output shapes.",
        summary: "Separate learned projections let the model specialize query-key matching independently from value content."
      },
      {
        id: "ch-1-3",
        title: "Scaled Dot-Product Formula",
        status: "completed",
        videoUrl: "kCc8FmEb1nY",
        explanation: "The attention output is computed as: Attention(Q, K, V) = softmax(QK^T / sqrt(d_k)) * V. The scaling by sqrt(d_k) prevents the dot products from growing too large in high dimensions, which would push softmax into regions of near-zero gradients.",
        analogy: "Imagine voting scores across 1000 judges. Without normalization, the variance in scores skyrockets and most judges end up either 0% or 100% certain. Dividing by the square root of the number of judges stabilizes voting confidence.",
        keyTerminology: ["Scaled Dot-Product", "d_k Dimension", "Softmax Saturation", "Gradient Vanishing"],
        quizQuestion: {
          question: "What problem does dividing QK^T by sqrt(d_k) specifically address?",
          options: [
            "It speeds up matrix multiplication for large batches.",
            "It prevents softmax gradients from vanishing when dot products become very large.",
            "It enforces positional ordering on the attention weights.",
            "It converts the output into a probability distribution over vocabulary tokens."
          ],
          answerIdx: 1,
          explanation: "Large dot products push softmax inputs into flat saturation regions where gradients near zero, halting learning. Scaling by sqrt(d_k) keeps dot products in a healthy magnitude range."
        },
        practiceTask: "Implement the full scaled dot-product attention function in PyTorch. Test it with random Q, K, V tensors of shape (batch=2, seq=10, d_k=64) and verify attention weights sum to 1 along the sequence dimension.",
        summary: "Scaling by sqrt(d_k) prevents softmax saturation and gradient stagnation in high-dimensional attention."
      },
      {
        id: "ch-1-4",
        title: "Softmax Weight Scaling",
        status: "completed",
        videoUrl: "kCc8FmEb1nY",
        explanation: "After computing scaled dot-products, softmax is applied across the key dimension to convert raw scores into probability distributions. Each output token's representation is then a weighted sum of value vectors, where the weights are the softmax probabilities.",
        analogy: "Think of a restaurant menu. You rate each dish based on your hunger level. Softmax converts those raw preference scores into a probability share of your appetite. You then order weighted portions of each dish, creating a blended plate.",
        keyTerminology: ["Softmax Function", "Probability Distribution", "Weighted Average", "Temperature Scaling"],
        quizQuestion: {
          question: "After applying softmax to attention scores, what mathematical property do the resulting weights satisfy?",
          options: [
            "They sum to zero, enabling gradient flow through residual connections.",
            "They sum to one, forming a valid probability distribution over key positions.",
            "They are bounded between -1 and 1, acting as normalized cosine similarities.",
            "They are clipped to the top-k values and re-normalized by a learned temperature."
          ],
          answerIdx: 1,
          explanation: "Softmax normalizes scores so that all attention weights are non-negative and sum to exactly 1.0, creating a valid probability distribution that weights value vectors."
        },
        practiceTask: "Compare the effect of temperature scaling (dividing logits by T=0.5, T=1, T=2) on softmax outputs. Plot the resulting distributions and note sharpening vs. flattening effects.",
        summary: "Softmax converts attention scores into probability weights that blend value vectors into output representations."
      },
      {
        id: "ch-1-5",
        title: "Multi-Head Parallel Projections",
        status: "current",
        videoUrl: "kCc8FmEb1nY",
        explanation: "Multi-head attention runs h independent attention heads in parallel, each projecting Q, K, V into different subspaces of dimension d_k = d_model / h. The outputs are concatenated and projected back with W_O. This enables the model to simultaneously attend to information from different representation subspaces and positions.",
        analogy: "Imagine a panel of expert reviewers each reading the same document from a different lens — one focuses on grammar, another on logical coherence, another on emotional tone. Their individual observations are then combined into a final unified review report.",
        keyTerminology: ["Multi-Head Attention", "Parallel Heads", "Concatenation", "W_O Projection", "Subspace"],
        quizQuestion: {
          question: "What key advantage does multi-head attention have over single-head attention?",
          options: [
            "It reduces the computational complexity from O(n²) to O(n log n).",
            "It allows the model to jointly attend to information from different representation subspaces simultaneously.",
            "It eliminates the need for positional embeddings by encoding order through head indices.",
            "It prevents gradient vanishing by using multiple independent loss functions."
          ],
          answerIdx: 1,
          explanation: "Multiple heads can capture different types of relationships (syntactic, semantic, positional) in parallel, giving the model richer contextual understanding than a single attention pass."
        },
        practiceTask: "Implement a MultiHeadAttention class in PyTorch with num_heads=8, d_model=512. Run a forward pass on a (batch=4, seq=20, d_model=512) input and confirm the output shape matches the input shape.",
        summary: "Multi-head attention captures diverse relationship types by running h independent attention functions in parallel."
      },
      {
        id: "ch-1-6",
        title: "Positional Wave Embeddings",
        status: "locked",
        videoUrl: "kCc8FmEb1nY",
        explanation: "Since Transformers process all tokens in parallel (no recurrence), positional information must be injected explicitly. Sinusoidal positional encodings use sine and cosine functions of different frequencies, allowing the model to generalize to sequence lengths not seen during training.",
        analogy: "Imagine coding a position as a unique radio signal frequency. Low-frequency signals cycle slowly (encoding global position), while high-frequency signals cycle rapidly (encoding local position). Each token gets a blend of all frequencies, creating a unique positional fingerprint.",
        keyTerminology: ["Positional Encoding", "Sinusoidal Function", "Frequency Band", "Absolute Position", "RoPE"],
        quizQuestion: {
          question: "Why do sinusoidal positional encodings use multiple frequencies of sine and cosine functions?",
          options: [
            "To create orthogonal position codes that minimize cross-attention interference.",
            "To encode positions at multiple scales, capturing both local and global position information.",
            "To ensure token embeddings remain bounded between -1 and 1 after addition.",
            "To replace learned embeddings with deterministic weights that reduce training time."
          ],
          answerIdx: 1,
          explanation: "Different frequency sinusoids capture position information at different granularities — high frequencies for fine local positions and low frequencies for coarse global positions — allowing the model to detect both nearby and distant positional relationships."
        },
        practiceTask: "Generate a sinusoidal positional encoding matrix in NumPy for sequence length=100, d_model=512. Visualize it as a heatmap and identify the frequency pattern across dimensions.",
        summary: "Sinusoidal positional encodings inject multi-scale sequence order into parallel Transformer computations."
      }
    ]
  },
  {
    id: "course-2",
    title: "Designing Production Agentic Architectures",
    thumbnail: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&auto=format&fit=crop&q=80",
    difficulty: "Advanced",
    progress: 20,
    totalLessons: 40,
    completedLessons: 8,
    totalQuizzes: 8,
    completedQuizzes: 1,
    estimatedTime: "22h total",
    currentChapter: "MCP Tool Definition Protocols",
    provider: "DeepLearning.AI",
    instructor: "Dr. Andrew Ng",
    description: "A comprehensive production guide to designing multi-agent systems: ReAct loops, Model Context Protocol (MCP), memory architectures, and robust orchestration patterns for autonomous AI agents.",
    license: "OER Creative Commons BY",
    rating: 4.85,
    comprehensiveness: 9.5,
    theoryDepth: 9.0,
    practicalLearning: 9.5,
    beginnerFriendly: 6.0,
    videoUrl: "kCc8FmEb1nY",
    chapters: [
      {
        id: "ch-2-1",
        title: "Autonomous Routing Foundations",
        status: "completed",
        videoUrl: "kCc8FmEb1nY",
        explanation: "Agentic systems use an orchestrator that receives user intent and routes sub-tasks to specialized agents. The routing layer decides which agent or tool to invoke based on the semantic classification of the request.",
        analogy: "Think of an air traffic controller at a busy airport. Instead of every plane flying wherever it wants, the controller (orchestrator) assigns each aircraft (sub-agent) to a specific runway and time slot based on destination and urgency.",
        keyTerminology: ["Orchestrator", "Sub-Agent", "Intent Classification", "Task Routing", "Delegation"],
        quizQuestion: {
          question: "In a multi-agent system, what is the primary role of the orchestrator?",
          options: [
            "To execute all tool calls directly without delegation.",
            "To receive user intent and route sub-tasks to the most appropriate specialized agent.",
            "To store agent memory logs in a persistent vector database.",
            "To fine-tune agent parameters based on user feedback scores."
          ],
          answerIdx: 1,
          explanation: "The orchestrator acts as the central coordination layer, parsing intent and dispatching tasks to specialist agents, ensuring each unit handles only its area of expertise."
        },
        practiceTask: "Design a simple intent-classification router in Python that maps user inputs to one of three agent categories: 'research', 'coding', or 'planning'. Test it with 5 sample inputs.",
        summary: "Orchestrators route task intent to specialized sub-agents to enable scalable, modular agent workflows."
      },
      {
        id: "ch-2-2",
        title: "ReAct Logic Frameworks",
        status: "completed",
        videoUrl: "kCc8FmEb1nY",
        explanation: "ReAct (Reasoning + Acting) agents interleave thinking steps (Thought) with real-world actions (Act) and then observe the results (Observe). This loop continues until the task is resolved. The Thought step allows the model to plan and self-correct before acting.",
        analogy: "Imagine a detective solving a case. They think about the evidence (Thought), then go interview a suspect (Act), then note what they learned (Observe). They repeat this cycle until they identify the culprit. ReAct agents work the same way.",
        keyTerminology: ["ReAct Loop", "Thought Step", "Action Step", "Observation", "Chain-of-Thought"],
        quizQuestion: {
          question: "In the ReAct framework, what is the purpose of the 'Thought' step before each action?",
          options: [
            "To embed the user request into a vector database before retrieval.",
            "To enable the model to reason about the current state and plan the next optimal action.",
            "To format the final answer into structured JSON before returning to the user.",
            "To compress the context window by summarizing previous observations."
          ],
          answerIdx: 1,
          explanation: "The Thought step gives the agent space to reason about what it currently knows, identify gaps, and decide on the most strategic next action before executing it."
        },
        practiceTask: "Implement a minimal ReAct loop in Python with a mock 'search_web' tool. Trace through 3 Thought-Act-Observe cycles for the query: 'What is the population of Tokyo?'",
        summary: "ReAct interleaves explicit reasoning steps with grounded actions to enable self-correcting agentic behavior."
      },
      {
        id: "ch-2-3",
        title: "Model Tool Calling Protocol (MCP)",
        status: "current",
        videoUrl: "kCc8FmEb1nY",
        explanation: "The Model Context Protocol (MCP) is a standard interface for exposing tools to LLMs. Tools are declared as JSON schemas with defined input/output contracts. The model selects tools by name and provides structured arguments, while the MCP server executes the tool and returns results.",
        analogy: "Think of MCP as a universal USB-C port for AI tools. Instead of each tool needing a custom cable (bespoke integration), any tool that follows the MCP connector specification can plug directly into any compatible AI model without custom wiring.",
        keyTerminology: ["MCP Server", "Tool Schema", "JSON-RPC", "Tool Invocation", "Input/Output Contract"],
        quizQuestion: {
          question: "What is the key benefit of standardizing tool interfaces using the Model Context Protocol?",
          options: [
            "It eliminates the need for model fine-tuning on new task domains.",
            "It allows any MCP-compliant tool to be used by any compatible model without custom integration code.",
            "It encrypts tool outputs to prevent data leakage between agents.",
            "It reduces token usage by compressing tool schemas into binary formats."
          ],
          answerIdx: 1,
          explanation: "MCP's standardized JSON-RPC schema means tools are universally plug-and-play: any model that speaks MCP can immediately use any MCP-compliant tool without bespoke adapter code."
        },
        practiceTask: "Define an MCP-style tool schema for a 'get_weather' tool in JSON, specifying input parameters (city, units) and expected output structure. Then write a mock Python function that handles the invocation.",
        summary: "MCP standardizes tool interfaces so LLMs can invoke any compliant tool with structured schemas."
      },
      {
        id: "ch-2-4",
        title: "Dynamic Memory Backing",
        status: "locked",
        videoUrl: "kCc8FmEb1nY",
        explanation: "Production agents need memory beyond the context window. Dynamic memory uses vector databases (e.g., Pinecone, Chroma) to store and retrieve past interactions, facts, and plans. Short-term memory is the active context; long-term memory is retrieved via semantic search on demand.",
        analogy: "Think of a human brain. Short-term memory (context window) holds what you're actively thinking. Long-term memory (vector store) stores years of knowledge. When you need a fact, your brain searches long-term memory and pulls it into short-term awareness — just like RAG retrieval.",
        keyTerminology: ["Vector Store", "Short-Term Memory", "Long-Term Memory", "Semantic Retrieval", "Embedding"],
        quizQuestion: {
          question: "Why is a vector database used for long-term agent memory instead of a relational SQL database?",
          options: [
            "SQL databases cannot store text data natively.",
            "Vector databases enable semantic similarity search, retrieving conceptually relevant memories rather than exact keyword matches.",
            "Vector databases have lower storage costs at petabyte scale.",
            "SQL queries are too slow for real-time agent inference loops."
          ],
          answerIdx: 1,
          explanation: "Semantic search over embeddings lets agents retrieve contextually relevant memories even when the exact keywords differ, which is essential for natural language tasks where meaning matters more than literal text matching."
        },
        practiceTask: "Using ChromaDB locally, store 5 agent memory entries as embeddings. Then query for the 2 most semantically similar memories to a new input and print the results.",
        summary: "Vector databases extend agent memory beyond the context window via semantic similarity retrieval."
      }
    ]
  },
  {
    id: "course-3",
    title: "Production RAG Pipelines & Semantic Databases",
    thumbnail: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400&auto=format&fit=crop&q=80",
    difficulty: "Intermediate",
    progress: 100,
    totalLessons: 30,
    completedLessons: 30,
    totalQuizzes: 6,
    completedQuizzes: 6,
    estimatedTime: "12h total",
    currentChapter: "Hybrid Retrieval Ensembles",
    provider: "MIT OpenCourseWare",
    instructor: "Prof. Regina Barzilay",
    description: "Master Retrieval-Augmented Generation end-to-end: document chunking strategies, embedding models, vector database indexing, reranking, and hybrid retrieval architectures for production LLM systems.",
    license: "Creative Commons CC BY-NC-SA",
    rating: 4.8,
    comprehensiveness: 9.4,
    theoryDepth: 9.0,
    practicalLearning: 9.2,
    beginnerFriendly: 7.5,
    videoUrl: "aircAruvnKk",
    chapters: [
      {
        id: "ch-3-1",
        title: "Document Splitting Protocols",
        status: "completed",
        videoUrl: "aircAruvnKk",
        explanation: "Before indexing, documents must be chunked into smaller segments. Fixed-size chunking splits at character counts; semantic chunking splits at meaning boundaries; recursive chunking tries multiple separators hierarchically. Chunk size and overlap are critical hyperparameters that affect retrieval quality.",
        analogy: "Imagine cutting a long novel into index cards for a research library. If you cut randomly in the middle of sentences (fixed-size), you lose context. If you cut at chapter and paragraph boundaries (semantic chunking), each card tells a coherent mini-story that is much easier to search.",
        keyTerminology: ["Chunking Strategy", "Overlap Window", "Semantic Splitting", "Recursive Text Splitter", "Token Budget"],
        quizQuestion: {
          question: "Why is adding an overlap window between document chunks important for RAG retrieval quality?",
          options: [
            "It reduces the total number of chunks, lowering storage costs.",
            "It ensures that context spanning chunk boundaries is not lost, preserving semantic continuity.",
            "It de-duplicates identical sentences across long documents.",
            "It compresses embeddings to fit within the model's positional encoding limits."
          ],
          answerIdx: 1,
          explanation: "Without overlap, important context that spans two adjacent chunks gets split, causing retrieval to miss key information. Overlap ensures boundary context is present in at least one chunk."
        },
        practiceTask: "Use LangChain's RecursiveCharacterTextSplitter to chunk a 5-page PDF with chunk_size=500 and chunk_overlap=50. Print the number of chunks and the first 3 chunk texts.",
        summary: "Document chunking strategy and overlap window directly determine whether retrieved passages preserve full semantic context."
      },
      {
        id: "ch-3-2",
        title: "Embedding Vector Spaces",
        status: "completed",
        videoUrl: "aircAruvnKk",
        explanation: "Embedding models convert text chunks into high-dimensional vectors where semantic similarity corresponds to geometric proximity. Models like text-embedding-3-large or BGE-M3 map similar meaning to nearby points in vector space, enabling similarity search.",
        analogy: "Imagine plotting every book in a library on a giant map. Books about cooking cluster together, sci-fi books cluster elsewhere, and programming books form their own island. Finding books similar to your query is now a spatial distance problem.",
        keyTerminology: ["Embedding Model", "Cosine Similarity", "Dense Vector", "Semantic Space", "OpenAI Ada"],
        quizQuestion: {
          question: "Why is cosine similarity preferred over Euclidean distance for comparing text embeddings?",
          options: [
            "Cosine similarity is faster to compute on GPU hardware.",
            "Cosine similarity measures the angle between vectors, making it invariant to vector magnitude and more robust to document length differences.",
            "Euclidean distance cannot be computed for vectors with more than 1000 dimensions.",
            "Cosine similarity automatically normalizes embeddings to the unit hypersphere."
          ],
          answerIdx: 1,
          explanation: "Text embeddings from differently-sized documents can have different magnitudes. Cosine similarity focuses only on directional alignment (semantic meaning), ignoring magnitude, making it length-agnostic and more reliable for semantic search."
        },
        practiceTask: "Embed 10 sentences using the OpenAI text-embedding-3-small API. Compute a pairwise cosine similarity matrix and identify the most and least semantically similar sentence pair.",
        summary: "Embedding models map text into vector spaces where semantic similarity becomes a geometric proximity problem."
      },
      {
        id: "ch-3-3",
        title: "Dense vs. Sparse Indexing",
        status: "completed",
        videoUrl: "aircAruvnKk",
        explanation: "Dense indexing uses embedding vectors for semantic search (finds conceptually similar content even with different words). Sparse indexing like BM25 uses term frequency for keyword matching (finds exact term matches). Each excels in different scenarios, and hybrid indexes combine both.",
        analogy: "Imagine two librarians: one memorized the meaning of every book (dense — semantic search), another has an index card for every word in every book (sparse — keyword search). For finding 'heart disease' books, the semantic librarian also finds 'cardiovascular' books. For finding 'appendix B', the keyword librarian wins.",
        keyTerminology: ["Dense Retrieval", "Sparse Retrieval", "BM25", "FAISS", "Hybrid Search", "Reciprocal Rank Fusion"],
        quizQuestion: {
          question: "In which scenario does sparse (BM25) retrieval outperform dense embedding retrieval?",
          options: [
            "When searching for conceptually similar documents with different vocabulary.",
            "When queries contain rare or highly specific technical terms that must appear verbatim.",
            "When the document corpus contains more than 1 million entries.",
            "When the embedding model was trained on a different language domain."
          ],
          answerIdx: 1,
          explanation: "BM25 excels when exact term matching matters — like searching for a specific function name, error code, or proper noun — because dense embeddings may map rare terms to nearby semantic neighbors that don't match the exact string."
        },
        practiceTask: "Implement a hybrid retrieval system using BM25Retriever and a FAISS-based dense retriever in LangChain. Merge results using Reciprocal Rank Fusion and compare top-5 results from each method on 3 test queries.",
        summary: "Hybrid indexing combines dense semantic and sparse keyword search to maximize retrieval coverage across diverse query types."
      },
      {
        id: "ch-3-4",
        title: "Reranker Model Ensembles",
        status: "completed",
        videoUrl: "aircAruvnKk",
        explanation: "First-stage retrieval returns a large candidate set (top-50 to 100 chunks). A cross-encoder reranker model then scores each (query, chunk) pair jointly, producing a more accurate relevance ranking. Only the top-k reranked results are passed to the LLM, significantly improving answer quality.",
        analogy: "Think of a hiring process. A recruiter screens 200 resumes quickly (first-stage retrieval). Then a hiring manager interviews the top 20 candidates in-depth (reranker). Finally, the CEO makes an offer to the best 3 (top-k passed to LLM). The deep interview step catches quality the fast screen missed.",
        keyTerminology: ["Cross-Encoder", "Bi-Encoder", "Reranker", "Cohere Rerank", "Top-K Selection"],
        quizQuestion: {
          question: "Why is a cross-encoder reranker more accurate than a bi-encoder but not used for first-stage retrieval?",
          options: [
            "Cross-encoders cannot process text longer than 512 tokens.",
            "Cross-encoders jointly encode query and document together, capturing interaction signals, but are too slow to score millions of candidates in real-time.",
            "Cross-encoders require labeled training data that is not available for most domains.",
            "Cross-encoders produce sparse outputs that are incompatible with vector database indexes."
          ],
          answerIdx: 1,
          explanation: "Cross-encoders attend to both query and document simultaneously, capturing precise relevance interactions. However, they cannot pre-compute document encodings, making them O(n) at query time — infeasible for large corpora but ideal for reranking a small candidate set."
        },
        practiceTask: "Using Cohere's rerank API, take 20 retrieved chunks from a mock corpus and rerank them against a test query. Compare the original retrieval order vs. the reranked order and identify the rank position changes.",
        summary: "Cross-encoder rerankers apply deep query-document interaction scoring to refine first-stage retrieval results before LLM generation."
      }
    ]
  },
  {
    id: "course-4",
    title: "IBM Technology: Cloud Native, Microservices & Container Orchestration",
    thumbnail: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&auto=format&fit=crop&q=80",
    difficulty: "Intermediate",
    progress: 40,
    totalLessons: 24,
    completedLessons: 10,
    totalQuizzes: 4,
    completedQuizzes: 2,
    estimatedTime: "18h total",
    currentChapter: "Docker Containerization & Linux Namespaces",
    provider: "IBM Technology (Enterprise)",
    university: "IBM Technology & Red Hat",
    instructor: "Martin Keen (Master Inventor, IBM Technology)",
    description: "The definitive architectural guide from IBM Technology on breaking down monoliths into resilient microservices, containerization with Docker, and Kubernetes orchestration.",
    license: "IBM Standard Attribution",
    rating: 4.95,
    comprehensiveness: 9.7,
    theoryDepth: 9.4,
    practicalLearning: 9.8,
    beginnerFriendly: 8.9,
    videoUrl: "c3Z_rV3xW6Q",
    chapters: [
      {
        id: "ibm-ch1",
        title: "Microservices Architecture vs Monoliths: Bounded Contexts & RPC",
        status: "completed",
        videoUrl: "c3Z_rV3xW6Q",
        explanation: "IBM Technology principles for microservices: independent deployability, domain-driven boundaries, event-driven integration, and isolated data stores.",
        analogy: "Imagine a city where each department (fire, police, power, water) operates independently with its own radio frequency, rather than one person managing every municipal task.",
        keyTerminology: ["Bounded Context", "API Gateway", "Decoupled Datastores", "gRPC / REST"],
        quizQuestion: {
          question: "What is the primary benefit of breaking a monolith into IBM-standard microservices?",
          options: [
            "Sharing a single relational database table across all services.",
            "Independent deployability, isolated failure domains, and elastic horizontal scaling.",
            "Eliminating all network latency.",
            "Removing the need for automated testing."
          ],
          answerIdx: 1,
          explanation: "Independent deployability ensures teams can ship changes rapidly without risking downtime across unrelated features."
        },
        practiceTask: "Draft a microservices boundary diagram separating an e-commerce monolith into Auth, Catalog, and Orders services.",
        summary: "Microservices isolate failure domains and enable independent deployment pipelines."
      },
      {
        id: "ibm-ch2",
        title: "Docker Containerization & Linux Namespaces",
        status: "current",
        videoUrl: "c3Z_rV3xW6Q",
        explanation: "Deep dive into container virtualization: Linux cgroups, namespaces, layered filesystem UnionFS, and multi-stage Docker builds.",
        analogy: "Think of shipping containers on a cargo ship. Standardized metal boxes allow cranes, trucks, and trains to transport any goods anywhere without unpacking.",
        keyTerminology: ["cgroups", "Namespaces", "UnionFS", "Multi-stage Builds"],
        quizQuestion: {
          question: "How do Linux containers isolate processes from the host operating system?",
          options: [
            "By installing a separate guest operating system kernel for each container.",
            "Through Linux kernel namespaces for process/network isolation and cgroups for resource quotas.",
            "By running exclusively in hardware firmware.",
            "By compiling all code to WebAssembly."
          ],
          answerIdx: 1,
          explanation: "Namespaces provide private views of system resources, while cgroups limit CPU and memory usage."
        },
        practiceTask: "Write a production multi-stage Dockerfile minimizing image size with non-root user execution.",
        summary: "Containers package application code with dependencies for deterministic execution."
      },
      {
        id: "ibm-ch3",
        title: "Kubernetes Pods, Deployments & Service Meshes",
        status: "locked",
        videoUrl: "c3Z_rV3xW6Q",
        explanation: "Cluster orchestration mechanics: control planes, kubelet reconciliation loops, ingress controllers, and Istio service mesh observability.",
        analogy: "Think of an airport control tower coordinating dozens of planes landing and taking off on designated runways simultaneously.",
        keyTerminology: ["Control Plane", "Kubelet Loop", "Service Mesh", "Ingress Controller"],
        quizQuestion: {
          question: "What is the primary role of a Kubernetes ReplicaSet?",
          options: [
            "To encrypt database passwords in source code.",
            "To maintain a stable set of replica Pods running at any given time, automatically replacing failed instances.",
            "To speed up CSS compilation.",
            "To bypass network firewalls."
          ],
          answerIdx: 1,
          explanation: "ReplicaSets monitor running pod counts and spawn new pods whenever failures or evictions occur."
        },
        practiceTask: "Create a Kubernetes Deployment YAML manifest with liveness and readiness health probes.",
        summary: "Kubernetes automates self-healing container scheduling at enterprise scale."
      },
      {
        id: "ibm-ch4",
        title: "Enterprise Cloud Native Scaling & Capstone Lab",
        status: "locked",
        videoUrl: "c3Z_rV3xW6Q",
        explanation: "Production hardening: auto-scaling policies, canary deployments, zero-downtime rolling updates, and distributed tracing.",
        analogy: "Think of a highway toll plaza opening extra lanes automatically as peak rush hour traffic surges.",
        keyTerminology: ["HPA Autoscaling", "Canary Deployment", "Distributed Tracing", "Zero-Downtime Rollout"],
        quizQuestion: {
          question: "How does a Canary deployment mitigate production risk?",
          options: [
            "By replacing all servers at once during peak hours.",
            "By routing a small percentage of real user traffic to the new version before rolling it out to 100% of users.",
            "By disabling server monitoring.",
            "By deleting database backups."
          ],
          answerIdx: 1,
          explanation: "Canary rollouts expose new versions to a subset of traffic, detecting errors early before widespread user impact."
        },
        practiceTask: "Configure a horizontal pod autoscaler (HPA) targeting 70% average CPU utilization.",
        summary: "Cloud native patterns ensure resilient, continuous delivery in mission-critical environments."
      }
    ]
  },
  {
    id: "course-5",
    title: "Microsoft Learn: Azure Cloud Solution Architecture & Distributed Systems",
    thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&auto=format&fit=crop&q=80",
    difficulty: "Advanced",
    progress: 25,
    totalLessons: 20,
    completedLessons: 5,
    totalQuizzes: 5,
    completedQuizzes: 1,
    estimatedTime: "22h total",
    currentChapter: "High Availability & Fault-Tolerant System Design",
    provider: "Microsoft Learn (FAANG / MANGA)",
    university: "Microsoft Azure Architecture Center",
    instructor: "John Savill (Principal Cloud Architect, Microsoft)",
    description: "Comprehensive enterprise architecture from Microsoft: Virtual Networks, Cosmos DB distributed partitions, high availability, zero-trust security, and Azure Kubernetes Service (AKS).",
    license: "Microsoft Learn Attribution",
    rating: 4.96,
    comprehensiveness: 9.9,
    theoryDepth: 9.5,
    practicalLearning: 9.9,
    beginnerFriendly: 8.5,
    videoUrl: "NKEFW2WJbcE",
    chapters: [
      {
        id: "ms-ch1",
        title: "Azure Core Infrastructure, Virtual Networks & Global Peering",
        status: "completed",
        videoUrl: "NKEFW2WJbcE",
        explanation: "Architecting resilient cloud networks with Azure VNets, subnets, Network Security Groups (NSGs), route tables, and cross-region VNet peering.",
        analogy: "Imagine a private gated corporate campus where every building has its own security guard checking badges before letting visitors enter specific rooms.",
        keyTerminology: ["VNet Peering", "NSG Rules", "Private Endpoints", "ExpressRoute"],
        quizQuestion: {
          question: "What is the primary role of Azure Private Endpoints?",
          options: [
            "Exposing all database ports to the public internet.",
            "Securing PaaS services within your private VNet IP address space to eliminate public internet exposure.",
            "Disabling TLS encryption.",
            "Increasing VM CPU clock speeds."
          ],
          answerIdx: 1,
          explanation: "Private Endpoints assign private IPs from your VNet to Azure PaaS services, locking down traffic internally."
        },
        practiceTask: "Configure a hub-and-spoke VNet topology with network security group rules.",
        summary: "Hub-and-spoke network architectures isolate workloads while centralizing traffic inspection."
      },
      {
        id: "ms-ch2",
        title: "High Availability & Fault-Tolerant System Design",
        status: "current",
        videoUrl: "NKEFW2WJbcE",
        explanation: "Multi-region resilience patterns, Availability Zones, Azure Front Door global routing, and health probes.",
        analogy: "Think of a global financial network with redundant data centers operating in Frankfurt, Tokyo, and New York simultaneously.",
        keyTerminology: ["Availability Zones", "Azure Front Door", "Active-Active Multi-Region", "SLA 99.99%"],
        quizQuestion: {
          question: "What provides physically separate power, cooling, and networking within an Azure region?",
          options: [
            "Resource Groups",
            "Availability Zones",
            "Subscription IDs",
            "Management Groups"
          ],
          answerIdx: 1,
          explanation: "Availability Zones are isolated physical locations within an Azure region with independent infrastructure."
        },
        practiceTask: "Design an active-active dual-region architecture diagram with Azure Front Door.",
        summary: "Multi-zone and multi-region patterns achieve enterprise 99.99% service level agreements."
      }
    ]
  },
  {
    id: "course-6",
    title: "Meta Engineering: Advanced React Architecture & Performance at Scale",
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&auto=format&fit=crop&q=80",
    difficulty: "Advanced",
    progress: 55,
    totalLessons: 18,
    completedLessons: 10,
    totalQuizzes: 4,
    completedQuizzes: 2,
    estimatedTime: "16h total",
    currentChapter: "Server Components (RSC) & Streaming SSR",
    provider: "Meta Engineering (FAANG)",
    university: "Meta Open Source & React Core Team",
    instructor: "Dan Abramov & Meta React Core Engineers",
    description: "Internal architectural principles from Meta: React 19 Fiber reconciler, Concurrent Mode, React Server Components (RSC), suspense boundaries, and 60fps rendering at 1B+ users.",
    license: "Meta Open Source / MIT Attribution",
    rating: 4.97,
    comprehensiveness: 9.8,
    theoryDepth: 9.7,
    practicalLearning: 9.9,
    beginnerFriendly: 7.5,
    videoUrl: "8pDqJVdNa4g",
    chapters: [
      {
        id: "meta-ch1",
        title: "React Fiber Internals, Concurrent Rendering & Scheduling",
        status: "completed",
        videoUrl: "8pDqJVdNa4g",
        explanation: "How Meta re-architected React with Fiber: interruptible rendering units, algebraic effects, priority queues, and cooperative scheduling.",
        analogy: "Think of a chef preparing multiple orders. Instead of finishing a 2-hour roast before starting anything else, the chef chops onions, pauses to flip the burgers, and resumes without burning anything.",
        keyTerminology: ["Fiber Node Tree", "Work-in-Progress Tree", "Time Slicing", "Lane Priority"],
        quizQuestion: {
          question: "What fundamental capability does the React Fiber reconciler enable?",
          options: [
            "Direct access to low-level assembly instructions.",
            "Pausing, aborting, and prioritizing render work to keep the user interface responsive during heavy computations.",
            "Replacing JavaScript with Python in the browser.",
            "Removing virtual DOM comparisons."
          ],
          answerIdx: 1,
          explanation: "Fiber breaks rendering into discrete units of work that can be paused to yield control back to the browser event loop."
        },
        practiceTask: "Profile component render lifecycles with React DevTools and optimize high-frequency re-renders.",
        summary: "Fiber cooperative scheduling guarantees 60fps responsiveness across complex web apps."
      },
      {
        id: "meta-ch2",
        title: "Server Components (RSC) & Streaming SSR",
        status: "current",
        videoUrl: "8pDqJVdNa4g",
        explanation: "Zero-bundle-size server components, streaming HTML through Suspense boundaries, and progressive client hydration.",
        analogy: "Imagine receiving a book chapter by chapter over high-speed telegraph rather than waiting for the entire hardcover volume to be printed and shipped.",
        keyTerminology: ["RSC Protocol", "Zero-Bundle-Size", "Streaming SSR", "Selective Hydration"],
        quizQuestion: {
          question: "What is the primary performance benefit of React Server Components (RSC)?",
          options: [
            "They run exclusively on quantum computers.",
            "They execute on the server and send rendered UI payload to the browser without adding their dependencies to client JavaScript bundle size.",
            "They remove all HTML tags from the webpage.",
            "They bypass database queries completely."
          ],
          answerIdx: 1,
          explanation: "Server components ship zero JavaScript dependencies to the client browser, drastically reducing initial page load time."
        },
        practiceTask: "Refactor a data-fetching client component into an async React Server Component.",
        summary: "RSC combines server-side data directness with interactive client components."
      }
    ]
  }
];

export const initialResources: Resource[] = [
  {
    id: "res-1",
    title: "Attention Mechanism Explained Visually",
    type: "video",
    difficulty: "Intermediate",
    duration: "24 min",
    whyRecommended: "Excellent visual breakdowns of key, query, and value matrix dot products.",
    url: "https://www.youtube.com/watch?v=S27pHKBEp30",
    completed: true
  },
  {
    id: "res-2",
    title: "Attention Is All You Need (Original Paper)",
    type: "paper",
    difficulty: "Advanced",
    duration: "15 pages",
    whyRecommended: "The seminal paper introducing the Transformer architecture.",
    url: "https://arxiv.org/abs/1706.03762",
    completed: false
  },
  {
    id: "res-3",
    title: "Model Context Protocol Spec Documentation",
    type: "doc",
    difficulty: "Intermediate",
    duration: "45 min",
    whyRecommended: "Official specification sheet mapping JSON-RPC tool schemas.",
    url: "https://modelcontextprotocol.io",
    completed: false
  },
  {
    id: "res-4",
    title: "Building Agents from Scratch in Python",
    type: "project",
    difficulty: "Advanced",
    duration: "3 hours",
    whyRecommended: "Hands-on project showing execution loops, memory stacks, and tool integration.",
    url: "https://github.com/agent-builders/scratch",
    completed: false
  }
];

export const initialBadges: Badge[] = [
  { id: "badge-1", title: "Guardian Focus II", description: "Maintain study discipline for 7 consecutive focus days.", icon: "🔥", unlocked: true, unlockedAt: "2026-08-05" },
  { id: "badge-2", title: "Sentinel Streak V", description: "Maintain study discipline for 30 consecutive focus days.", icon: "👑", unlocked: false },
  { id: "badge-3", title: "Academia Graduate", description: "Finish 100% of any enrolled syllabus curriculum lessons.", icon: "🎓", unlocked: true, unlockedAt: "2026-07-15" },
  { id: "badge-4", title: "Peak Target Master", description: "Reach target level on one of your main career milestones.", icon: "🎯", unlocked: true, unlockedAt: "2026-07-28" },
  { id: "badge-5", title: "Neural Overlord", description: "Answer 100 assessment quiz questions successfully.", icon: "🧠", unlocked: false },
  { id: "badge-6", title: "Quantum Scholar", description: "Accrue 10 total active focus and research study hours.", icon: "🚀", unlocked: true, unlockedAt: "2026-07-10" },
  { id: "badge-7", title: "System Architect", description: "Deploy your first advanced capstone project solution.", icon: "💻", unlocked: false },
  { id: "badge-8", title: "Grandmaster Ascendant", description: "Achieve and complete all target career goals on the platform.", icon: "🏆", unlocked: false },
  { id: "badge-9", title: "Vanguard Streak X", description: "Maintain study discipline for 50 consecutive focus days.", icon: "🏅", unlocked: false },
  { id: "badge-10", title: "Chronos Titan L", description: "Maintain study discipline for 100 consecutive focus days.", icon: "🎖️", unlocked: false },
  { id: "badge-11", title: "Titanium Project Master", description: "Complete a full course curriculum along with its capstone lab assignment.", icon: "🛠️", unlocked: false },
  { id: "badge-12", title: "Solar Active - Aug 2026", description: "Show active learning consistency throughout August 2026.", icon: "📅", unlocked: false },
  { id: "badge-13", title: "Equinox Active - Sep 2026", description: "Show active learning consistency throughout September 2026.", icon: "🗓️", unlocked: false },
  { id: "badge-quiz-gold", title: "Assessment Grandmaster", description: "Scored 90%+ on an AI Diagnostic Assessment Quiz.", icon: "🥇", unlocked: false },
  { id: "badge-quiz-silver", title: "Assessment Specialist", description: "Scored 70%+ on an AI Diagnostic Assessment Quiz.", icon: "🥈", unlocked: false },
  { id: "badge-quiz-bronze", title: "Assessment Achiever", description: "Completed an interactive skill assessment.", icon: "🥉", unlocked: false }
];

export const initialAgentLogs: AgentLog[] = [
  {
    timestamp: "13:30:15",
    agent: "Orchestrator Agent",
    action: "initialize_platform",
    status: "success",
    message: "Orchestrator online. Connected to Local Router, Career Database, and M365 Exchange.",
    reasoning: "Checking availability of mock MCP connection hooks and loading active goals database.",
    tool: "m365Mcp.get_teams_tasks()",
    payload: { connected: true, activeTasksCount: 5 }
  },
  {
    timestamp: "13:31:00",
    agent: "Work Intelligence Agent",
    action: "fetch_schedule",
    status: "success",
    message: "Retrieved 5 MS Teams items and 2 Outlook events.",
    reasoning: "Parsing teams messages and planner notifications to map current daily calendar block.",
    tool: "m365Mcp.get_meetings()",
    payload: { meetings: ["M365 Sync", "PR Code Review"], deadlines: ["Auth Bug Fix (Today)"] }
  },
  {
    timestamp: "13:31:45",
    agent: "Daily Planner Agent",
    action: "balance_schedule",
    status: "success",
    message: "Daily schedule balanced. 6.5h company work, 2.55h open window, allocating 2h to Advanced AI Goal.",
    reasoning: "User requested 1h study, but target completion dates are strict. Extending block to 2h using productivityMcp.create_schedule.",
    tool: "productivityMcp.create_schedule()",
    payload: { workHours: 6.5, studyHours: 2.0, gapHours: 5.5 }
  }
];

