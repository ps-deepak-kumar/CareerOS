<div align="center">

# 🚀 CareerOS — AI-Powered Career Learning Platform

**A multi-agent AI system that unifies your career goals, personalized learning, and daily work schedule into one intelligent operating system.**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.x-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

</div>

---

## 📖 What Is CareerOS? *(For Everyone)*

Imagine you are a software engineer working a full-time job. Every day you want to:
- Learn **Transformers and AI** to get promoted or switch roles
- Track your **career goals** with a clear roadmap
- Balance your **Microsoft Teams workload** with dedicated study time
- Follow a **structured university-grade curriculum** — not just random YouTube videos

Today, all of these happen in separate, disconnected tools. **CareerOS solves this.**

CareerOS is your **AI Career Operating System** — a single intelligent dashboard where:
- 🧠 **AI agents** automatically plan your learning roadmap
- 📚 **University courses** (MIT, Stanford, NPTEL) are discovered and curated for your level
- 🗓️ **Daily plans** balance work tasks and study sessions intelligently
- 📊 **Progress** is tracked through interactive chapter quizzes and an AI tutor
- 🏆 **Achievements, streaks, and badges** keep you motivated

No configuration needed. No data science degree required. Just open it and start.

---

## 🎯 Problem Statement

Modern professionals — especially in fast-moving fields like AI/ML and software engineering — face a critical gap:

| Pain Point | Today's Reality |
|---|---|
| 📚 Learning is fragmented | Scattered across YouTube, Coursera, PDFs — no structure |
| 🎯 Goals are vague | Tracked in sticky notes or Excel with no AI guidance |
| ⏰ Time is wasted | No tool balances work deadlines with study commitments |
| 🧪 Progress is passive | Progress bars — no real competency verification |
| 🤖 No personalization | Generic courses, not adapted to your skill level or goal |

**CareerOS fixes all five** using a coordinated network of AI agents running behind the scenes.

---

## ✨ Key Features

### For Non-Technical Users

| Feature | What it does |
|---|---|
| 🏠 **Smart Dashboard** | See your goals, active courses, daily plan, skill levels, and activity heatmap in one view |
| 🎯 **AI Goal Planner** | Tell the AI your career target — it generates a full roadmap with milestones, timeline, and courses |
| 📚 **Course Textbook Reader** | Open any course chapter and read structured lessons with explanations, analogies, video links, and practice exercises |
| 🧠 **Interactive Quizzes** | Answer chapter assessment questions to unlock the next module |
| 🤖 **AI Syllabus Tutor** | Chat with an AI inside each chapter — ask it to explain any concept |
| 🔍 **AI Course Discoverer** | Search any topic — the AI scans MIT, Stanford, NPTEL and YouTube and ranks the best courses for your level |
| 📅 **Daily Plan** | AI schedules your work tasks and study sessions automatically |
| 💼 **Work Intelligence** | Connects with your Microsoft 365 tasks and meetings to factor them into your schedule |
| 🏆 **Achievements** | Unlock badges for streaks, completed courses, and milestones |
| 📊 **Profile and Heatmap** | GitHub-style activity heatmap showing your learning consistency |

---

## 🚀 Quick Start *(Non-Technical — Just Run It)*

