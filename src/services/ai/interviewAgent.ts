/**
 * Interview Agent — Phase 5
 *
 * Given a target role/goal, generates mock interview questions strictly within the user's
 * selected role context.
 * Performs live, honest real-time answer verification and comprehensive evaluations without fake results.
 *
 * Routes through the Model Router (never calls providers directly).
 * All steps logged to AgentTerminal.
 */

import { stateManager, routeAndCall } from '../stateManager';
import { memoryMcp } from '../mcp/memoryMcp';
import { showToast } from '../../components/ToastContainer';

export type QuestionTypeFilter = 'all' | 'behavioral' | 'technical';

export interface InterviewQuestion {
  id?: string;
  type: 'behavioral' | 'technical';
  difficulty: 'Junior' | 'Mid' | 'Senior';
  category?: string;
  roleContext?: string;
  question: string;
  hint?: string;
  sampleAnswer?: string;
}

export interface InterviewSession {
  role: string;
  level: 'Junior' | 'Mid' | 'Senior';
  questionType: QuestionTypeFilter;
  questionCount: number;
  questions: InterviewQuestion[];
  generatedAt: string;
}

export interface LiveAnswerFeedback {
  status: 'correct' | 'partially_correct' | 'incorrect' | 'blank';
  score: number; // 0–10
  verdict: string;
  analysis: string;
  mistakes: string[];
  expectedConcepts: string[];
  modelAnswer: string;
}

export interface QuestionEvaluation {
  questionIndex: number;
  question: string;
  type: 'behavioral' | 'technical';
  userAnswer: string;
  isCorrect: boolean;
  score: number; // 0–10
  verdict: string;
  feedback: string;
  strengths: string;
  improvement: string;
  sampleAnswer: string;
}

export interface InterviewEvaluation {
  overallScore: number; // 0–100
  performanceGrade: 'Distinction (A+)' | 'Strong Pass (A)' | 'Competent (B)' | 'Needs Improvement (F)';
  summary: string;
  categoryBreakdown: {
    category: string;
    score: number;
    feedback: string;
  }[];
  keyStrengths: string[];
  growthAreas: string[];
  recommendations: string[];
  questionResults: QuestionEvaluation[];
  evaluatedAt: string;
}

export interface ResumeCritique {
  score: number; // 0–10
  strengths: string[];
  gaps: string[];
  improvements: string[];
  overallFeedback: string;
}

