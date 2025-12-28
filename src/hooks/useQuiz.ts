"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import type {
  Question,
  QuizMode,
  QuizState,
  ValidationResult,
} from "@/lib/types";

const initialState: QuizState = {
  mode: null,
  phase: "idle",
  questions: [],
  answers: new Map(),
  score: null,
  startTime: null,
  endTime: null,
  isModeLocked: false,
  originalQuestions: [],
};

// Helper to shuffle array (Fisher-Yates)
function shuffleArray<T>(array: T[]): T[] {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

// Helper to shuffle questions and options
function getShuffledQuestions(questions: Question[]): Question[] {
  // Group questions first to maintain passage integrity
  const groups: { groupId: string | null; qs: Question[] }[] = [];
  let currentGroup: { groupId: string | null; qs: Question[] } | null = null;

  questions.forEach((q) => {
    if (q.groupId) {
      if (currentGroup && currentGroup.groupId === q.groupId) {
        currentGroup.qs.push(q);
      } else {
        if (currentGroup) groups.push(currentGroup);
        currentGroup = { groupId: q.groupId, qs: [q] };
      }
    } else {
      if (currentGroup) {
        groups.push(currentGroup);
        currentGroup = null;
      }
      groups.push({ groupId: null, qs: [q] });
    }
  });
  if (currentGroup) groups.push(currentGroup);

  // Shuffle the groups
  const shuffledGroups = shuffleArray(groups);

  // Flatten and shuffle options for each question
  const finalQuestions: Question[] = [];
  shuffledGroups.forEach((group) => {
    group.qs.forEach((q) => {
      // Shuffle options using dynamic length
      const indices = q.options.map((_, i) => i);
      const shuffledIndices = shuffleArray(indices);

      const newOptions = shuffledIndices.map((i) => q.options[i]);

      // Find where correct answer moved to
      const newCorrectIndex = shuffledIndices.indexOf(q.correctIndex);

      finalQuestions.push({
        ...q,
        options: newOptions,
        correctIndex: newCorrectIndex,
      });
    });
  });

  return finalQuestions;
}

// Helper function to generate localStorage key for quiz persistence
function getPersistKey(quizId: string): string {
  return `quiz-progress-${quizId}`;
}

export function useQuiz() {
  const [state, setState] = useState<QuizState>(initialState);
  const [quizId, setQuizId] = useState<string | null>(null);

  // Initialize quiz with questions
  const initializeQuiz = useCallback(
    (questions: Question[], quizIdArg?: string) => {
      setQuizId(quizIdArg || null);
      // Try to restore from localStorage
      let restored: Partial<QuizState> | null = null;
      if (quizIdArg) {
        try {
          const raw = localStorage.getItem(getPersistKey(quizIdArg));
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && parsed.answers) {
              restored = parsed;
            }
          }
        } catch {}
      }
      setState({
        ...initialState,
        questions:
          restored?.questions && restored.questions.length > 0
            ? restored.questions
            : questions,
        originalQuestions:
          restored?.originalQuestions && restored.originalQuestions.length > 0
            ? restored.originalQuestions
            : questions,
        phase:
          restored?.phase === "in-progress" ? "in-progress" : "selecting-mode",
        mode: restored?.mode ?? null,
        answers: restored?.answers
          ? new Map(Object.entries(restored.answers))
          : new Map(),
        startTime: restored?.startTime ? new Date(restored.startTime) : null,
        endTime: restored?.endTime ? new Date(restored.endTime) : null,
        isModeLocked: restored?.isModeLocked ?? false,
      });
    },
    []
  );

  // Select mode (Study or Exam)
  const selectMode = useCallback((mode: QuizMode) => {
    setState((prev) => {
      if (prev.isModeLocked) return prev;

      // If Exam mode, shuffle questions and options
      let questionsToUse =
        prev.originalQuestions.length > 0
          ? prev.originalQuestions
          : prev.questions;

      if (mode === "exam") {
        questionsToUse = getShuffledQuestions(questionsToUse);
      } else {
        // Ensure Study mode uses original order
        questionsToUse = [...questionsToUse];
      }

      return {
        ...prev,
        mode,
        questions: questionsToUse,
        phase: "in-progress",
        startTime: new Date(),
      };
    });
  }, []);

  // Select an answer for a question
  const selectAnswer = useCallback(
    (questionId: string, optionIndex: number) => {
      setState((prev) => {
        if (prev.phase !== "in-progress") return prev;

        const newAnswers = new Map(prev.answers);
        newAnswers.set(questionId, optionIndex);

        return {
          ...prev,
          answers: newAnswers,
          isModeLocked: true, // Lock mode after first answer
        };
      });
    },
    []
  );

  // Get answer for a specific question
  const getAnswer = useCallback(
    (questionId: string): number | undefined => {
      return state.answers.get(questionId);
    },
    [state.answers]
  );

  // Check if a specific answer is correct
  const isAnswerCorrect = useCallback(
    (questionId: string): boolean | null => {
      const question = state.questions.find((q) => q.id === questionId);
      const selectedIndex = state.answers.get(questionId);

      if (!question || selectedIndex === undefined) return null;
      return selectedIndex === question.correctIndex;
    },
    [state.questions, state.answers]
  );

  // Calculate total answered questions
  const answeredCount = useMemo(() => state.answers.size, [state.answers]);

  // Calculate score (only valid after submission in exam mode)
  const calculateScore = useCallback((): number => {
    let score = 0;
    state.questions.forEach((question) => {
      const selectedIndex = state.answers.get(question.id);

      if (selectedIndex !== undefined) {
        const mark = question.mark ?? 1;
        if (selectedIndex === question.correctIndex) {
          score += mark; // Correct answer
        } else {
          score -= mark * 0.25; // Incorrect answer (Negative marking)
        }
        // Unanswered questions are 0 (no change)
      }
    });
    return score;
  }, [state.questions, state.answers]);

  // Check if all questions are answered
  const allAnswered = useMemo(
    () =>
      state.answers.size === state.questions.length &&
      state.questions.length > 0,
    [state.answers.size, state.questions.length]
  );

  // Submit exam (Exam mode only)
  // Users can submit with partial answers - they don't need to answer all questions
  const submitExam = useCallback(() => {
    setState((prev) => {
      if (prev.phase !== "in-progress" || prev.mode !== "exam") return prev;
      // Allow submission even if not all questions are answered
      // Removed: if (prev.answers.size !== prev.questions.length) return prev;

      const score = calculateScore();
      return {
        ...prev,
        phase: "submitted",
        score,
        endTime: new Date(),
      };
    });

    // Automatically transition to review mode
    setTimeout(() => {
      setState((prev) => ({
        ...prev,
        phase: "review",
      }));
    }, 100);

    return calculateScore();
  }, [calculateScore]);

  // Complete study mode - marks completion and transitions to review
  const completeStudyMode = useCallback(() => {
    setState((prev) => {
      if (prev.mode !== "study" || prev.phase !== "in-progress") return prev;
      const score = calculateScore();
      return {
        ...prev,
        phase: "submitted",
        score,
        endTime: new Date(),
      };
    });

    // Automatically transition to review mode
    setTimeout(() => {
      setState((prev) => ({
        ...prev,
        phase: "review",
      }));
    }, 100);

    return calculateScore();
  }, [calculateScore]);

  // Reset quiz to initial state
  const resetQuiz = useCallback(() => {
    setState((prev) => ({
      ...initialState,
      questions:
        prev.originalQuestions.length > 0
          ? prev.originalQuestions
          : prev.questions,
      originalQuestions:
        prev.originalQuestions.length > 0
          ? prev.originalQuestions
          : prev.questions,
      phase: "selecting-mode",
    }));
    if (quizId) {
      localStorage.removeItem(getPersistKey(quizId));
    }
  }, [quizId]);

  // Clear persisted quiz (for external use)
  const clearPersistedQuiz = useCallback(() => {
    if (quizId) {
      localStorage.removeItem(getPersistKey(quizId));
    }
  }, [quizId]);
  // Persist state to localStorage on change
  useEffect(() => {
    if (!quizId) return;
    // Only persist in-progress state
    if (state.phase === "in-progress") {
      const persist = {
        mode: state.mode,
        phase: state.phase,
        questions: state.questions,
        originalQuestions: state.originalQuestions,
        answers: Object.fromEntries(state.answers),
        startTime: state.startTime,
        endTime: state.endTime,
        isModeLocked: state.isModeLocked,
      };
      try {
        localStorage.setItem(getPersistKey(quizId), JSON.stringify(persist));
      } catch {}
    }
  }, [
    state.mode,
    state.phase,
    state.questions,
    state.originalQuestions,
    state.answers,
    state.isModeLocked,
    state.startTime,
    state.endTime,
    quizId,
  ]);

  // Should show explanation for a question
  const shouldShowExplanation = useCallback(
    (questionId: string): boolean => {
      // In study mode, show explanation after answering
      if (state.mode === "study" && state.answers.has(questionId)) {
        return true;
      }
      // In review mode (after exam submission), show all explanations
      if (state.phase === "review") {
        return true;
      }
      return false;
    },
    [state.mode, state.phase, state.answers]
  );

  // Should show correct/incorrect feedback for a question
  const shouldShowFeedback = useCallback(
    (questionId: string): boolean => {
      // Study mode: immediate feedback
      if (state.mode === "study" && state.answers.has(questionId)) {
        return true;
      }
      // Review mode: feedback for all
      if (state.phase === "review") {
        return true;
      }
      return false;
    },
    [state.mode, state.phase, state.answers]
  );

  // Can change answer
  const canChangeAnswer = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_questionId: string): boolean => {
      if (state.phase !== "in-progress") return false;
      // In exam mode, can change until submitted
      // In study mode, can always change
      return true;
    },
    [state.phase]
  );

  return {
    // State
    state,
    mode: state.mode,
    phase: state.phase,
    questions: state.questions,
    score: state.score,
    isModeLocked: state.isModeLocked,
    answeredCount,
    allAnswered,

    // Actions
    initializeQuiz,
    selectMode,
    selectAnswer,
    submitExam,
    completeStudyMode,
    resetQuiz,
    clearPersistedQuiz,

    // Queries
    getAnswer,
    isAnswerCorrect,
    shouldShowExplanation,
    shouldShowFeedback,
    canChangeAnswer,
  };
}

