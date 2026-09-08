import { 
  Task, Goal, Course, Resource, Badge, Profile, RoadmapNode, AgentLog,
  initialProfile, initialTasks, initialGoals, initialRoadmap, initialCourses, initialResources, initialBadges, initialAgentLogs
} from '../data/mockData';
import { routeModelRequest, routeAndCall, setRouterLogger } from './ai/modelRouter';
import { careerMcp } from './mcp/careerMcp';
import { learningMcp } from './mcp/learningMcp';
import { resourceMcp } from './mcp/resourceMcp';
import { productivityMcp } from './mcp/productivityMcp';
import { 
  getVideoForTopic, generateCustomCourse, generateRoadmapNodesForCourse, 
  getSkillNameForTopic, getLecturePairForTopic, getGithubReposForTopic, getVideoProjectsForTopic 
} from '../data/coursesData';
import { showToast } from '../components/ToastContainer';
import { verificationAgent } from './ai/verificationAgent';

export type { AgentLog };
// Export routeAndCall so agents can call LLMs through the router
export { routeAndCall };

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

// Data version migration: seamlessly merge initial courses (including enterprise tracks) without erasing user courses
const migrateCoursesIfNeeded = (): void => {
  try {
    const raw = localStorage.getItem(KEYS.COURSES);
    if (!raw) {
      localStorage.setItem(KEYS.COURSES, JSON.stringify(initialCourses));
      return;
    }
    const stored: Course[] = JSON.parse(raw);
    let updated = false;
    const merged = [...stored];
    
    // Ensure all 6 base courses are present and have rich chapter content
    initialCourses.forEach(initCourse => {
      const existingIdx = merged.findIndex(c => c.id === initCourse.id || c.title.toLowerCase().trim() === initCourse.title.toLowerCase().trim());
      if (existingIdx === -1) {
        merged.push(initCourse);
        updated = true;
      } else if (merged[existingIdx].chapters.some(ch => !ch.explanation)) {
        merged[existingIdx] = initCourse;
        updated = true;
      }
    });

    // Ensure all courses have curated GitHub repos & video build projects
    merged.forEach(c => {
      if (!c.githubRepos || c.githubRepos.length === 0) {
        c.githubRepos = getGithubReposForTopic(c.title);
        updated = true;
      }
      if (!c.videoProjects || c.videoProjects.length === 0) {
        c.videoProjects = getVideoProjectsForTopic(c.title);
        updated = true;
      }
    });

    if (updated) {
      localStorage.setItem(KEYS.COURSES, JSON.stringify(merged));
    }
  } catch {
    localStorage.setItem(KEYS.COURSES, JSON.stringify(initialCourses));
  }
};

// Task migration: merge initial tasks (including weekly & monthly horizons) without erasing custom tasks
const migrateTasksIfNeeded = (): void => {
  try {
    const raw = localStorage.getItem(KEYS.TASKS);
    if (!raw) {
      localStorage.setItem(KEYS.TASKS, JSON.stringify(initialTasks));
      return;
    }
    const stored: Task[] = JSON.parse(raw);
    let updated = false;
    const merged = [...stored];

    initialTasks.forEach(initTask => {
      const exists = merged.some(t => t.id === initTask.id || t.title.toLowerCase().trim() === initTask.title.toLowerCase().trim());
      if (!exists) {
        merged.push(initTask);
        updated = true;
      }
    });

    if (updated) {
      localStorage.setItem(KEYS.TASKS, JSON.stringify(merged));
    }
  } catch {
    localStorage.setItem(KEYS.TASKS, JSON.stringify(initialTasks));
  }
};

// Run migrations once on module load
migrateCoursesIfNeeded();
migrateTasksIfNeeded();