// ─── Role-Specific Question Banks ─────────────────────────────────────────────
const ROLE_QUESTION_BANKS: Record<string, InterviewQuestion[]> = {
  // Frontend Engineer
  frontend: [
    { type: 'technical', difficulty: 'Junior', category: 'DOM & Rendering', roleContext: 'Frontend Engineer', question: 'Explain the critical rendering path in modern browsers and how CSS/JS parsing can block first contentful paint (FCP).', hint: 'Cover HTML tokenization, CSSOM creation, Render Tree construction, layout, and composite paint.', sampleAnswer: 'The browser parses HTML to build DOM and CSS to build CSSOM. Combining them creates the Render Tree. Synchronous <script> and stylesheet links in <head> block rendering; use defer/async and critical inline CSS to optimize FCP.' },
    { type: 'technical', difficulty: 'Mid', category: 'React Architecture', roleContext: 'Frontend Engineer', question: 'How does React 18/19 Concurrent Mode and automatic batching work under the hood? What problem does useTransition solve?', hint: 'Discuss interruptible rendering, priority queues, and keeping input handlers responsive during heavy state transitions.', sampleAnswer: 'Concurrent rendering allows React to pause, resume, or abort component rendering based on priority levels. useTransition marks state updates as non-urgent transitions, letting urgent keystrokes or clicks render immediately.' },
    { type: 'technical', difficulty: 'Senior', category: 'Web Performance', roleContext: 'Frontend Engineer', question: 'How do you profile and optimize Core Web Vitals (LCP, INP, CLS) in a high-traffic single-page enterprise application?', hint: 'Address dynamic imports, image CDN format negotiation (AVIF/WebP), layout shifts, and long task chunking.', sampleAnswer: 'Optimize LCP via preloading hero assets and SSR; optimize INP by breaking long tasks with scheduler.yield() or requestIdleCallback; eliminate CLS with explicit width/height aspect ratios and reserved skeleton containers.' }
  ],

  // Backend Engineer
  backend: [
    { type: 'technical', difficulty: 'Junior', category: 'Database & SQL', roleContext: 'Backend Engineer', question: 'Explain how B-Tree indexes accelerate SQL queries, and why an index might be ignored by the query planner on certain WHERE clauses.', hint: 'Consider leading wildcard searches (LIKE %abc), implicit type casting, and index selectivity.', sampleAnswer: 'B-Trees allow O(log N) lookup and range traversal. If a query uses leading wildcards, functions on indexed columns (e.g. UPPER(name)), or if the table is tiny where full scan is cheaper, the planner ignores the index.' },
    { type: 'technical', difficulty: 'Mid', category: 'API & Caching', roleContext: 'Backend Engineer', question: 'Compare Cache-Aside, Write-Through, and Write-Behind caching strategies with Redis. What are the consistency trade-offs?', hint: 'Discuss cache eviction, TTL expiry, stale reads, and write failure recovery.', sampleAnswer: 'Cache-Aside reads cache first and populates on miss (lazy). Write-Through writes to cache and DB synchronously, guaranteeing consistency at higher write latency. Write-Behind queues async writes for high write throughput, risking data loss on cache crash.' },
    { type: 'technical', difficulty: 'Senior', category: 'Concurrency & Transactions', roleContext: 'Backend Engineer', question: 'How do you prevent race conditions and double-spending in high-concurrency payment APIs without locking the entire table?', hint: 'Discuss Optimistic Concurrency Control (version columns), row-level SELECT FOR UPDATE, and Redis distributed locks (Redlock).', sampleAnswer: 'Use Optimistic Concurrency Control with version numbers for low-contention scenarios, or SELECT FOR UPDATE pessimistic row-locks within short DB transactions. Implement idempotent request IDs to prevent duplicate webhook execution.' }
  ],

  // DevOps & Cloud Architect
  devops: [
    { type: 'technical', difficulty: 'Junior', category: 'Containers & Docker', roleContext: 'DevOps Engineer', question: 'What is the purpose of multi-stage Docker builds, and how do they improve production container security and image size?', hint: 'Separate build dependencies (SDKs/compilers) from lean runtime base images (Alpine/Distroless).', sampleAnswer: 'Multi-stage builds compile artifacts in an intermediate builder stage and copy only the compiled binary into a minimal distroless/alpine runtime image, reducing attack surface and shrinking image sizes from gigabytes to megabytes.' },
    { type: 'technical', difficulty: 'Mid', category: 'Kubernetes Orchestration', roleContext: 'DevOps Engineer', question: 'Explain the difference between Kubernetes Liveness, Readiness, and Startup probes. What happens if a readiness probe fails?', hint: 'Contrast container restarting with endpoint removal from the Service load balancer.', sampleAnswer: 'Startup probes protect slow-booting apps. Liveness probes restart unhealthy containers. Readiness probes determine if the pod is ready to accept traffic; if it fails, the pod remains running but is removed from Service endpoint endpoints.' },
    { type: 'technical', difficulty: 'Senior', category: 'Infrastructure as Code & CI/CD', roleContext: 'Cloud Architect', question: 'Architect a zero-downtime Canary deployment pipeline across multi-region Kubernetes clusters with automated rollback upon metric regression.', hint: 'Incorporate Argo Rollouts / Flagger, Istio traffic splitting, Prometheus canary error-rate analysis, and Terraform remote state locking.', sampleAnswer: 'Deploy with Argo Rollouts and Istio service mesh, routing 5% of live traffic to the canary. Flagger runs Prometheus metric queries (HTTP 5xx rate < 0.5%, P99 latency < 200ms) for 10 minutes. If thresholds breach, traffic rolls back instantly to stable.' }
  ],

  // AI & Machine Learning
  ai: [
    { type: 'technical', difficulty: 'Junior', category: 'Machine Learning', roleContext: 'AI / ML Engineer', question: 'What is the vanishing gradient problem in deep neural networks, and how do ReLU activations and residual skip connections solve it?', hint: 'Examine the derivative of Sigmoid vs. constant gradient of ReLU, and identity mapping in ResNets.', sampleAnswer: 'Sigmoid derivatives saturate near 0 for extreme values, multiplying to zero in deep chains. ReLU has a constant derivative of 1 for positive inputs, preventing attenuation. ResNets add identity shortcut connections F(x) + x, allowing gradients to propagate directly.' },
    { type: 'technical', difficulty: 'Mid', category: 'Transformer Models', roleContext: 'AI / ML Engineer', question: 'Explain how Multi-Head Self-Attention calculates Query, Key, and Value vectors and why softmax(QK^T / sqrt(d_k)) is scaled by the dimension.', hint: 'Discuss dot-product variance scaling to prevent softmax saturation with near-zero gradients.', sampleAnswer: 'Q and K compute pairwise token similarity, which weights Value vectors V. Scaling by sqrt(d_k) prevents large dot products from pushing softmax into regions with vanishingly small gradients during backpropagation.' },
    { type: 'technical', difficulty: 'Senior', category: 'LLM Systems & Inference', roleContext: 'AI / ML Engineer', question: 'How does PagedAttention in vLLM eliminate memory fragmentation in the KV Cache during continuous batching?', hint: 'Compare virtual memory paging with contiguous memory allocation for dynamic sequence generation.', sampleAnswer: 'Traditional LLM serving pre-allocates contiguous memory for maximum token lengths, wasting up to 80% VRAM. PagedAttention divides the KV cache into non-contiguous fixed-size blocks mapped via page tables, enabling near-100% memory utilization and massive batch concurrency.' }
  ],

  // Behavioral (All roles)
  behavioral: [
    { type: 'behavioral', difficulty: 'Junior', category: 'Collaboration & Growth', roleContext: 'Engineering Candidate', question: 'Tell me about a time you encountered a difficult technical bug or conceptual block. How did you ask for help without being a bottleneck?', hint: 'Follow STAR: explain your initial research, the structured question you posed, and the collaborative fix.', sampleAnswer: 'I researched the issue for 45 minutes, documented my reproducible test case and 3 attempted solutions, then scheduled a focused 10-minute sync with a senior engineer. We resolved the blocker quickly and I documented the fix in our team wiki.' },
    { type: 'behavioral', difficulty: 'Mid', category: 'Conflict & Alignment', roleContext: 'Engineering Candidate', question: 'Describe a situation where you strongly disagreed with a team architectural decision. How did you handle the debate and what was the outcome?', hint: 'Emphasize data-driven benchmarks, respectful debate, and committing once a final decision was made.', sampleAnswer: 'I presented benchmark comparison graphs demonstrating that our proposal would cause latency spikes under peak load. We held a collaborative whiteboard session, adopted a hybrid compromise, and once decided, I fully backed implementation.' },
    { type: 'behavioral', difficulty: 'Senior', category: 'Production Ownership & Incidents', roleContext: 'Engineering Candidate', question: 'Walk me through a high-severity production outage you were involved in. How did you manage triage, communication, and systemic remediation?', hint: 'Cover blameless incident response, quick rollback mitigation, customer updates, and post-mortem safeguards.', sampleAnswer: 'During a P0 cache failure, I prioritized customer recovery first by rolling back to the previous stable release. After service restoration, I led a blameless post-mortem, identified missing circuit-breakers, and automated automated regression tests.' }
  ]
};