// Validation hook
export function useQuizValidation() {
  // Validation logic only. Do not export from inside a function.
  const validateQuestions = useCallback(
    (questions: Question[]): ValidationResult => {
      const errors: string[] = [];

      // Check question count - must have at least 1 question
      if (questions.length === 0) {
        errors.push("Quiz must have at least one question");
      }

      // Check for duplicate IDs
      const ids = new Set<string>();
      questions.forEach((q, index) => {
        if (ids.has(q.id)) {
          errors.push(`Duplicate question ID: ${q.id} at index ${index}`);
        }
        ids.add(q.id);
      });

      // Validate each question
      questions.forEach((q, index) => {
        // Check options count
        if (!q.options || q.options.length < 2) {
          errors.push(
            `Question ${index + 1} (${q.id}): Must have at least 2 options`
          );
        }

        // Check correctIndex
        if (q.correctIndex < 0 || q.correctIndex >= q.options.length) {
          errors.push(
            `Question ${index + 1} (${q.id}): correctIndex must be 0-${
              q.options.length - 1
            }, got ${q.correctIndex}`
          );
        }

        // Check required fields
        if (!q.question || q.question.trim() === "") {
          errors.push(
            `Question ${index + 1} (${q.id}): Question text is required`
          );
        }

        if (!q.id || q.id.trim() === "") {
          errors.push(`Question at index ${index}: ID is required`);
        }
      });

      return {
        isValid: errors.length === 0,
        errors,
      };
    },
    []
  );

  return { validateQuestions };
}
