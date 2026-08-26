import { 
  Task, Goal, Course, Resource, Badge, Profile, RoadmapNode, AgentLog,
  initialProfile, initialTasks, initialGoals, initialRoadmap, initialCourses, initialResources, initialBadges, initialAgentLogs
} from '../data/mockData';
import { routeModelRequest } from './ai/modelRouter';
import { careerMcp } from './mcp/careerMcp';
import { learningMcp } from './mcp/learningMcp';
import { resourceMcp } from './mcp/resourceMcp';
import { productivityMcp } from './mcp/productivityMcp';

export type { AgentLog };

// LocalStorage Keys
const KEYS = {
  PROFILE: 'career_os_profile',
  TASKS: 'career_os_tasks',
  GOALS: 'career_os_goals',
  ROADMAP: 'career_os_roadmap',
  COURSES: 'career_os_courses',
  RESOURCES: 'career_os_resources',
  BADGES: 'career_os_badges',
  LOGS: 'career_os_logs'
};

// Data version migration: if stored courses lack chapter content, reset to rich defaults
const migrateCoursesIfNeeded = (): void => {
  try {
    const raw = localStorage.getItem(KEYS.COURSES);
    if (!raw) return;
    const stored: Course[] = JSON.parse(raw);
    // Check if any base course chapter is missing rich content fields
    const needsMigration = stored.some(c =>
      ['course-1', 'course-2', 'course-3'].includes(c.id) &&
      c.chapters.some(ch => !ch.explanation)
    );
    if (needsMigration) {
      // Merge: replace base courses but keep any user-enrolled custom courses
      const userCourses = stored.filter(c => !['course-1', 'course-2', 'course-3'].includes(c.id));
      localStorage.setItem(KEYS.COURSES, JSON.stringify([...initialCourses, ...userCourses]));
    }
  } catch {
    // If parse fails, reset completely
    localStorage.setItem(KEYS.COURSES, JSON.stringify(initialCourses));
  }
};

// Run migration once on module load
migrateCoursesIfNeeded();



// Initializer helper
const getStored = <T>(key: string, defaults: T): T => {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(defaults));
    return defaults;
  }
  try {
    return JSON.parse(data) as T;
  } catch (e) {
    return defaults;
  }
};

const setStored = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const getLocalDateString = (date = new Date()) => {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - (offset * 60 * 1000));
  return localDate.toISOString().split('T')[0];
};

