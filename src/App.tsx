import { useState, useEffect } from 'react';
import { Layout, PageId } from './components/Layout';
import { AgentTerminal } from './components/AgentTerminal';
import { ToastContainer } from './components/ToastContainer';
import { OfflineBanner } from './components/OfflineBanner';
import { ErrorBoundary } from './components/ErrorBoundary';
import { stateManager } from './services/stateManager';

// Import Pages
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import DailyPlan from './pages/DailyPlan';
import Goals from './pages/Goals';
import SetGoal from './pages/SetGoal';
import GoalDetails from './pages/GoalDetails';
import Learning from './pages/Learning';
import CourseDetails from './pages/CourseDetails';
import RoadmapPage from './pages/RoadmapPage';
import Quiz from './pages/Quiz';
import Resources from './pages/Resources';
import Achievements from './pages/Achievements';
import ProfilePage from './pages/Profile';
import WorkIntelligence from './pages/WorkIntelligence';
import SettingsPage from './pages/Settings';
import InterviewPrep from './pages/InterviewPrep';

function App() {
  const [activePage, setActivePage] = useState<PageId>('landing');
  const [selectedGoalId, setSelectedGoalId] = useState<string>('goal-1');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('course-1');

  // Active session activity tracker (LeetCode-style heatmap updates)
  useEffect(() => {
    // Log visit immediately on mount (at least 2 points to ensure a solid visible green)
    stateManager.logActivity(2);
    window.dispatchEvent(new CustomEvent('heatmap-updated'));

    // Track active window duration
    const interval = setInterval(() => {
      if (document.hasFocus()) {
        stateManager.logActivity(1);
        window.dispatchEvent(new CustomEvent('heatmap-updated'));
      }
    }, 300000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);


  // Simple Hash-Based Router to handle browser back/forward and routing deep links
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '');
      if (hash) {
        // Validate if it is a valid PageId
        const validPages: PageId[] = [
          'landing', 'dashboard', 'daily-plan', 'goals', 'set-goal',
          'goal-details', 'learning', 'course-details', 'roadmap',
          'quiz', 'resources', 'achievements', 'profile', 'work-intel',
          'interview-prep', 'settings'
        ];
        if (validPages.includes(hash as PageId)) {
          setActivePage(hash as PageId);
        }
      } else {
        // Fallback to landing if empty hash
        setActivePage('landing');
        window.location.hash = '#/landing';
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    // Trigger on initial load
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handlePageChange = (page: PageId) => {
    setActivePage(page);
    window.location.hash = `#/${page}`;
  };

  // Listen for course selection events from StateManager or deep links
  useEffect(() => {
    const handleCourseSelected = (e: Event) => {
      const customEvent = e as CustomEvent<{ courseId: string }>;
      if (customEvent.detail && customEvent.detail.courseId) {
        setSelectedCourseId(customEvent.detail.courseId);
      }
    };
    window.addEventListener('course-selected', handleCourseSelected);
    return () => window.removeEventListener('course-selected', handleCourseSelected);
  }, []);

  const renderActivePage = () => {
    switch (activePage) {
      case 'landing':
        return <Landing onNavigate={handlePageChange} />;
      case 'dashboard':
        return (
          <Dashboard
            onNavigate={handlePageChange}
            setSelectedGoalIdForDetails={setSelectedGoalId}
            setSelectedCourseIdForDetails={setSelectedCourseId}
          />
        );
      case 'daily-plan':
        return <DailyPlan />;
      case 'goals':
        return (
          <Goals
            onNavigate={handlePageChange}
            setSelectedGoalIdForDetails={setSelectedGoalId}
            setSelectedCourseIdForDetails={setSelectedCourseId}
          />
        );
      case 'set-goal':
        return <SetGoal onNavigate={handlePageChange} />;
      case 'goal-details':
        return (
          <GoalDetails
            onNavigate={handlePageChange}
            goalId={selectedGoalId}
            setSelectedCourseIdForDetails={setSelectedCourseId}
          />
        );
      case 'learning':
        return (
          <Learning
            onNavigate={handlePageChange}
            setSelectedCourseIdForDetails={setSelectedCourseId}
          />
        );
      case 'course-details':
        return <CourseDetails onNavigate={handlePageChange} courseId={selectedCourseId} />;
      case 'roadmap':
        return (
          <RoadmapPage
            onNavigate={handlePageChange}
            courseId={selectedCourseId}
            setSelectedCourseIdForDetails={setSelectedCourseId}
          />
        );
      case 'quiz':
        return <Quiz />;
      case 'resources':
        return <Resources />;
      case 'achievements':
        return <Achievements />;
      case 'profile':
        return <ProfilePage />;
      case 'work-intel':
        return <WorkIntelligence />;
      case 'interview-prep':
        return <InterviewPrep />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Landing onNavigate={handlePageChange} />;
    }
  };

  return (
    <>
      {/* Offline/degraded mode banner */}
      <OfflineBanner />

      <Layout
        activePage={activePage}
        onPageChange={handlePageChange}
      >
        <ErrorBoundary pageName={activePage}>
          {renderActivePage()}
        </ErrorBoundary>
      </Layout>

      {/* Floating interactive multi-agent system monitor terminal */}
      <AgentTerminal />

      {/* Global reactive notifications container */}
      <ToastContainer />
    </>
  );
}

export default App;
