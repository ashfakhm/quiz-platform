// Types for the Quiz Platform

// Question from backend API
export interface Question {
  id: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: { format: 'markdown' | 'text'; content: string };
  context?: string;
  groupId?: string;
}

// Quiz response from API
export interface QuizResponse {
  questions: Question[];
  quizId: string;
  title: string;
}

// Quiz modes
export type QuizMode = 'study' | 'exam';

// Quiz phases
export type QuizPhase = 'idle' | 'selecting-mode' | 'in-progress' | 'submitted' | 'review';

// Answer state for a single question
export interface AnswerState {
  selectedIndex: number | null;
  isCorrect: boolean | null;
  revealed: boolean;
}

// Complete quiz state
export interface QuizState {
  mode: QuizMode | null;
  phase: QuizPhase;
  questions: Question[];
  answers: Map<string, number>; // questionId -> selectedOptionIndex
  score: number | null;
  startTime: Date | null;
  endTime: Date | null;
  isModeLocked: boolean;
}

// Attempt submission payload
export interface AttemptSubmission {
  userId: string;
  quizId: string;
  answers: Record<string, number>;
  score: number;
  totalQuestions: number;
  startTime: string;
  endTime: string;
}

// Attempt summary for history
export interface AttemptSummary {
  attemptId: string;
  quizId: string;
  quizTitle: string;
  score: number;
  totalQuestions: number;
  completedAt: string;
  mode: QuizMode;
}

// API Error
export interface ApiError {
  message: string;
  code: string;
}

// Validation result
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}