export const stateManager = {
  // State getters
  getProfile: (): Profile => {
    const profile = getStored(KEYS.PROFILE, initialProfile);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = getLocalDateString(today);

    if (!profile.heatmapActivity) {
      profile.heatmapActivity = {};
    }

    let updated = false;
    if (profile.heatmapActivity[todayStr] === undefined || profile.heatmapActivity[todayStr] === 0) {
      profile.heatmapActivity[todayStr] = 1;
      updated = true;
    }

    // Fill all days in 2026 before today's date
    const checkDate = new Date(2026, 0, 1, 12, 0, 0); // Start at Jan 1, 2026 (noon to avoid DST issues)
    const todayTime = today.getTime();

    while (checkDate.getTime() < todayTime) {
      const dateStr = getLocalDateString(checkDate);
      if (!profile.heatmapActivity[dateStr] || profile.heatmapActivity[dateStr] === 0) {
        const rand = Math.random();
        let score = 1;
        if (rand > 0.75) score = 4;
        else if (rand > 0.50) score = 3;
        else if (rand > 0.25) score = 2;
        profile.heatmapActivity[dateStr] = score;
        updated = true;
      }
      checkDate.setDate(checkDate.getDate() + 1);
    }

    if (updated) {
      setStored(KEYS.PROFILE, profile);
    }

    return profile;
  },
  getTasks: (): Task[] => getStored(KEYS.TASKS, initialTasks),
  getGoals: (): Goal[] => getStored(KEYS.GOALS, initialGoals),
  getRoadmap: (): RoadmapNode[] => getStored(KEYS.ROADMAP, initialRoadmap),
  getCourses: (): Course[] => getStored(KEYS.COURSES, initialCourses),
  getResources: (): Resource[] => getStored(KEYS.RESOURCES, initialResources),
  getBadges: (): Badge[] => getStored(KEYS.BADGES, initialBadges),
  getAgentLogs: (): AgentLog[] => getStored(KEYS.LOGS, initialAgentLogs),

  // State setters
  saveProfile: (p: Profile) => setStored(KEYS.PROFILE, p),
  saveTasks: (t: Task[]) => setStored(KEYS.TASKS, t),
  saveGoals: (g: Goal[]) => setStored(KEYS.GOALS, g),
  saveRoadmap: (r: RoadmapNode[]) => setStored(KEYS.ROADMAP, r),
  saveCourses: (c: Course[]) => setStored(KEYS.COURSES, c),
  saveResources: (r: Resource[]) => setStored(KEYS.RESOURCES, r),
  saveBadges: (b: Badge[]) => setStored(KEYS.BADGES, b),
  saveAgentLogs: (l: AgentLog[]) => setStored(KEYS.LOGS, l),

  // Business Logic Methods
  addTask: (title: string, category: 'work' | 'learning', priority: 'low' | 'medium' | 'high', estimatedTime: number, timeOfDay?: string): Task => {
    const tasks = stateManager.getTasks();
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title,
      source: 'custom',
      estimatedTime,
      status: 'pending',
      priority,
      deadline: new Date().toISOString().split('T')[0],
      timeOfDay,
      category
    };
    tasks.push(newTask);
    stateManager.saveTasks(tasks);
    
    // Log Agent activity for manual adding
    stateManager.addLog({
      timestamp: new Date().toLocaleTimeString(),
      agent: 'Daily Planner Agent',
      action: 'add_task',
      status: 'success',
      message: `Registered new ${category} task: "${title}" (Estimate: ${estimatedTime}h)`,
      reasoning: 'Re-evaluating day schedule balancing to accommodate new user task.',
      tool: 'productivityMcp.create_schedule()'
    });
    
    return newTask;
  },

  toggleTaskCompleted: (id: string): Task[] => {
    const tasks = stateManager.getTasks();
    const index = tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      const task = tasks[index];
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      tasks[index] = { 
        ...task, 
        status: newStatus,
        completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined
      };
      stateManager.saveTasks(tasks);
      
      // Add experience progress or check badges if study task completed
      if (newStatus === 'completed') {
        stateManager.logActivity(2);
        const profile = stateManager.getProfile();
        if (task.category === 'learning') {
          profile.stats.learningHours += task.estimatedTime;
          stateManager.saveProfile(profile);
          stateManager.checkStreakBadges();
        }
        
        stateManager.addLog({
          timestamp: new Date().toLocaleTimeString(),
          agent: 'Progress Agent',
          action: 'complete_task',
          status: 'success',
          message: `Logged completion of: "${task.title}". Metrics synchronized.`,
          reasoning: `Updating ${task.category === 'learning' ? 'learning log duration' : 'company duty statistics'}.`
        });
      }
    }
    return tasks;
  },

  toggleResourceCompleted: (id: string): Resource[] => {
    const resources = stateManager.getResources();
    const index = resources.findIndex(r => r.id === id);
    if (index !== -1) {
      resources[index] = { ...resources[index], completed: !resources[index].completed };
      stateManager.saveResources(resources);
    }
    return resources;
  },

  logActivity: (points: number, dateStr?: string): Profile => {
    const profile = stateManager.getProfile();
    const today = dateStr || getLocalDateString();
    if (!profile.heatmapActivity) {
      profile.heatmapActivity = {};
    }
    const currentScore = profile.heatmapActivity[today] || 0;
    profile.heatmapActivity[today] = Math.min(10, currentScore + points);
    stateManager.saveProfile(profile);
    
    // Auto-check for newly achieved streaks/badges
    stateManager.checkStreakBadges();
    
    return stateManager.getProfile();
  },

  addLog: (log: AgentLog): void => {
    const logs = stateManager.getAgentLogs();
    logs.push(log);
    if (logs.length > 50) logs.shift(); // cap history
    stateManager.saveAgentLogs(logs);
  },

  clearLogs: (): void => {
    stateManager.saveAgentLogs([]);
  },

  checkStreakBadges: (): void => {
    const badges = stateManager.getBadges();
    const profile = stateManager.getProfile();
    const courses = stateManager.getCourses();
    let updated = false;

    // Helper to unlock a badge
    const unlockBadge = (id: string, message: string) => {
      const bIdx = badges.findIndex(b => b.id === id);
      if (bIdx !== -1 && !badges[bIdx].unlocked) {
        badges[bIdx].unlocked = true;
        badges[bIdx].unlockedAt = getLocalDateString();
        profile.stats.badgesCount += 1;
        updated = true;
        
        stateManager.addLog({
          timestamp: new Date().toLocaleTimeString(),
          agent: 'Progress Agent',
          action: 'unlock_achievement',
          status: 'success',
          message: `Achievement unlocked: "${badges[bIdx].title}"! ${message}`,
          reasoning: `Rule matched for badge: ${badges[bIdx].title}`
        });
      }
    };

    // 1. Focus duration badge (10 hours)
    if (profile.stats.learningHours >= 10) {
      unlockBadge('badge-6', 'Accrued 10+ focus hours.');
    }

    // 2. Streaks calculation from heatmap activity logs
    const heatmapActivity = profile.heatmapActivity || {};
    const sortedDates = Object.keys(heatmapActivity)
      .filter(d => heatmapActivity[d] > 0)
      .map(d => new Date(d))
      .sort((a, b) => a.getTime() - b.getTime());

    let longestStreak = 0;
    if (sortedDates.length > 0) {
      let tempStreak = 0;
      let prevDate: Date | null = null;
      sortedDates.forEach((d) => {
        if (prevDate === null) {
          tempStreak = 1;
        } else {
          const diffTime = Math.abs(d.getTime() - prevDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays === 1) {
            tempStreak++;
          } else if (diffDays > 1) {
            if (tempStreak > longestStreak) longestStreak = tempStreak;
            tempStreak = 1;
          }
        }
        prevDate = d;
      });
      if (tempStreak > longestStreak) longestStreak = tempStreak;
    }

    if (longestStreak >= 50) {
      unlockBadge('badge-9', 'Maintained 50+ day streak.');
    }
    if (longestStreak >= 100) {
      unlockBadge('badge-10', 'Maintained 100+ day streak.');
    }

    // 3. Project Master badge (unlocked if any course is 100% completed)
    if (courses.some(c => c.progress === 100)) {
      unlockBadge('badge-11', 'Completed a full course syllabus & course project.');
    }

    // 4. Monthly Active Badges
    const activeDays = Object.keys(heatmapActivity).filter(d => heatmapActivity[d] > 0);
    const hasAugust = activeDays.some(d => d.startsWith('2026-08'));
    const hasSeptember = activeDays.some(d => d.startsWith('2026-09'));

    if (hasAugust) {
      unlockBadge('badge-12', 'Active in August 2026.');
    }
    if (hasSeptember) {
      unlockBadge('badge-13', 'Active in September 2026.');
    }
    
    if (updated) {
      stateManager.saveBadges(badges);
      stateManager.saveProfile(profile);
    }
  },

  // Multi-Agent Simulation Pipeline
  simulateGoalGeneration: async (
    title: string,
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced',
    expectedOutcome: string,
    deadlineDays: number,
    studyTime: string,
    learningStyle: string,
    onStep: (stepIndex: number, currentLog: AgentLog) => void
  ): Promise<Goal> => {
    const steps: { agent: string; action: string; tool?: string; delay: number; msg: string; reasoning: string; routerCheck?: { type: string; desc: string } }[] = [
      {
        agent: 'Orchestrator Agent',
        action: 'receive_request',
        delay: 800,
        msg: `Orchestrator intercepted Goal Creation request: "Master ${title}"`,
        reasoning: 'Verifying input fields and dispatching parameters to model router for cognitive analysis.',
        routerCheck: { type: 'route_request', desc: 'Determine planning path for: Master ' + title }
      },
      {
        agent: 'Goal Agent',
        action: 'register_goal_parameters',
        tool: 'careerMcp.create_goal()',
        delay: 1000,
        msg: `Goal Agent parsing preferences: Level ${difficulty}, study time: ${studyTime}, style: ${learningStyle}.`,
        reasoning: 'Validating against learning standards. Storing baseline parameters in career schema.',
        routerCheck: { type: 'parse_parameters', desc: `Analyze preferences for ${title}` }
      },
      {
        agent: 'Skill Gap Agent',
        action: 'evaluate_skill_gap',
        tool: 'careerMcp.get_user_skills()',
        delay: 1200,
        msg: `Comparing target goal with Deepak Chaudhary's current skill profile...`,
        reasoning: 'Found current skills: ML Foundations (82%), LLM (74%), Agents (61%). Identified gaps in advanced implementation and architecture matrices.',
        routerCheck: { type: 'skill_gap_analysis', desc: `Compare profile with ${title}` }
      },
      {
        agent: 'Roadmap Agent',
        action: 'generate_roadmap',
        tool: 'learningMcp.get_topics()',
        delay: 1500,
        msg: `Roadmap Agent generating structural nodes & dependency graph...`,
        reasoning: 'Requesting learning paths. Laying out chronological milestones from foundations to capstone integration.',
        routerCheck: { type: 'generate_roadmap', desc: `Build custom sequence tree for ${title}` }
      },
      {
        agent: 'Resource Curator Agent',
        action: 'query_resource_index',
        tool: 'resourceMcp.search_youtube()',
        delay: 1000,
        msg: `Searching YouTube, Coursera, books and Arxiv papers...`,
        reasoning: 'Gathered 4 premium external links matching learning roadmap checkpoints.',
        routerCheck: { type: 'search_resources', desc: `Fetch documentation and media matching ${title}` }
      },
      {
        agent: 'Daily Planner Agent',
        action: 'optimize_schedule',
        tool: 'productivityMcp.create_schedule()',
        delay: 1200,
        msg: `Daily Planner balancing corporate load with study time...`,
        reasoning: `Factoring 5 weekly M365 tasks. Designing 6.5h daily work block with a dedicated 1.5h learning window.`,
        routerCheck: { type: 'balance_schedule', desc: 'Calculate study availability gaps' }
      },
      {
        agent: 'Deadline / Goal Guardian Agent',
        action: 'verify_feasibility',
        delay: 800,
        msg: `Deadline Guardian reviewing timelines: ${deadlineDays} days estimated.`,
        reasoning: `Calculating pace: (${difficulty} syllabus requires ~45h study time). At 1h/day, user will complete in 45 days. Timelines verified as highly feasible (15 days safety buffer).`,
      },
      {
        agent: 'Reflection / Critic Agent',
        action: 'curriculum_audit',
        delay: 1000,
        msg: `Critic Agent performing audit: validation passed. Dynamic path locked.`,
        reasoning: 'Syllabus sequences are logical. Prerequisites (neural nets -> self-attention) verified. Final routing approved.',
        routerCheck: { type: 'reflect_progress', desc: 'Verify pedagogical consistency' }
      },
      {
        agent: 'Orchestrator Agent',
        action: 'compile_results',
        delay: 600,
        msg: `New career goal successfully compiled and activated.`,
        reasoning: 'Saving goal parameters, appending learning course logs, and updating user profile dashboard.',
      }
    ];

    // Simulating sequence asynchronously
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      let msgPrefix = '';
      
      if (step.routerCheck) {
        const routerInfo = routeModelRequest(step.routerCheck.type, step.routerCheck.desc);
        msgPrefix = `[Router: Selected ${routerInfo.provider} -> ${routerInfo.modelName}] `;
      }
      
      const newLog: AgentLog = {
        timestamp: new Date().toLocaleTimeString(),
        agent: step.agent,
        action: step.action,
        status: i === steps.length - 1 ? 'success' : 'info',
        message: msgPrefix + step.msg,
        reasoning: step.reasoning,
        tool: step.tool
      };
      
      stateManager.addLog(newLog);
      onStep(i, newLog);
      await new Promise(resolve => setTimeout(resolve, step.delay));
    }

    // Save actual goal to state
    const goals = stateManager.getGoals();
    const createdGoal: Goal = {
      id: `goal-${Date.now()}`,
      title,
      description: `Syllabus targeted for master level expertise in ${title}.`,
      difficulty,
      currentLevel: difficulty === 'Advanced' ? 'Intermediate' : 'Beginner',
      targetLevel: difficulty,
      deadlineDays,
      progress: 0,
      streak: 0,
      status: 'On Track',
      category: title,
      expectedOutcome,
      studyTimePreference: studyTime,
      learningStylePreference: learningStyle,
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    goals.push(createdGoal);
    stateManager.saveGoals(goals);

    // Save corresponding roadmap node updates
    const roadmap = stateManager.getRoadmap();
    const newNodeId = `node-${Date.now()}`;
    const newRoadmapNode: RoadmapNode = {
      id: newNodeId,
      title: `Mastery capstone for ${title}`,
      phase: 'APPLICATIONS',
      status: 'current',
      difficulty,
      estimatedTime: '24 hours',
      prerequisites: ['node-5'],
      completionPercent: 0
    };
    roadmap.push(newRoadmapNode);
    stateManager.saveRoadmap(roadmap);

    // Save new course matching the goal
    const courses = stateManager.getCourses();
    const newCourse: Course = {
      id: `course-${Date.now()}`,
      title: `${title} Masterclass (Personalized AI Plan)`,
      thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80",
      difficulty,
      progress: 0,
      totalLessons: 15,
      completedLessons: 0,
      totalQuizzes: 3,
      completedQuizzes: 0,
      estimatedTime: '15h total',
      currentChapter: 'Core Concepts and Pre-requisites',
      chapters: [
        { id: `ch-${Date.now()}-1`, title: `Foundations of ${title}`, status: 'current' },
        { id: `ch-${Date.now()}-2`, title: `Advanced Architectures in ${title}`, status: 'locked' },
        { id: `ch-${Date.now()}-3`, title: `Hands-on Coding & Capstone Lab`, status: 'locked' }
      ]
    };
    courses.push(newCourse);
    stateManager.saveCourses(courses);

    return createdGoal;
  }
};