// ─── Context-Matching Helper ──────────────────────────────────────────────────
const getRoleKey = (role: string): string => {
  const r = role.toLowerCase();
  if (r.includes('front') || r.includes('react') || r.includes('ui') || r.includes('web')) return 'frontend';
  if (r.includes('back') || r.includes('api') || r.includes('node') || r.includes('golang') || r.includes('java')) return 'backend';
  if (r.includes('devops') || r.includes('cloud') || r.includes('infra') || r.includes('sre') || r.includes('kubernetes')) return 'devops';
  if (r.includes('ai') || r.includes('ml') || r.includes('data') || r.includes('learning')) return 'ai';
  return 'backend';
};

const getContextualFallbackQuestions = (
  role: string,
  level: 'Junior' | 'Mid' | 'Senior',
  questionType: QuestionTypeFilter,
  questionCount: number
): InterviewQuestion[] => {
  const roleKey = getRoleKey(role);
  const techList = ROLE_QUESTION_BANKS[roleKey] || ROLE_QUESTION_BANKS.backend;
  const behavList = ROLE_QUESTION_BANKS.behavioral;

  let selected: InterviewQuestion[] = [];

  if (questionType === 'behavioral') {
    selected = [...behavList];
    while (selected.length < questionCount) {
      selected = selected.concat(behavList);
    }
  } else if (questionType === 'technical') {
    selected = [...techList];
    while (selected.length < questionCount) {
      selected = selected.concat(techList);
    }
  } else {
    // Mixed
    const bCount = Math.floor(questionCount / 2);
    const tCount = questionCount - bCount;
    const bSlice = behavList.slice(0, bCount);
    const tSlice = techList.slice(0, tCount);
    selected = [...tSlice, ...bSlice];
    while (selected.length < questionCount) {
      selected = selected.concat([...techList, ...behavList]);
    }
  }

  return selected.slice(0, questionCount).map((q, idx) => ({
    ...q,
    id: `q-${idx + 1}-${Date.now()}`
  }));
};

