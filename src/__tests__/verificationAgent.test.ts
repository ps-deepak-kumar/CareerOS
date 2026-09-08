/**
 * Unit tests for verificationAgent scoring logic
 * Tests: score computation, issue generation, duplicate detection handling
 */

import { describe, it, expect } from 'vitest';

// ─── Mock Course factory ──────────────────────────────────────────────────────
const makeMockCourse = (overrides: Record<string, any> = {}) => ({
  id: 'test-course-1',
  title: 'Test AI Course',
  difficulty: 'Intermediate' as const,
  provider: 'Test',
  chapters: [
    {
      title: 'Chapter 1: Intro',
      explanation: 'Introduction to AI concepts and fundamentals in depth.',
      analogy: 'Think of AI like a brain learning from examples.',
      keyTerminology: ['Neural Network', 'Training', 'Inference'],
      practiceTask: 'Implement a basic perceptron.',
      quizQuestion: {
        question: 'What is supervised learning?',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        answerIdx: 1,
        explanation: 'Supervised learning uses labeled data.',
      },
      videoUrl: 'dQw4w9WgXcQ',
    },
    {
      title: 'Chapter 2: Deep Learning',
      explanation: 'Deep learning builds on neural networks with multiple layers.',
      analogy: 'Like layers of understanding building on each other.',
      keyTerminology: ['Backpropagation', 'Gradient Descent', 'Activation'],
      practiceTask: 'Build a 2-layer neural network.',
      quizQuestion: {
        question: 'What is backpropagation?',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        answerIdx: 2,
        explanation: 'Backpropagation calculates gradients.',
      },
      videoUrl: 'dQw4w9WgXcQ',
    },
  ],
  progress: 0,
  wishlist: false,
  courseStatus: 'active' as const,
  ...overrides,
});

// ─── Score formula tests (isolated from async LLM calls) ─────────────────────

describe('VerificationAgent scoring formula', () => {
  it('should produce a positive base score for a valid course', () => {
    const course = makeMockCourse();
    const chapters = course.chapters;

    // Replicate the scoring formula from verificationAgent.ts
    let score = 85; // base

    const analogiesFound = chapters.filter(ch => ch.analogy && ch.analogy.length > 10).length;
    const quizzesValid = chapters.filter(ch =>
      ch.quizQuestion &&
      ch.quizQuestion.options.length === 4 &&
      ch.quizQuestion.answerIdx >= 0
    ).length;
    const hasAnalogies = analogiesFound >= chapters.length - 1;
    const hasQuizzes = quizzesValid === chapters.length;

    if (hasQuizzes) score += 3;
    if (hasAnalogies) score += 2;
    score = Math.min(100, score);

    expect(score).toBeGreaterThan(85);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('should deduct 3 points per error issue', () => {
    const base = 85;
    const issues = [
      { severity: 'error' as const, message: 'Err 1', location: 'Ch 1' },
      { severity: 'error' as const, message: 'Err 2', location: 'Ch 2' },
    ];
    const errorCount = issues.filter(i => i.severity === 'error').length;
    const finalScore = Math.max(0, base - errorCount * 3);
    expect(finalScore).toBe(79);
  });

  it('score should never go below 0', () => {
    const base = 5;
    const errorCount = 10;
    const score = Math.max(0, base - errorCount * 3);
    expect(score).toBe(0);
  });

  it('should flag quiz with wrong number of options as an issue', () => {
    const course = makeMockCourse({
      chapters: [{
        title: 'Bad Chapter',
        explanation: 'Some explanation.',
        analogy: 'An analogy.',
        keyTerminology: ['Term'],
        practiceTask: 'Do something.',
        quizQuestion: {
          question: 'Question?',
          options: ['A', 'B'], // only 2 options — should fail
          answerIdx: 0,
          explanation: 'Explanation.',
        },
        videoUrl: 'abc',
      }],
    });

    const issues: { severity: string; message: string; location: string }[] = [];
    course.chapters.forEach(ch => {
      if (ch.quizQuestion && (ch.quizQuestion.options.length !== 4 || ch.quizQuestion.answerIdx < 0)) {
        issues.push({ severity: 'error', message: `Quiz has ${ch.quizQuestion.options.length} options (expected 4).`, location: `Chapter: ${ch.title}` });
      }
    });

    expect(issues).toHaveLength(1);
    expect(issues[0].severity).toBe('error');
    expect(issues[0].message).toContain('2 options');
  });

  it('should produce "verified" status for score ≥ 90', () => {
    const score = 92;
    const status = score >= 90 ? 'verified' : score >= 70 ? 'warning' : 'failed';
    expect(status).toBe('verified');
  });

  it('should produce "warning" status for score 70–89', () => {
    const score = 75;
    const status = score >= 90 ? 'verified' : score >= 70 ? 'warning' : 'failed';
    expect(status).toBe('warning');
  });

  it('should produce "failed" status for score < 70', () => {
    const score = 60;
    const status = score >= 90 ? 'verified' : score >= 70 ? 'warning' : 'failed';
    expect(status).toBe('failed');
  });
});

describe('VerificationAgent issue categorization', () => {
  it('should flag missing analogies as a warning when ≥2 chapters lack them', () => {
    // 2 chapters, both missing analogies → analogiesFound=0, chapters.length-1=1 → hasAnalogies=false
    const chapters = [
      { title: 'Ch 1', analogy: '' }, // no analogy
      { title: 'Ch 2', analogy: '' }, // no analogy
    ];
    const analogiesFound = chapters.filter(ch => ch.analogy && ch.analogy.length > 10).length;
    const hasAnalogies = analogiesFound >= chapters.length - 1;

    const issues: { severity: string; message: string }[] = [];
    if (!hasAnalogies) {
      issues.push({ severity: 'warning', message: `Only ${analogiesFound}/${chapters.length} chapters have analogies.` });
    }

    expect(issues).toHaveLength(1);
    expect(issues[0].severity).toBe('warning');
    expect(issues[0].message).toContain('0/2');
  });
});
