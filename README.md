<div align="center">

# 🚀 CareerOS — AI-Powered Career Learning Platform

**A multi-agent AI operating system that unifies your career goals, personalized learning roadmaps, real-time interview prep, and daily work schedule into one intelligent workspace.**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.x-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Vitest](https://img.shields.io/badge/Vitest-4.x-729B1B?style=flat-square&logo=vitest)](https://vitest.dev)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

[Quick Start (Non-Technical)](#-quick-start-non-technical--just-run-it) • [Technical Architecture](#-technical-architecture--deep-dive) • [AI Multi-Agent System](#-ai-agent-architecture) • [Deployment](#-deployment-guide)

</div>

---

## 📖 What Is CareerOS? *(For Non-Technical Users)*

### The Problem It Solves
Imagine you are an engineer or professional working a demanding job. You want to level up your career (for instance, mastering **Generative AI & LLMs** to transition into an AI Engineer role). 

Currently, your workflow is fractured across disconnected tools:
- 📌 Learning materials are scattered across YouTube, Coursera, research papers, and documentation.
- 🎯 Career goals stay as unorganized notes or mental wishlists without clear milestones.
- ⏰ Work calendars (like Microsoft Teams / Outlook) collide with study hours.
- 🧪 There is no continuous verification of your actual competency.
- 🎙️ Mock interview practice is expensive, stressful, or hard to schedule.

### The Solution: CareerOS
**CareerOS acts as your personal AI Career Co-Pilot, Tutor, and Executive Assistant in a single dashboard:**
1. **Plans Your Roadmap**: Tell CareerOS your dream job or skill target. AI agents generate an end-to-end curriculum with estimated hours and prerequisites.
2. **Curates University-Grade Content**: Finds and organizes courses from top institutions (MIT, Stanford, NPTEL) with interactive chapter textbooks.
3. **Schedules Your Day**: Analyzes your work commitments (M365 tasks/meetings) and intelligently schedules study blocks into your daily plan.
4. **Tests & Retains Knowledge**: Interactive chapter quizzes, AI chapter tutors, and long-term vector memory to revisit weak spots.
5. **Prepares You for Interviews**: Live interactive technical and behavioral mock interview sessions with immediate AI feedback and scorecards.

---

## ✨ Features At A Glance

### 🌟 For Learners & Professionals (Non-Technical View)

| Feature | Description |
|---|---|
| 🏠 **Unified Dashboard** | Central command center showing current goals, active courses, daily timeline, skill radar, and activity heatmap. |
| 🎯 **AI Goal Planner** | State your target role; AI breaks it down into progressive milestones, timelines, and courses. |
| 📚 **Interactive Course Reader** | Read university-grade chapter textbooks complete with deep explanations, intuitive analogies, video links, and hands-on exercises. |
| 🤖 **In-Chapter AI Tutor** | Ask questions directly inside any chapter to get instant, contextual explanations. |
| 🎙️ **AI Mock Interview Coach** | Practice live technical and behavioral interview questions with real-time scoring, tips, and rubric evaluations. |
| 🧠 **Intelligent Memory** | CareerOS remembers your historical strengths, quiz mistakes, and learning style across sessions. |
| 📅 **Smart Daily Planner** | Merges your daily work tasks and meetings with optimized study windows so you never burn out. |
| 💼 **Workplace Intelligence** | Integrates with Microsoft 365 (Tasks & Calendar) to adapt your learning load to heavy work days. |
| 🏆 **Streaks & Gamification** | Unlock achievements, earn XP, and track your consistency with a GitHub-style activity heatmap. |
| 🛡️ **Offline & Resilient** | Fully functional in your browser offline with local data storage and zero required configuration. |

---

## 🚀 Quick Start *(Non-Technical — Just Run It)*

You can get CareerOS running on your computer in **3 simple steps**.

### Prerequisites
- Install **Node.js** (v18 or higher): [Download from nodejs.org](https://nodejs.org)
- Install **Git**: [Download from git-scm.com](https://git-scm.com)

---

### Step 1: Open Terminal / Command Prompt and Clone
```bash
git clone https://github.com/ps-deepak-kumar/CareerOS.git
cd CareerOS
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Run the App
```bash
npm run dev
```

Open your web browser and go to:
👉 **[http://localhost:5173](http://localhost:5173)**

> [!TIP]
> **No API keys required to start!** CareerOS includes built-in offline simulation mode and mock intelligence out-of-the-box. You can plug in free AI keys whenever you are ready.

---

## ⚙️ Technical Architecture & Deep Dive *(For Developers)*

CareerOS is built with a decoupled, event-driven client architecture leveraging **Model Context Protocol (MCP)** standards and multi-provider AI model routing.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CareerOS Web UI (React 19)                    │
│   Dashboard │ Goals │ Learning │ Interview Prep │ Daily Plan │ Settings │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ User Actions & Prompts
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         Orchestrator & Agent Layer                      │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────────────┐  │
│  │  Goal Agent  │ │ Roadmap Agent│ │Interview Agent│ │ Planner Agent │  │
│  └──────────────┘ └──────────────┘ └──────────────┘ └────────────────┘  │
│  ┌─────────────────────────────┐ ┌───────────────────────────────────┐  │
│  │  Reflection / Critic Agent   │ │  2-Tier Verification Agent        │  │
│  └─────────────────────────────┘ └───────────────────────────────────┘  │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ Typed Tool Invocations
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       Model Context Protocol (MCP) Tools                │
│  • careerMcp     • learningMcp      • resourceMcp     • productivityMcp │
│  • memoryMcp     • assessmentMcp    • m365Mcp                           │
└───────────────────┬─────────────────────────────────┬───────────────────┘
                    │                                 │
     Semantic Embeddings & Storage         AI Inference & LLM Routing
                    ▼                                 ▼
┌──────────────────────────────────────┐ ┌────────────────────────────────┐
│      Client-Side Vector Engine       │ │       AI Model Router          │
│ • Transformers.js (MiniLM-L6-v2)     │ │ 1. OpenRouter (Claude 3.5)     │
│ • Cosine Similarity Search           │ │ 2. Groq (Llama 3.1 70B)        │
│ • LocalStorage Vector Store          │ │ 3. Google Gemini 1.5 Flash     │
│ • StateManager with JSON migration   │ │ 4. Ollama (Local)              │
│                                      │ │ 5. Offline Simulation Fallback │
│                                      │ │ ------------------------------ │
│                                      │ │ • Rate Limiting & Token Cache  │
└──────────────────────────────────────┘ └────────────────────────────────┘
```

---

## 🤖 AI Agent Architecture

CareerOS implements a coordinated hierarchy of specialized autonomous agents:

| Agent | Module | Role & Core Functionality |
|---|---|---|
| **Orchestrator Agent** | `src/services/ai/` | Receives intent, assesses task complexity, and routes sub-tasks to specialized agents. |
| **Goal Planning Agent** | `careerMcp.ts` | Deconstructs high-level career objectives into milestone trees, timelines, and competency requirements. |
| **Skill Gap Analyzer** | `careerMcp.ts` | Evaluates current learner profile against target industry roles to identify delta proficiencies. |
| **Curriculum & Roadmap Agent** | `learningMcp.ts` | Builds structured learning roadmaps, chapter textbooks, and practice exercises. |
| **Resource Discovery Agent** | `resourceMcp.ts` | Queries academic catalogs, YouTube, and course repositories; computes multi-metric quality scores. |
| **Interview Prep Agent** | `interviewAgent.ts` | Conducts dynamic mock interviews, simulates interviewers, and produces granular rubric-based scorecards. |
| **Reflection & Critic Agent** | `reflectionAgent.ts` | Audits generated roadmaps and study plans for pedagogical flow, cognitive overload, and pacing issues. |
| **Verification Agent** | `verificationAgent.ts` | Two-tier verification pipeline validating accuracy, safety, schema conformance, and relevance before rendering. |
| **Daily Planner Agent** | `productivityMcp.ts` | Resolves calendar conflicts by combining M365 work tasks with spaced learning intervals. |
| **Memory & Context Agent** | `memoryMcp.ts` | Encodes user history, quiz weaknesses, and preferences into vector representations for long-term recall. |

---

## ⚡ Multi-Model AI Routing & Resilience

The `ModelRouter` (`src/services/ai/modelRouter.ts`) intelligently chooses the optimal provider based on task complexity, speed requirements, and token economics:

1. **High-Complexity Tasks** (Curriculum design, deep reflection, detailed interview evaluation)  
   👉 Routed to **OpenRouter / Claude 3.5 Sonnet**.
2. **High-Speed Tasks** (Quick quiz generation, daily scheduling, real-time chat)  
   👉 Routed to **Groq / Llama 3.1 70B** (ultra-low latency).
3. **Large Context Analysis** (Full syllabus synthesis, comprehensive work intel)  
   👉 Routed to **Google Gemini 1.5 Flash**.
4. **Local / Private Workflows** (Offline privacy-first usage)  
   👉 Routed to **Local Ollama** (`http://localhost:11434`).
5. **Automatic Fallback Chain & Offline Mode**:  
   If an API key is missing, network is unreachable, or rate limits are encountered, requests automatically cascade down the chain to local heuristics and built-in mock simulation.

### Built-in Optimization Utilities
- **Response Caching** (`responseCache.ts`): SHA-256-based in-memory and storage cache to prevent duplicate LLM calls and reduce API costs.
- **Token Bucket Rate Limiter** (`rateLimiter.ts`): Client-side sliding-window rate limiting to protect provider quotas.
- **Client-Side Embeddings** (`semanticSimilarity.ts` & `vectorStore.ts`): Uses `@xenova/transformers` with browser-optimized ONNX runtime for on-device vector similarity.

---

## 📂 Project Directory Structure

```
src/
├── App.tsx                        # Hash SPA routing & navigation state
├── main.tsx                       # React 19 application root
├── index.css                      # Global design system, glassmorphism tokens & animations
│
├── components/                    # Reusable UI components
│   ├── Layout.tsx                 # Sidebar navigation, topbar status & layout frame
│   ├── AgentTerminal.tsx          # Real-time multi-agent MCP execution terminal
│   ├── ErrorBoundary.tsx          # Resilient crash prevention and recovery fallback
│   ├── OfflineBanner.tsx          # Network status detection & offline indicator
│   ├── Heatmap.tsx                # GitHub-style daily learning activity heatmap
│   └── ProgressRing.tsx           # Animated SVG progress indicators
│
├── pages/                         # Core Application Views
│   ├── Landing.tsx                # Visual overview and feature showcase
│   ├── Dashboard.tsx              # Primary learner cockpit and analytics
│   ├── DailyPlan.tsx              # Adaptive work-study daily schedule
│   ├── Goals.tsx                  # Goal list & progress tracker
│   ├── SetGoal.tsx                # AI goal roadmap generator wizard
│   ├── GoalDetails.tsx            # Deep-dive goal milestones & tasks
│   ├── Learning.tsx               # Course library & AI course search
│   ├── CourseDetails.tsx          # Interactive textbook reader & chapter AI tutor
│   ├── InterviewPrep.tsx          # Interactive AI mock interview simulator
│   ├── Quiz.tsx                   # Standalone quiz assessment center
│   ├── Resources.tsx              # Curated university & media resources
│   ├── Achievements.tsx           # Badges, streak tracking & XP rewards
│   ├── Profile.tsx                # Learner profile & skill radar visualization
│   ├── WorkIntelligence.tsx       # Microsoft 365 sync & task analyzer
│   └── Settings.tsx               # API keys, theme & profile configuration
│
├── services/                      # Core Intelligence Layer
│   ├── stateManager.ts            # Persistent LocalStorage state with migration
│   ├── microsoftGraphService.ts   # MSAL browser & M365 Graph integration
│   ├── ai/
│   │   ├── modelRouter.ts         # Multi-model routing & fallback engine
│   │   ├── interviewAgent.ts      # Behavioral & technical interview generator
│   │   ├── reflectionAgent.ts     # Curriculum audit & self-correction agent
│   │   ├── verificationAgent.ts   # 2-tier quality validation engine
│   │   ├── responseCache.ts       # LRU response caching system
│   │   ├── semanticSimilarity.ts  # Client-side embedding & cosine similarity
│   │   └── providers/             # Provider implementations
│   │       ├── openRouterProvider.ts
│   │       ├── groqProvider.ts
│   │       ├── geminiProvider.ts
│   │       └── ollamaProvider.ts
│   ├── mcp/                       # Model Context Protocol Tool Servers
│   │   ├── careerMcp.ts
│   │   ├── learningMcp.ts
│   │   ├── resourceMcp.ts
│   │   ├── memoryMcp.ts
│   │   ├── productivityMcp.ts
│   │   ├── assessmentMcp.ts
│   │   └── m365Mcp.ts
│   ├── memory/
│   │   └── vectorStore.ts         # In-browser semantic vector store
│   └── utils/
│       └── rateLimiter.ts         # Token bucket rate limiting utility
│
└── __tests__/                     # Automated Test Suites (Vitest)
    ├── modelRouter.test.ts
    ├── resourceMcp.test.ts
    └── verificationAgent.test.ts
```

---

## 🔑 Environment Configuration

Create a `.env` file in your root folder (or copy from `.env.example`):

```bash
# Windows Command Prompt
copy .env.example .env

# Mac / Linux / PowerShell
cp .env.example .env
```

### Environment Variables Guide

| Variable | Required? | Purpose / Provider | How to obtain |
|---|---|---|---|
| `VITE_OPENROUTER_API_KEY` | Optional | Claude 3.5 Sonnet & GPT-4o for complex planning | [openrouter.ai](https://openrouter.ai) |
| `VITE_GROQ_API_KEY` | Optional | Llama 3.1 70B for ultra-fast instant inference | [console.groq.com](https://console.groq.com) |
| `VITE_GEMINI_API_KEY` | Optional | Gemini 1.5 Flash for large context processing | [aistudio.google.com](https://aistudio.google.com) |
| `VITE_OLLAMA_BASE_URL` | Optional | Local model endpoint (defaults to `http://localhost:11434`) | [ollama.ai](https://ollama.ai) |
| `VITE_MICROSOFT_CLIENT_ID`| Optional | Microsoft 365 Azure App ID for live Graph sync | [portal.azure.com](https://portal.azure.com) |
| `VITE_MICROSOFT_TENANT_ID`| Optional | Azure Tenant ID (`common` for multi-tenant) | Azure Portal |
| `VITE_YOUTUBE_API_KEY`    | Optional | YouTube Data API v3 for live video discovery | [console.cloud.google.com](https://console.cloud.google.com) |
| `VITE_GITHUB_TOKEN`       | Optional | GitHub API for repository exploration (rate limits) | [github.com/settings/tokens](https://github.com/settings/tokens) |
| `VITE_ADZUNA_APP_ID`      | Optional | Live job market demand integration | [developer.adzuna.com](https://developer.adzuna.com) |
| `VITE_ADZUNA_APP_KEY`     | Optional | Live job market demand API key | [developer.adzuna.com](https://developer.adzuna.com) |

> [!NOTE]
> All services gracefully degrade to simulated intelligent mock providers if keys are omitted.

---

## 🧪 Testing & Quality Assurance

CareerOS comes with a comprehensive automated test suite powered by **Vitest** and **React Testing Library**:

```bash
# Run all automated tests
npm test

# Run tests in interactive UI mode
npm run test:ui

# Run tests in watch mode during development
npm run test:watch

# Run fast static code analysis
npm run lint
```

---

## 🚢 Deployment Guide

### Deploy to Vercel (Recommended)
CareerOS includes [`vercel.json`](vercel.json) configured for single-page application routing.
1. Push your repository to GitHub.
2. Import the project in the [Vercel Dashboard](https://vercel.com).
3. Set Framework Preset to **Vite**.
4. (Optional) Add your environment variables under Settings → Environment Variables.
5. Click **Deploy**.

### Deploy to Netlify
CareerOS includes [`netlify.toml`](netlify.toml) configured with redirect rules:
1. Push your repository to GitHub.
2. Link your repo in the [Netlify Dashboard](https://netlify.com).
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Click **Deploy Site**.

---

## 🎨 Design System

CareerOS features a modern **Deep Space Glassmorphism** design palette:
- **Background**: `#050509` (Void Black) with ambient radial gradients
- **Surfaces**: `#0b0c14` / `#131625` with `backdrop-blur-xl` and subtle `1px` translucent borders
- **Primary Accent**: `#6366f1` (Electric Indigo) for actions and key metrics
- **Secondary Accent**: `#06b6d4` (Cyber Cyan) for status indicators and active states
- **Typography**: Clean hierarchy with `Inter` for interface elements and `JetBrains Mono` for agent terminal execution logs

---

## 🤝 Contributing

Contributions are welcome!
1. Fork the Project (`https://github.com/ps-deepak-kumar/CareerOS/fork`)
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: Add AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for more information.

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/ps-deepak-kumar">Deepak Kumar</a></sub>
</div>