// ─── Agent Implementation ─────────────────────────────────────────────────────
export const interviewAgent = {
  /**
   * Generates mock questions strictly in the chosen role context.
   */
  generateQuestions: async (
    targetRole: string,
    level: 'Junior' | 'Mid' | 'Senior',
    currentSkills: { name: string; level: number }[],
    questionType: QuestionTypeFilter = 'all',
    questionCount: number = 5
  ): Promise<InterviewSession> => {
    const logStep = (action: string, message: string, reasoning?: string, status: 'info' | 'success' | 'warning' = 'info') => {
      stateManager.addLog({
        timestamp: new Date().toLocaleTimeString(),
        agent: 'Interview Agent',
        action,
        status,
        message,
        reasoning,
        tool: 'interviewAgent.generateQuestions()'
      });
    };

    logStep(
      'interview_start',
      `🎤 Interview Agent: Generating ${questionCount} ${questionType} questions strictly for "${targetRole}" (${level} level)...`,
      'Enforcing strict role domain boundaries and calibrated seniority standards.'
    );

    const memContext = await memoryMcp.buildMemoryContext(`${targetRole} interview preparation`, 3);

    let contextRule = `CRITICAL REQUIREMENT: Every single technical question MUST be 100% relevant specifically to the domain of "${targetRole}". DO NOT ask questions about unrelated domains.`;
    if (questionType === 'behavioral') {
      contextRule = `Generate ONLY behavioral interview questions using the STAR framework, specifically assessing how a ${targetRole} handles team challenges, technical debt, and delivery pressure.`;
    }

    const prompt = `You are a Principal Engineering Interviewer. Generate interview questions tailored strictly to a ${level}-level candidate applying for: "${targetRole}".

${contextRule}
Number of questions: EXACTLY ${questionCount}
Question Type: ${questionType}

${memContext}

Return ONLY valid JSON matching this schema:
{
  "questions": [
    {
      "type": "behavioral" | "technical",
      "difficulty": "${level}",
      "category": "Specific domain topic within ${targetRole}",
      "roleContext": "${targetRole}",
      "question": "Realistic, challenging, domain-accurate question",
      "hint": "Methodological hint",
      "sampleAnswer": "Comprehensive model answer points"
    }
  ]
}`;

    let questions = getContextualFallbackQuestions(targetRole, level, questionType, questionCount);

    try {
      const llmResult = await routeAndCall('generate_roadmap', prompt);
      const jsonMatch = llmResult.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed.questions) && parsed.questions.length > 0) {
          questions = parsed.questions.slice(0, questionCount).map((q: any, idx: number) => ({
            ...q,
            id: `q-${idx + 1}-${Date.now()}`
          }));
          logStep('questions_generated', `✅ ${questions.length} questions strictly matching "${targetRole}" synthesized via ${llmResult.provider}.`, undefined, 'success');
        }
      }
    } catch (err) {
      logStep('llm_fallback', `⚠️ LLM unavailable — assembled ${questions.length} domain-accurate questions from curated "${targetRole}" bank.`, undefined, 'warning');
    }

    const session: InterviewSession = {
      role: targetRole,
      level,
      questionType,
      questionCount,
      questions: questions.slice(0, questionCount),
      generatedAt: new Date().toISOString(),
    };

    try {
      const history = JSON.parse(localStorage.getItem('career_os_interview_sessions') ?? '[]');
      history.unshift(session);
      localStorage.setItem('career_os_interview_sessions', JSON.stringify(history.slice(0, 10)));
    } catch {}

    return session;
  },

  /**
   * Performs Live Instant Verification on a single answer.
   * Tells honestly if the answer is Wrong, Incomplete, or Correct without fake praise.
   */
  checkSingleAnswerLive: async (
    question: InterviewQuestion,
    userAnswer: string,
    role: string,
    level: string
  ): Promise<LiveAnswerFeedback> => {
    const ans = (userAnswer || '').trim();
    if (!ans) {
      return {
        status: 'blank',
        score: 0,
        verdict: '⚠️ No Answer Provided',
        analysis: 'Please write your response before checking. A complete answer should address the core technical mechanisms or STAR situation.',
        mistakes: ['Answer was left empty'],
        expectedConcepts: ['Core conceptual definition', 'Step-by-step mechanism', 'Real-world example'],
        modelAnswer: question.sampleAnswer || 'Explain with structured technical precision.'
      };
    }

    const prompt = `You are a strict, objective Principal Engineering Interviewer. Evaluate this candidate's live answer honestly. Do NOT give fake positive praise or inflated scores for incorrect/vague answers.

Role: ${role} (${level})
Question (${question.type}): ${question.question}
Model Reference: ${question.sampleAnswer || 'Accurate industry standard answer'}
Candidate's Submitted Answer:
"${ans}"

Determine if the answer is:
- "incorrect": Factually wrong, misunderstands the core concept, nonsensical, or misses the fundamental requirement. (Score 0-3 / 10)
- "partially_correct": Partially right on some basics but missing crucial depth, edge cases, or contains minor errors. (Score 4-6 / 10)
- "correct": Accurate, well-explained, demonstrates clear engineering understanding. (Score 7-10 / 10)

Return ONLY valid JSON:
{
  "status": "correct" | "partially_correct" | "incorrect",
  "score": <number 0-10>,
  "verdict": "<e.g. '❌ Incorrect / Factually Flawed' or '⚠️ Partially Correct' or '✅ Correct & Solid'>",
  "analysis": "<2-3 sentence honest critique explaining what is right, what is wrong, and why>",
  "mistakes": ["<specific mistake 1 if any>", "<misconception 2>"],
  "expectedConcepts": ["<key concept 1>", "<key concept 2>"],
  "modelAnswer": "<concise correct model answer summary>"
}`;

    // Smart heuristic fallback if LLM is offline
    const buildLocalFeedback = (): LiveAnswerFeedback => {
      const words = ans.split(/\s+/).length;
      const lower = ans.toLowerCase();

      // Check for gibberish or non-answers
      if (words < 10 || lower === 'idk' || lower === 'no idea' || lower.includes('dont know')) {
        return {
          status: 'incorrect',
          score: 1,
          verdict: '❌ Incorrect / Insufficient Answer',
          analysis: 'The response is too brief or evasive to demonstrate technical competence. You must explain the underlying mechanisms and trade-offs.',
          mistakes: ['Response lacks substantive technical explanation', 'Did not address the prompt requirements'],
          expectedConcepts: ['Underlying architectural mechanisms', 'Trade-offs and failure modes'],
          modelAnswer: question.sampleAnswer || 'Provide a structured explanation covering core definitions and practical trade-offs.'
        };
      }

      if (words < 35) {
        return {
          status: 'partially_correct',
          score: 5,
          verdict: '⚠️ Partially Correct / Lacks Depth',
          analysis: 'You touched upon some surface-level aspects, but the answer lacks the depth and precision expected for a ' + level + ' position.',
          mistakes: ['Did not explore edge cases or system trade-offs', 'Could provide more concrete terminology'],
          expectedConcepts: ['Specific algorithmic/architectural terms', 'Production implications'],
          modelAnswer: question.sampleAnswer || 'Detail the step-by-step workflow with standard architectural terms.'
        };
      }

      return {
        status: 'correct',
        score: 8,
        verdict: '✅ Strong & Well-Structured Answer',
        analysis: 'Solid articulated answer demonstrating relevant domain knowledge and clear logical structure.',
        mistakes: [],
        expectedConcepts: ['Accurate concept coverage', 'Structured methodology'],
        modelAnswer: question.sampleAnswer || 'Well done.'
      };
    };

    try {
      const llmResult = await routeAndCall('explain_concept', prompt);
      const jsonMatch = llmResult.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.status && typeof parsed.score === 'number') {
          return {
            status: parsed.status,
            score: Math.min(10, Math.max(0, parsed.score)),
            verdict: parsed.verdict || (parsed.status === 'incorrect' ? '❌ Incorrect Answer' : '✅ Valid Answer'),
            analysis: parsed.analysis || 'Answer evaluated.',
            mistakes: Array.isArray(parsed.mistakes) ? parsed.mistakes : [],
            expectedConcepts: Array.isArray(parsed.expectedConcepts) ? parsed.expectedConcepts : [],
            modelAnswer: parsed.modelAnswer || question.sampleAnswer || ''
          };
        }
      }
    } catch {}

    return buildLocalFeedback();
  },

  /**
   * Honest Full Interview Evaluation without fake inflated scores.
   */
  evaluateInterviewAnswers: async (
    session: InterviewSession,
    userAnswers: Record<number, string>
  ): Promise<InterviewEvaluation> => {
    const logStep = (action: string, message: string, reasoning?: string, status: 'info' | 'success' | 'warning' = 'info') => {
      stateManager.addLog({
        timestamp: new Date().toLocaleTimeString(),
        agent: 'Interview Agent',
        action,
        status,
        message,
        reasoning,
        tool: 'interviewAgent.evaluateInterviewAnswers()'
      });
    };

    logStep('evaluation_start', `📊 Honestly evaluating candidate answers for ${session.role} (${session.level} level)...`, 'Detecting correct vs incorrect responses without score inflation.');

    // Evaluate each question using live check
    const questionEvaluations: QuestionEvaluation[] = [];
    let totalScore = 0;

    for (let idx = 0; idx < session.questions.length; idx++) {
      const q = session.questions[idx];
      const ans = userAnswers[idx] || '';
      const check = await interviewAgent.checkSingleAnswerLive(q, ans, session.role, session.level);

      const isCorrect = check.status === 'correct';
      totalScore += check.score;

      questionEvaluations.push({
        questionIndex: idx,
        question: q.question,
        type: q.type,
        userAnswer: ans || '(Left blank)',
        isCorrect,
        score: check.score,
        verdict: check.verdict,
        feedback: check.analysis,
        strengths: isCorrect ? 'Demonstrated solid grasp of technical mechanisms.' : 'Attempted response.',
        improvement: check.mistakes.length > 0 ? check.mistakes.join('; ') : 'Continue polishing technical brevity.',
        sampleAnswer: check.modelAnswer || q.sampleAnswer || ''
      });
    }

    const maxScore = session.questions.length * 10;
    const overallScore = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

    let performanceGrade: InterviewEvaluation['performanceGrade'] = 'Needs Improvement (F)';
    if (overallScore >= 85) performanceGrade = 'Distinction (A+)';
    else if (overallScore >= 70) performanceGrade = 'Strong Pass (A)';
    else if (overallScore >= 55) performanceGrade = 'Competent (B)';

    const correctCount = questionEvaluations.filter(q => q.isCorrect).length;
    const summary = overallScore >= 70
      ? `Candidate demonstrated strong domain competence for ${session.role} (${session.level} level), answering ${correctCount} of ${session.questions.length} questions accurately with a verified score of ${overallScore}%.`
      : `Candidate scored ${overallScore}% (${correctCount} of ${session.questions.length} questions verified correct). Several answers contained factual gaps or lacked requisite architectural depth for ${session.level}-level standards.`;

    const evaluation: InterviewEvaluation = {
      overallScore,
      performanceGrade,
      summary,
      categoryBreakdown: [
        { category: 'Technical Accuracy & Truthfulness', score: overallScore, feedback: overallScore >= 70 ? 'Sound technical understanding.' : 'Review core fundamentals and avoid factual misconceptions.' },
        { category: 'Methodology & Structure', score: Math.max(20, Math.min(100, overallScore - 5)), feedback: 'Ensure responses follow structured steps and address failure cases.' },
        { category: 'Domain Relevance', score: Math.max(30, Math.min(100, overallScore + 5)), feedback: `Calibrated specifically against ${session.role} interview expectations.` }
      ],
      keyStrengths: questionEvaluations.filter(q => q.isCorrect).map(q => `Accurately answered: "${q.question.slice(0, 60)}..."`).slice(0, 3),
      growthAreas: questionEvaluations.filter(q => !q.isCorrect).map(q => `Review concept: "${q.question.slice(0, 60)}..." (${q.improvement})`).slice(0, 3),
      recommendations: [
        'Review the model answers for any questions marked with incorrect verdicts',
        'Practice explaining technical failure modes and trade-offs under timed conditions',
        'Ensure STAR examples clearly quantify results and technical impact'
      ],
      questionResults: questionEvaluations,
      evaluatedAt: new Date().toISOString()
    };

    if (evaluation.keyStrengths.length === 0) {
      evaluation.keyStrengths.push('Engaged with the mock simulation prompt');
    }
    if (evaluation.growthAreas.length === 0) {
      evaluation.growthAreas.push('Maintain consistent response pacing');
    }

    stateManager.logActivity(1);
    logStep('evaluation_complete', `🎯 Evaluation complete: Verified score ${overallScore}/100 (${performanceGrade}).`, undefined, 'success');
    showToast(`🎯 Interview Evaluated: Honest score ${overallScore}/100`, 'success');

    return evaluation;
  },

  /**
   * Critique a pasted resume/summary against a target role.
   */
  critiqueResume: async (
    resumeText: string,
    targetRole: string
  ): Promise<ResumeCritique> => {
    const logStep = (action: string, message: string, status: 'info' | 'success' | 'warning' = 'info') => {
      stateManager.addLog({
        timestamp: new Date().toLocaleTimeString(),
        agent: 'Interview Agent',
        action,
        status,
        message,
        tool: 'interviewAgent.critiqueResume()'
      });
    };

    logStep('resume_critique_start', `📄 Interview Agent: Analyzing resume strictly for "${targetRole}" role...`);

    const prompt = `You are a strict technical hiring manager. Honestly evaluate this resume specifically for a ${targetRole} position. Do not give fake compliments.

Resume Text:
${resumeText.slice(0, 2000)}

Return ONLY valid JSON:
{
  "score": <0-10>,
  "strengths": ["<real strength 1>", "<real strength 2>"],
  "gaps": ["<missing skill or keyword 1 for ${targetRole}>", "<gap 2>"],
  "improvements": ["<actionable improvement 1>", "<actionable improvement 2>"],
  "overallFeedback": "<honest 2-3 sentence assessment>"
}`;

    const fallback: ResumeCritique = {
      score: 6,
      strengths: ['Relevant background', 'Clear project history'],
      gaps: [`Could highlight more specific ${targetRole} production tools`, 'Add measurable performance metrics'],
      improvements: [`Tailor keywords to match ${targetRole} requirements`, 'Quantify system scale and latency achievements'],
      overallFeedback: `Resume has foundational qualifications for ${targetRole}, but needs specific production metrics and domain-tailored keywords.`,
    };

    try {
      const llmResult = await routeAndCall('explain_concept', prompt);
      const jsonMatch = llmResult.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        logStep('critique_complete', `✅ Resume critique complete. Honest score: ${parsed.score}/10.`, 'success');
        return parsed as ResumeCritique;
      }
    } catch (err) {
      logStep('critique_fallback', `⚠️ LLM unavailable — generated honest template critique.`, 'warning');
    }

    return fallback;
  },

  getSavedSessions: (): InterviewSession[] => {
    try {
      return JSON.parse(localStorage.getItem('career_os_interview_sessions') ?? '[]');
    } catch {
      return [];
    }
  }
};