### Prerequisites
- Install **Node.js** (version 18 or higher): [nodejs.org](https://nodejs.org)
- Install **Git**: [git-scm.com](https://git-scm.com)

### Step 1 — Clone the project
Open your Terminal (Mac/Linux) or Command Prompt (Windows) and run:
```bash
git clone https://github.com/ps-deepak-kumar/CareerOS.git
cd CareerOS
```

### Step 2 — Install dependencies
```bash
npm install
```
This downloads all the libraries the app needs. It may take 1-2 minutes.

### Step 3 — Set up environment file
```bash
# On Windows (Command Prompt)
copy .env.example .env

# On Mac/Linux
cp .env.example .env
```
The app works without any API keys. The Microsoft 365 integration is simulated by default.

### Step 4 — Start the app
```bash
npm run dev
```

### Step 5 — Open in browser
Visit: **http://localhost:5173**

That is it! CareerOS is running locally on your machine.

---

## ⚙️ Technical Setup *(For Developers)*

### Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | React 19 + TypeScript | Component UI and type safety |
| **Build Tool** | Vite 8 | Fast HMR dev server and production bundler |
| **Styling** | TailwindCSS 3 | Utility-first CSS with custom design tokens |
| **Animation** | Framer Motion 13 | Page transitions and micro-animations |
| **Charts** | Recharts 3 | Skill radar charts, progress visualizations |
| **Icons** | Lucide React | Consistent icon system |
| **Auth** | Azure MSAL Browser | Microsoft 365 identity integration |
| **State** | LocalStorage + custom StateManager | Persistent client-side state |
| **AI Agents** | Custom MCP simulation layer | Multi-agent coordination protocol |
| **Linting** | OxLint | Fast Rust-based linter |

### Folder Structure

```
src/
├── App.tsx                    # Root router (hash-based SPA routing)
├── main.tsx                   # React entry point
├── index.css                  # Global design tokens and base styles
│
├── components/                # Shared UI components
│   ├── Layout.tsx             # Sidebar nav, page shell
│   ├── AgentTerminal.tsx      # Real-time AI agent activity monitor
│   ├── Heatmap.tsx            # GitHub-style activity heatmap
│   └── ProgressRing.tsx       # Circular progress indicator
│
├── pages/                     # Full page views (one per route)
│   ├── Landing.tsx
│   ├── Dashboard.tsx
│   ├── DailyPlan.tsx
│   ├── Goals.tsx / SetGoal.tsx / GoalDetails.tsx
│   ├── Learning.tsx           # Course library + AI Course Discoverer
│   ├── CourseDetails.tsx      # Chapter textbook reader + quiz + AI tutor
│   ├── RoadmapPage.tsx
│   ├── Quiz.tsx
│   ├── Resources.tsx
│   ├── Achievements.tsx
│   ├── Profile.tsx
│   ├── WorkIntelligence.tsx
│   └── Settings.tsx
│
├── data/                      # Static data and mock datasets
│   ├── mockData.ts            # Type definitions + initial seed data
│   └── coursesData.ts         # University course catalog + AI course generator
│
└── services/                  # Business logic and AI agent layer
    ├── stateManager.ts        # LocalStorage state manager with data migration
    ├── ai/
    │   └── modelRouter.ts     # Routes requests to appropriate model provider
    └── mcp/                   # Model Context Protocol tool servers
        ├── careerMcp.ts       # Career goal tools
        ├── learningMcp.ts     # Course search + roadmap generation
        ├── resourceMcp.ts     # Resource discovery tools
        ├── productivityMcp.ts # Schedule optimization tools
        ├── assessmentMcp.ts   # Quiz and assessment tools
        └── m365Mcp.ts         # Microsoft 365 integration tools
```

### Environment Variables

Create a `.env` file in the project root (or copy `.env.example`):

```env
# Microsoft Azure App Registration (for M365 integration)
# Leave as placeholder for demo mode — all M365 data is simulated
VITE_MICROSOFT_CLIENT_ID=your-client-app-id-here
VITE_MICROSOFT_TENANT_ID=common
```

To enable real Microsoft 365 integration:
1. Go to [Azure Portal](https://portal.azure.com) → App Registrations → New Registration
2. Set Redirect URI to `http://localhost:5173`
3. Copy your **Application (client) ID** into `VITE_MICROSOFT_CLIENT_ID`
4. Grant API permissions: `User.Read`, `Tasks.Read`, `Calendars.Read`

### Available Scripts

```bash
npm run dev      # Start development server at http://localhost:5173
npm run build    # Build production bundle to /dist
npm run preview  # Preview production build locally
npm run lint     # Run OxLint static analysis
```

---

## 🤖 AI Agent Architecture

CareerOS uses a **multi-agent system** coordinated through the **Model Context Protocol (MCP)**.

```
User Action
    │
    ▼
┌─────────────────────────────┐
│     Orchestrator Agent      │   Receives intent, routes to specialists
└──────────┬──────────────────┘
           │
    ┌──────┼──────────────────────────────────────┐
    │      │                                      │
    ▼      ▼                                      ▼
┌───────┐ ┌──────────────┐ ┌──────────┐ ┌───────────────────┐
│ Goal  │ │  Skill Gap   │ │ Roadmap  │ │  Daily Planner    │
│ Agent │ │  Agent       │ │ Agent    │ │  Agent            │
└───────┘ └──────────────┘ └──────────┘ └───────────────────┘
    │            │               │               │
    ▼            ▼               ▼               ▼
┌─────────────────────────────────────────────────────────┐
│                    MCP Tool Layer                       │
│  careerMcp  |  learningMcp  |  resourceMcp  |  m365Mcp │
└─────────────────────────────────────────────────────────┘
    │
    ▼
┌───────────────────┐
│ Assessment Agent  │   Grades quizzes, updates XP
│ Progress Agent    │   Logs chapter completions
│ Reflection Agent  │   Curriculum audit and validation
└───────────────────┘
```

### Agent Responsibilities

| Agent | Responsibility |
|---|---|
| **Orchestrator** | Receives user intent, validates inputs, dispatches sub-tasks |
| **Goal Agent** | Parses career goal parameters, stores in career schema |
| **Skill Gap Agent** | Compares current profile skills vs. target level |
| **Roadmap Agent** | Generates chronological learning milestones and prerequisites |
| **Resource Curator** | Searches university catalogs and YouTube for best-match courses |
| **Daily Planner** | Balances M365 tasks with available study windows |
| **Deadline Guardian** | Validates timeline feasibility given pace requirements |
| **Reflection/Critic** | Audits curriculum sequence for logical and pedagogical consistency |
| **Assessment Agent** | Grades chapter quizzes, updates XP and badge status |
| **Progress Agent** | Logs chapter completions, updates course progress metrics |

All agent activity is visible in real-time via the **Agent Terminal** (floating widget, bottom-right corner of the app).

### MCP Tools

Each MCP server exposes typed tools that agents call:

```typescript
// learningMcp tools
learningMcp.search_courses(topic, level, goal)        // Returns Course[]
learningMcp.build_learning_roadmap(topic, ...)        // Returns custom Course
learningMcp.create_daily_learning_plan(title, hours)  // Returns { activities }

// careerMcp tools
careerMcp.create_goal(params)      // Registers a new career goal
careerMcp.get_user_skills()        // Returns current skill profile

// productivityMcp tools
productivityMcp.create_schedule(workHours, studyHours) // Returns DailySchedule
```

---

## 🗺️ App Routes

CareerOS uses hash-based SPA routing (no backend required):

```
/#/landing         Landing page
/#/dashboard       Main dashboard
/#/learning        Course library + AI Discoverer
/#/course-details  Active course chapter reader
/#/goals           Goal tracker
/#/set-goal        Create new goal (AI generates everything)
/#/goal-details    Goal deep-dive: milestones, resources, tasks
/#/daily-plan      AI-balanced daily schedule
/#/roadmap         Visual learning roadmap graph
/#/quiz            Standalone quiz center
/#/resources       Curated learning resources
/#/achievements    Badges and streak tracker
/#/profile         User profile, skills, heatmap
/#/work-intel      Microsoft 365 work intelligence
/#/settings        Profile configuration
```

---

## 🎨 Design System

The UI uses a dark glassmorphism theme built on a custom Tailwind config:

```
Color Tokens
  --brand-bg: #050509        Deep space black (page background)
  --brand-surface: #0b0c14   Card backgrounds
  --brand-border: #1e2238    Subtle borders
  --brand-accent: #6366f1    Indigo primary (buttons, highlights)
  --brand-cyan: #06b6d4      Cyan secondary (stats, indicators)

Typography
  font-display: 'Inter'      Headings and UI labels
  font-mono: 'JetBrains Mono' Code blocks and agent logs
```

Key UI patterns:
- **Glassmorphism panels** with backdrop-blur and subtle borders
- **Gradient glows** using box-shadow with accent colors
- **Framer Motion** page transitions and card hover animations
- **GitHub-style heatmap** for daily activity visualization
- **Multi-dimensional score bars** for course quality ratings

---

## 🙌 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push to your fork: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">
  Built with care by <a href="https://github.com/ps-deepak-kumar">Deepak Kumar</a>
  <br/>
  <sub>Product Squad L2 Assignment</sub>
</div>
