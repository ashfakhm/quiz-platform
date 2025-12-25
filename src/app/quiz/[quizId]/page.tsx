"use client";

import { useEffect, useState, useRef, use } from "react";
import { apiClient } from "@/lib/api";
import { useQuiz, useQuizValidation } from "@/hooks/useQuiz";
import type { Question } from "@/lib/types";
import type { QuizResponse } from "@/lib/types";
import {
  QuestionCard,
  ModeSelector,
  ProgressHeader,
  ScoreSummary,
} from "@/components/quiz";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, RefreshCw } from "lucide-react";

interface QuizPageProps {
  params: Promise<{ quizId: string }>;
}

export default function QuizPage({ params }: QuizPageProps) {
  // Unwrap params using React.use()
  const { quizId } = use(params);

  // ...existing code...

  // ...existing code...

  // ...existing code...

  const [quizData, setQuizData] = useState<QuizResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  // Accessibility: focus management
  const firstQuestionRef = useRef<HTMLDivElement>(null);

  const {
    mode,
    phase,
    questions,
    score,
    isModeLocked,
    answeredCount,
    allAnswered,
    initializeQuiz,
    selectMode,
    selectAnswer,
    submitExam,
    resetQuiz,
    getAnswer,
    shouldShowExplanation,
    shouldShowFeedback,
    canChangeAnswer,
  } = useQuiz();

  // Warn on accidental navigation if quiz in progress and not all answered
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (phase === "in-progress" && !allAnswered) {
        e.preventDefault();
        e.returnValue =
          "You have an unfinished quiz. Are you sure you want to leave?";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [phase, allAnswered]);

  const { validateQuestions } = useQuizValidation();

  // Fetch questions
  useEffect(() => {
    async function loadQuiz() {
      try {
        setLoading(true);
        setError(null);
        const data = await apiClient.fetchQuestions(quizId);

        // Validate questions
        const validation = validateQuestions(data.questions);
        if (!validation.isValid) {
          throw new Error(`Invalid quiz data: ${validation.errors.join(", ")}`);
        }

        setQuizData(data);
        try {
          initializeQuiz(data.questions, quizId);
        } catch {
          setError("Failed to restore quiz progress. Please start over.");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load quiz");
      } finally {
        setLoading(false);
      }
    }

    loadQuiz();
  }, [quizId, initializeQuiz, validateQuestions]);

  // Focus first question on quiz start for accessibility
  useEffect(() => {
    if (phase === "in-progress" && firstQuestionRef.current) {
      firstQuestionRef.current.focus();
    }
    if (phase === "review") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [phase]);

  // Handle submit
  const handleSubmit = async () => {
    const finalScore = submitExam();

    // Submit to backend (optional - uses mock API in development)
    if (quizData) {
      try {
        await apiClient.submitAttempt({
          userId: "anonymous", // Will be replaced with Clerk user ID when configured
          quizId: quizData.quizId,
          answers: Object.fromEntries(
            (questions as Question[]).map((q) => [q.id, getAnswer(q.id) ?? -1])
          ),
          score: finalScore,
          totalQuestions: questions.length,
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString(),
        });
      } catch (err) {
        console.error("Failed to save attempt:", err);
        // Don't block the user, just log the error
      }
    }
  };

  // Handle reset
  const handleReset = () => {
    resetQuiz();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-50 h-16 border-b border-border/50 bg-background/80 backdrop-blur-xl" />
        <div className="container max-w-3xl px-4 py-8 space-y-6 mx-auto">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-24 w-full" />
              <div className="space-y-2">
                {[1, 2, 3, 4].map((j) => (
                  <Skeleton key={j} className="h-14 w-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Failed to Load Quiz</AlertTitle>
          <AlertDescription className="mt-2">
            {error}
            <div className="mt-4">
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Error banner for restore issues */}
      {error && error.includes("restore") && (
        <div className="fixed top-0 left-0 w-full z-50 flex justify-center p-2">
          <Alert variant="destructive" className="max-w-lg w-full">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Quiz Progress Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}
      {/* Progress Header */}
      <ProgressHeader
        quizTitle={quizData?.title || "Quiz"}
        mode={mode}
        phase={phase}
        answeredCount={answeredCount}
        totalQuestions={questions.length}
        isModeLocked={isModeLocked}
        onSubmit={handleSubmit}
        onReset={handleReset}
        canSubmit={allAnswered}
      />

      {/* Main Content */}
      {/* ARIA live region for timer/errors */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        id="quiz-live-region"
      >
        {error && !loading && error}
        {/* Add timer or dynamic status here if needed */}
      </div>
      <main
        id="main-content"
        ref={contentRef}
        className="container max-w-3xl px-4 py-8 mx-auto"
        aria-label="Quiz main content"
        tabIndex={-1}
      >
        {/* Mode Selection */}
        {phase === "selecting-mode" && (
          <section className="py-12" aria-labelledby="mode-select-heading">
            <h2 id="mode-select-heading" className="sr-only">
              Select Quiz Mode
            </h2>
            <ModeSelector
              selectedMode={mode}
              isLocked={isModeLocked}
              onSelectMode={selectMode}
            />
          </section>
        )}

        {/* Quiz Content */}
        {(phase === "in-progress" || phase === "review") && (
          <section className="space-y-6" aria-labelledby="questions-heading">
            <h2 id="questions-heading" className="sr-only">
              Quiz Questions
            </h2>
            {/* Score Summary (Review Mode) */}
            {phase === "review" && score !== null && (
              <div className="mb-8">
                <ScoreSummary
                  score={score}
                  totalQuestions={questions.length}
                  onRestart={handleReset}
                />
              </div>
            )}

            {/* Questions */}
            {(questions as Question[]).map((question, index) => (
              <div
                key={question.id}
                ref={index === 0 ? firstQuestionRef : undefined}
                tabIndex={index === 0 ? 0 : undefined}
                aria-label={`Question ${index + 1}`}
              >
                <QuestionCard
                  question={question}
                  questionNumber={index + 1}
                  selectedIndex={getAnswer(question.id)}
                  showFeedback={shouldShowFeedback(question.id)}
                  showExplanation={shouldShowExplanation(question.id)}
                  canChange={canChangeAnswer(question.id)}
                  onSelectAnswer={(optionIndex: number) =>
                    selectAnswer(question.id, optionIndex)
                  }
                />
              </div>
            ))}

            {/* Bottom Submit Button (Exam Mode) */}
            {mode === "exam" && phase === "in-progress" && (
              <div className="sticky bottom-4 flex justify-center pt-4">
                <Button
                  size="lg"
                  onClick={handleSubmit}
                  disabled={!allAnswered}
                  className={`
                    gap-2 shadow-lg transition-all duration-300
                    ${
                      allAnswered
                        ? "bg-linear-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-emerald-500/25"
                        : "opacity-50"
                    }
                  `}
                  aria-label="Submit Quiz"
                >
                  Submit Quiz ({answeredCount}/{questions.length} answered)
                </Button>
              </div>
            )}

            {/* Completion message for Study Mode */}
            {mode === "study" && allAnswered && phase === "in-progress" && (
              <div className="text-center py-8">
                <p
                  className="text-muted-foreground mb-4"
                  role="status"
                  aria-live="polite"
                >
                  {/* Use HTML entity for apostrophe */}
                  🎉 You&apos;ve reviewed all questions!
                </p>
                <Button
                  variant="outline"
                  onClick={handleReset}
                  aria-label="Restart Quiz"
                >
                  Start Over
                </Button>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