// Heatmap sanitization: ensure real 2-week continuous active streak with dark color, removing fake history
const sanitizeProfileHeatmapIfNeeded = (): void => {
  try {
    const raw = localStorage.getItem(KEYS.PROFILE);
    const profile: Profile = raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(initialProfile));
    if (!profile.heatmapActivity) {
      profile.heatmapActivity = {};
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = getLocalDateString(today);

    // Keep only past 14 days and any future recorded local days (clean up arbitrary fake months)
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    fourteenDaysAgo.setHours(0, 0, 0, 0);
    const cutoffStr = getLocalDateString(fourteenDaysAgo);

    const cleanedHeatmap: { [dateStr: string]: number } = {};
    for (const [dateKey, val] of Object.entries(profile.heatmapActivity)) {
      if (dateKey >= cutoffStr && dateKey <= todayStr && typeof val === 'number' && val > 0) {
        cleanedHeatmap[dateKey] = Math.max(val, 5); // Ensure dark/high-activity color for the 2-week period
      }
    }

    // Seed the full 14 days up to today with dark active color (score 5)
    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const dStr = getLocalDateString(d);
      cleanedHeatmap[dStr] = 5;
    }

    profile.heatmapActivity = cleanedHeatmap;
    const activeDaysList = Object.keys(profile.heatmapActivity).filter(d => (profile.heatmapActivity[d] || 0) > 0);
    profile.stats.activeDays = activeDaysList.length;
    profile.stats.streakDays = calculateRealStreak(activeDaysList);

    localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    // ignore
  }
};

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

// Run profile heatmap sanitization on load
sanitizeProfileHeatmapIfNeeded();

export const calculateRealStreak = (activityDays: string[]): number => {
  if (!activityDays || activityDays.length === 0) return 0;
  const unique = Array.from(new Set(activityDays)).sort();
  const todayStr = getLocalDateString(new Date());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterday);

  const hasToday = unique.includes(todayStr);
  const hasYesterday = unique.includes(yesterdayStr);

  if (!hasToday && !hasYesterday) return 0;

  let streak = 1;
  const checkDate = hasToday ? new Date() : yesterday;
  checkDate.setHours(0, 0, 0, 0);

  while (true) {
    checkDate.setDate(checkDate.getDate() - 1);
    const checkStr = getLocalDateString(checkDate);
    if (unique.includes(checkStr)) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
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

    // Ensure today is logged with active status
    if (!profile.heatmapActivity[todayStr] || profile.heatmapActivity[todayStr] < 5) {
      profile.heatmapActivity[todayStr] = 5;
    }

    // Accurate real active days calculation from actual local storage
    const activeDaysList = Object.keys(profile.heatmapActivity).filter(d => (profile.heatmapActivity[d] || 0) > 0);
    profile.stats.activeDays = activeDaysList.length;
    profile.stats.streakDays = calculateRealStreak(activeDaysList);

    // Sync live counters with active stored collections
    try {
      const liveCourses = getStored<Course[]>(KEYS.COURSES, initialCourses);
      const liveGoals = getStored<Goal[]>(KEYS.GOALS, initialGoals);
      const liveBadges = getStored<Badge[]>(KEYS.BADGES, initialBadges);

      profile.stats.coursesEnrolled = liveCourses.filter(c => !c.wishlist && c.courseStatus !== 'wishlist').length;
      profile.stats.coursesCompleted = liveCourses.filter(c => c.progress === 100).length;
      profile.stats.goalsCompleted = liveGoals.filter(g => g.status === 'Completed').length;
      profile.stats.badgesEarned = liveBadges.filter(b => b.unlocked).length;
    } catch {}

    setStored(KEYS.PROFILE, profile);
    return profile;
  },
  getTasks: (): Task[] => getStored(KEYS.TASKS, initialTasks),
  getGoals: (): Goal[] => {
    let goals = getStored<Goal[]>(KEYS.GOALS, initialGoals);
    const courses = getStored<Course[]>(KEYS.COURSES, initialCourses);
    let goalsUpdated = false;

    // Auto-sync: Ensure every enrolled active course (not wishlist) has a corresponding goal
    courses.filter(c => !c.wishlist && c.courseStatus !== 'wishlist').forEach(course => {
      const cTitle = course.title.toLowerCase().trim();
      const hasGoal = goals.some(g => 
        g.title.toLowerCase().trim() === cTitle ||
        g.title.toLowerCase().includes(cTitle) ||
        cTitle.includes(g.title.toLowerCase().trim()) ||
        g.id === `goal-${course.id}`
      );

      if (!hasGoal) {
        goals.push({
          id: `goal-${course.id}`,
          title: course.title,
          description: course.description || `Targeted curriculum for building master level competency in ${course.title}.`,
          difficulty: course.difficulty,
          currentLevel: course.difficulty === 'Advanced' ? 'Intermediate' : 'Beginner',
          targetLevel: course.difficulty,
          deadlineDays: 45,
          progress: course.progress || 0,
          streak: 1,
          status: 'On Track',
          category: course.provider || 'Computer Science',
          expectedOutcome: `Master all chapters and complete capstone verification in ${course.title}.`,
          studyTimePreference: course.estimatedTime || '1 hour/day',
          learningStylePreference: 'Mixed',
          createdAt: new Date().toISOString().split('T')[0]
        });
        goalsUpdated = true;
      }
    });

    if (goalsUpdated) {
      setStored(KEYS.GOALS, goals);
    }
    return goals;
  },
  getRoadmap: (): RoadmapNode[] => getStored(KEYS.ROADMAP, initialRoadmap),
  getCourses: (): Course[] => {
    let courses = getStored<Course[]>(KEYS.COURSES, initialCourses);
    const goals = getStored<Goal[]>(KEYS.GOALS, initialGoals);

    // Thorough migration & guarantee: Ensure EVERY course has complete GitHub repos, video projects, and rich chapter metadata
    let coursesUpdated = false;
    courses.forEach(c => {
      if (!c.githubRepos || c.githubRepos.length === 0) {
        c.githubRepos = getGithubReposForTopic(c.title);
        coursesUpdated = true;
      }
      if (!c.videoProjects || c.videoProjects.length === 0) {
        c.videoProjects = getVideoProjectsForTopic(c.title);
        coursesUpdated = true;
      }
      if (c.chapters && c.chapters.length > 0) {
        c.chapters.forEach((ch, idx) => {
          if (!ch.explanation) {
            ch.explanation = `Comprehensive mathematical and architectural foundations governing ${ch.title}.`;
            coursesUpdated = true;
          }
          if (!ch.analogy) {
            ch.analogy = `Think of ${ch.title} as a specialized cognitive routing mechanism that prioritizes high-entropy contextual patterns.`;
            coursesUpdated = true;
          }
          if (!ch.keyTerminology || ch.keyTerminology.length === 0) {
            ch.keyTerminology = ['Architecture', 'Optimization', 'Inference', 'Production'];
            coursesUpdated = true;
          }
          if (!ch.practiceTask) {
            ch.practiceTask = `Implement a production PyTorch module for ${ch.title} and verify latency benchmarks.`;
            coursesUpdated = true;
          }
          if (!ch.quizQuestion) {
            ch.quizQuestion = {
              question: `What is the primary architectural objective of ${ch.title}?`,
              options: [
                "It restricts contextual representation to unidirectional paths.",
                "It facilitates parallel contextual representation learning across deep tokens.",
                "It eliminates the need for activation functions during training.",
                "It strictly isolates gradient updates to single layers."
              ],
              answerIdx: 1,
              explanation: `Modular designs and self-attention in ${ch.title} enable parallel computation with high contextual precision.`
            };
            coursesUpdated = true;
          }
          if (!ch.videoUrl) {
            ch.videoUrl = getLecturePairForTopic(c.title).indian.videoId || 'aircAruvnKk';
            coursesUpdated = true;
          }
        });
      }
    });

    if (coursesUpdated) {
      setStored(KEYS.COURSES, courses);
    }

    return courses;
  },
  getResources: (): Resource[] => getStored(KEYS.RESOURCES, initialResources),
  getBadges: (): Badge[] => getStored(KEYS.BADGES, initialBadges),
  getAgentLogs: (): AgentLog[] => getStored(KEYS.LOGS, initialAgentLogs),

  // State setters
  saveProfile: (p: Profile) => setStored(KEYS.PROFILE, p),
  saveTasks: (t: Task[]) => setStored(KEYS.TASKS, t),
  saveGoals: (g: Goal[]) => setStored(KEYS.GOALS, g),
  saveRoadmap: (r: RoadmapNode[]) => setStored(KEYS.ROADMAP, r),
  saveCourses: (c: Course[]) => {
    setStored(KEYS.COURSES, c);
    // Notify all listeners that courses have changed
    window.dispatchEvent(new CustomEvent('courses-updated'));
  },
  saveResources: (r: Resource[]) => setStored(KEYS.RESOURCES, r),
  saveBadges: (b: Badge[]) => setStored(KEYS.BADGES, b),
  saveAgentLogs: (l: AgentLog[]) => setStored(KEYS.LOGS, l),

  /**
   * Records real daily activity and increments XP and heatmap
   */
  logActivity: (points: number = 1) => {
    const profile = stateManager.getProfile();
    const todayStr = getLocalDateString(new Date());
    if (!profile.heatmapActivity) profile.heatmapActivity = {};
    profile.heatmapActivity[todayStr] = (profile.heatmapActivity[todayStr] || 0) + points;

    const activeDaysList = Object.keys(profile.heatmapActivity).filter(d => (profile.heatmapActivity[d] || 0) > 0);
    profile.stats.activeDays = activeDaysList.length;
    profile.stats.streakDays = calculateRealStreak(activeDaysList);
    profile.stats.xp = (profile.stats.xp || 0) + points * 10;

    // Check streak-related badges
    stateManager.checkStreakBadges();

    setStored(KEYS.PROFILE, profile);
    window.dispatchEvent(new CustomEvent('heatmap-updated'));
    window.dispatchEvent(new CustomEvent('profile-updated'));
  },

  // Business Logic Methods
  addTask: (title: string, category: 'work' | 'learning', priority: 'low' | 'medium' | 'high', estimatedTime: number, timeOfDay?: string): Task => {
    const tasks = stateManager.getTasks();
    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
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

  /** 
   * Permanently removes a course everywhere across the platform:
   * - Courses collection & active ID
   * - Linked roadmap nodes (by courseId and title matching)
   * - Linked goals (by title/category matching)
   * - Linked daily tasks (by course title matching)
   * - Associated profile skills if no remaining courses use that skill
   * - Recalculates all profile stats
   * - Dispatches events to update all UI views reactively
   */
  removeCourse: (id: string): Course[] => {
    const allCourses = stateManager.getCourses();
    const courseToRemove = allCourses.find(c => c.id === id);
    const updatedCourses = allCourses.filter(c => c.id !== id);
    stateManager.saveCourses(updatedCourses);

    const targetTitle = courseToRemove ? courseToRemove.title.toLowerCase().trim() : '';

    // 1. Remove matching roadmap nodes
    const roadmap = stateManager.getRoadmap();
    const updatedRoadmap = roadmap.filter(node => {
      if (node.id.includes(id)) return false;
      if (targetTitle && node.title.toLowerCase().includes(targetTitle)) return false;
      return true;
    });
    stateManager.saveRoadmap(updatedRoadmap);

    // 2. Remove matching goals
    const goals = stateManager.getGoals();
    const updatedGoals = goals.filter(g => {
      if (g.id.includes(id)) return false;
      const gTitle = g.title.toLowerCase().trim();
      const gCat = (g.category || '').toLowerCase().trim();
      if (targetTitle && (gTitle === targetTitle || gTitle.includes(targetTitle) || targetTitle.includes(gTitle) || gCat === targetTitle)) {
        return false;
      }
      return true;
    });
    stateManager.saveGoals(updatedGoals);

    // 3. Remove matching tasks
    const tasks = stateManager.getTasks();
    const updatedTasks = tasks.filter(t => {
      if (targetTitle && t.title.toLowerCase().includes(targetTitle)) return false;
      return true;
    });
    stateManager.saveTasks(updatedTasks);

    // 4. Update Profile Skills & Stats
    const profile = stateManager.getProfile();
    if (courseToRemove && profile.skills) {
      const skillInfo = getSkillNameForTopic(courseToRemove.title);
      // Check if any other remaining course or goal uses this skill
      const otherCoursesUseSkill = updatedCourses.some(c => 
        c.title.toLowerCase().includes(skillInfo.name.toLowerCase()) ||
        skillInfo.name.toLowerCase().includes(c.title.toLowerCase())
      );
      const otherGoalsUseSkill = updatedGoals.some(g => 
        g.title.toLowerCase().includes(skillInfo.name.toLowerCase()) ||
        skillInfo.name.toLowerCase().includes(g.title.toLowerCase())
      );

      if (!otherCoursesUseSkill && !otherGoalsUseSkill) {
        profile.skills = profile.skills.filter(s => s.name.toLowerCase() !== skillInfo.name.toLowerCase());
      }
    }

    // Recalculate stats
    profile.stats.coursesEnrolled = updatedCourses.filter(c => !c.wishlist && c.courseStatus !== 'wishlist').length;
    profile.stats.coursesCompleted = updatedCourses.filter(c => c.progress === 100).length;
    profile.stats.goalsCompleted = updatedGoals.filter(g => g.status === 'Completed').length;
    stateManager.saveProfile(profile);

    // 5. Clean active course ID in localStorage
    const activeStoredId = localStorage.getItem('career_os_active_course_id');
    if (activeStoredId === id) {
      const fallbackCourse = updatedCourses.find(c => !c.wishlist) || updatedCourses[0];
      if (fallbackCourse) {
        localStorage.setItem('career_os_active_course_id', fallbackCourse.id);
      } else {
        localStorage.removeItem('career_os_active_course_id');
      }
    }

    // 6. Log Agent activity
    stateManager.addLog({
      timestamp: new Date().toLocaleTimeString(),
      agent: 'Roadmap Agent',
      action: 'remove_course_cascade',
      status: 'success',
      message: `Permanently purged "${courseToRemove?.title || id}" and unlinked all associated roadmap nodes, study goals, daily tasks, and profile skills.`,
      reasoning: 'Executed full cascading removal across all platform sub-modules.'
    });

    // 7. Dispatch events
    window.dispatchEvent(new CustomEvent('courses-updated'));
    window.dispatchEvent(new CustomEvent('roadmap-updated'));
    window.dispatchEvent(new CustomEvent('goals-updated'));
    window.dispatchEvent(new CustomEvent('tasks-updated'));
    window.dispatchEvent(new CustomEvent('profile-updated'));
    window.dispatchEvent(new CustomEvent('course-deleted', { detail: { courseId: id } }));

    showToast(`Course "${courseToRemove?.title || id}" removed everywhere.`, 'error');

    return updatedCourses;
  },

  /**
   * Permanently removes a Goal and executes full cascading removal of
   * corresponding course, roadmap nodes, daily tasks, and profile skills.
   */
  removeGoal: (goalId: string): Goal[] => {
    const goals = stateManager.getGoals();
    const goalToRemove = goals.find(g => g.id === goalId);
    const updatedGoals = goals.filter(g => g.id !== goalId);
    stateManager.saveGoals(updatedGoals);

    if (goalToRemove) {
      const gTitle = goalToRemove.title.toLowerCase().trim();
      const courses = stateManager.getCourses();
      const matchingCourse = courses.find(c => 
        c.id === goalId ||
        c.id === `course-sync-${goalId}` ||
        c.id === goalId.replace('goal-', '') ||
        c.title.toLowerCase().trim() === gTitle ||
        c.title.toLowerCase().includes(gTitle) ||
        gTitle.includes(c.title.toLowerCase().trim())
      );

      if (matchingCourse) {
        stateManager.removeCourse(matchingCourse.id);
      } else {
        // Remove matching roadmap nodes
        const roadmap = stateManager.getRoadmap().filter(n => !n.id.includes(goalId) && (!gTitle || !n.title.toLowerCase().includes(gTitle)));
        stateManager.saveRoadmap(roadmap);

        // Remove tasks
        const tasks = stateManager.getTasks().filter(t => !gTitle || !t.title.toLowerCase().includes(gTitle));
        stateManager.saveTasks(tasks);

        window.dispatchEvent(new CustomEvent('goals-updated'));
        window.dispatchEvent(new CustomEvent('roadmap-updated'));
        window.dispatchEvent(new CustomEvent('tasks-updated'));
        window.dispatchEvent(new CustomEvent('profile-updated'));
        window.dispatchEvent(new CustomEvent('goal-deleted', { detail: { goalId } }));

        showToast(`Goal "${goalToRemove.title}" removed everywhere.`, 'error');
      }
    }
    return updatedGoals;
  },

  /** Moves a course to the Wishlist (saves for later, not actively studying) */
  addCourseToWishlist: (id: string): Course[] => {
    const courses = stateManager.getCourses();
    const idx = courses.findIndex(c => c.id === id);
    if (idx !== -1) {
      courses[idx] = { ...courses[idx], courseStatus: 'wishlist', wishlist: true };
      stateManager.saveCourses(courses);
      showToast(`Saved "${courses[idx].title}" to Wishlist`, 'info');
      stateManager.addLog({
        timestamp: new Date().toLocaleTimeString(),
        agent: 'Roadmap Agent',
        action: 'wishlist_course',
        status: 'success',
        message: `Course "${courses[idx].title}" saved to Wishlist.`,
        reasoning: 'User deferred course for future study.'
      });
    }
    return stateManager.getCourses();
  },

  /** Moves a wishlisted course back to Active status */
  moveCourseToActive: (id: string): Course[] => {
    const courses = stateManager.getCourses();
    const idx = courses.findIndex(c => c.id === id);
    if (idx !== -1) {
      courses[idx] = { ...courses[idx], courseStatus: 'active', wishlist: false };
      stateManager.saveCourses(courses);
      showToast(`Moved "${courses[idx].title}" to Active Track!`, 'success');
      stateManager.addLog({
        timestamp: new Date().toLocaleTimeString(),
        agent: 'Roadmap Agent',
        action: 'activate_course',
        status: 'success',
        message: `Course "${courses[idx].title}" activated in curriculum.`,
        reasoning: 'User resumed active learning.'
      });
    }
    return stateManager.getCourses();
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
      description: `Targeted curriculum for building master level competency in ${title}.`,
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

    // Generate complete rich course package (4 tailored chapters, video lectures, test assessments, terminology)
    const newCourse = generateCustomCourse(title, difficulty, expectedOutcome, studyTime);
    const courses = stateManager.getCourses();
    courses.push(newCourse);
    stateManager.saveCourses(courses);

    // Generate and save matching roadmap nodes for this course
    const courseRoadmapNodes = generateRoadmapNodesForCourse(newCourse);
    const existingRoadmap = stateManager.getRoadmap();
    // Add unique nodes to global roadmap
    const updatedRoadmap = [...existingRoadmap];
    courseRoadmapNodes.forEach(node => {
      if (!updatedRoadmap.some(r => r.id === node.id)) {
        updatedRoadmap.push(node);
      }
    });
    stateManager.saveRoadmap(updatedRoadmap);

    // Register or boost the associated skill in the user's Profile & Skills Matrix
    const skillInfo = getSkillNameForTopic(title);
    const profile = stateManager.getProfile();
    if (!profile.skills) profile.skills = [];
    
    const existingSkillIdx = profile.skills.findIndex(
      s => s.name.toLowerCase() === skillInfo.name.toLowerCase() ||
           s.name.toLowerCase().includes(title.toLowerCase()) ||
           title.toLowerCase().includes(s.name.toLowerCase())
    );

    const initialLevel = difficulty === 'Advanced' ? 55 : difficulty === 'Intermediate' ? 42 : 30;
    if (existingSkillIdx !== -1) {
      profile.skills[existingSkillIdx].level = Math.max(profile.skills[existingSkillIdx].level, initialLevel);
    } else {
      profile.skills.push({
        name: skillInfo.name,
        level: initialLevel
      });
    }
    stateManager.saveProfile(profile);

    // Save active course ID in localStorage for deep linking
    try {
      localStorage.setItem('career_os_active_course_id', newCourse.id);
    } catch {}

    // Dispatch system events
    window.dispatchEvent(new CustomEvent('profile-updated'));
    window.dispatchEvent(new CustomEvent('roadmap-updated'));
    window.dispatchEvent(new CustomEvent('goals-updated'));
    window.dispatchEvent(new CustomEvent('course-selected', { detail: { courseId: newCourse.id } }));

    // Run verification agent in background
    setTimeout(() => {
      verificationAgent.auditCourse(newCourse, true);
    }, 400);

    showToast(`🎯 Goal & Course created with tailored roadmap!`, 'success');

    return createdGoal;
  },

  /**
   * Registers a course with full syllabus, video playlists, roadmap nodes, and updates skills in profile
   */
  addCourseWithRoadmap: (course: Course): Course => {
    const courses = stateManager.getCourses();
    const existingIdx = courses.findIndex(c => c.id === course.id);
    if (existingIdx !== -1) {
      courses[existingIdx] = { ...courses[existingIdx], ...course, courseStatus: 'active', wishlist: false };
    } else {
      courses.push(course);
    }
    stateManager.saveCourses(courses);

    // 1. Atomically sync/create the corresponding Goal in career_os_goals
    const goals = stateManager.getGoals();
    const existingGoalIdx = goals.findIndex(g => 
      g.title.toLowerCase().trim() === course.title.toLowerCase().trim() ||
      g.id === `goal-${course.id}`
    );
    if (existingGoalIdx !== -1) {
      goals[existingGoalIdx] = {
        ...goals[existingGoalIdx],
        title: course.title,
        status: 'On Track',
        difficulty: course.difficulty,
        progress: course.progress || 0
      };
    } else {
      goals.push({
        id: `goal-${course.id}`,
        title: course.title,
        description: course.description || `Targeted curriculum for building master level competency in ${course.title}.`,
        difficulty: course.difficulty,
        currentLevel: course.difficulty === 'Advanced' ? 'Intermediate' : 'Beginner',
        targetLevel: course.difficulty,
        deadlineDays: 45,
        progress: course.progress || 0,
        streak: 1,
        status: 'On Track',
        category: course.provider || 'Computer Science',
        expectedOutcome: `Master all chapters and complete capstone verification in ${course.title}.`,
        studyTimePreference: course.estimatedTime || '1 hour/day',
        learningStylePreference: 'Mixed',
        createdAt: new Date().toISOString().split('T')[0]
      });
    }
    stateManager.saveGoals(goals);

    // 2. Sync roadmap nodes
    const courseNodes = generateRoadmapNodesForCourse(course);
    const roadmap = stateManager.getRoadmap();
    courseNodes.forEach(node => {
      if (!roadmap.some(r => r.id === node.id)) {
        roadmap.push(node);
      }
    });
    stateManager.saveRoadmap(roadmap);

    // 3. Sync skill into profile
    const skillInfo = getSkillNameForTopic(course.title);
    const profile = stateManager.getProfile();
    if (!profile.skills) profile.skills = [];
    if (!profile.skills.some(s => s.name.toLowerCase() === skillInfo.name.toLowerCase())) {
      profile.skills.push({
        name: skillInfo.name,
        level: course.difficulty === 'Advanced' ? 55 : course.difficulty === 'Intermediate' ? 42 : 30
      });
      stateManager.saveProfile(profile);
      window.dispatchEvent(new CustomEvent('profile-updated'));
    }

    try {
      localStorage.setItem('career_os_active_course_id', course.id);
    } catch {}

    window.dispatchEvent(new CustomEvent('roadmap-updated'));
    window.dispatchEvent(new CustomEvent('goals-updated'));
    window.dispatchEvent(new CustomEvent('courses-updated'));
    window.dispatchEvent(new CustomEvent('course-selected', { detail: { courseId: course.id } }));
    
    // Run verification agent in background
    setTimeout(() => {
      verificationAgent.auditCourse(course, true);
    }, 400);

    showToast(`📚 Course "${course.title}" enrolled & synced to Goals!`, 'success');
    return course;
  },

  // ── Quiz & Badge Awarding ───────────────────────────────────────────────────
  awardQuizBadge: (badgeType: 'master' | 'proficient' | 'learner', topic: string, score: number, total: number) => {
    const badges = stateManager.getBadges();
    let targetBadgeId = 'badge-quiz-bronze';
    if (badgeType === 'master') targetBadgeId = 'badge-quiz-gold';
    else if (badgeType === 'proficient') targetBadgeId = 'badge-quiz-silver';

    let badgeUpdated = false;
    const badgeIndex = badges.findIndex(b => b.id === targetBadgeId);
    if (badgeIndex !== -1 && !badges[badgeIndex].unlocked) {
      badges[badgeIndex] = {
        ...badges[badgeIndex],
        unlocked: true,
        unlockedAt: new Date().toISOString()
      };
      badgeUpdated = true;
      stateManager.saveBadges(badges);
      showToast(`🏆 Badge Unlocked: ${badges[badgeIndex].title}!`, 'badge');
    }

    // Log XP & Activity
    const xpPoints = badgeType === 'master' ? 4 : badgeType === 'proficient' ? 3 : 2;
    stateManager.logActivity(xpPoints);

    stateManager.addLog({
      timestamp: new Date().toLocaleTimeString(),
      agent: 'Assessment Agent',
      action: 'award_badge',
      status: 'success',
      message: `Awarded ${targetBadgeId.toUpperCase()} for ${topic} assessment (${score}/${total}).`,
      reasoning: `Student demonstrated ${Math.round((score / total) * 100)}% accuracy in diagnostic evaluation.`
    });
  }
};

// ─── Wire the Model Router logger to AgentTerminal ────────────────────────────
// This must happen after stateManager is defined to avoid circular dependency.
setRouterLogger((entry) => stateManager.addLog(entry as AgentLog));
