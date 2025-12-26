"use client";

import { useEffect, useState, useRef, use } from "react";
import { useUser, SignInButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import { useQuiz, useQuizValidation } from "@/hooks/useQuiz";
import type { Question } from "@/lib/types";
import type { QuizResponse } from "@/lib/types";
import {
  QuestionCard,
  ModeSelector,
  ProgressHeader,
  ScoreSummary,
  QuestionNavigator,
} from "@/components/quiz";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, RefreshCw, CheckCircle } from "lucide-react";

interface QuizPageProps {
  params: Promise<{ quizId: string }>;
}

export default function QuizPage({ params }: QuizPageProps) {
  // Unwrap params using React.use()
  const { quizId } = use(params);

  // Detect ?new=1 in the URL to force mode selection
  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (url.searchParams.get("new") === "1") {
        // Clear any persisted quiz progress for this quiz
        localStorage.removeItem(`quiz-progress-${quizId}`);
        // Optionally, reload the page without the ?new param to avoid repeated resets
        url.searchParams.delete("new");
        window.history.replaceState({}, "", url.pathname + url.search);
      }
    }
  }, [quizId]);

  const { isLoaded: authLoaded, isSignedIn } = useUser(); // Get auth state
  const router = useRouter(); // Initialize useRouter

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
    completeStudyMode,
    resetQuiz,
    getAnswer,
    shouldShowExplanation,
    shouldShowFeedback,
    canChangeAnswer,
    state,
  } = useQuiz();

  // Exam Duration: 1 minute per question
  const examDuration = questions.length * 60 * 1000;



  // Calculate score manually for study mode
  const calculateScore = () => {
    let correct = 0;
    questions.forEach((question) => {
      const selectedIndex = getAnswer(question.id);
      if (
        selectedIndex !== undefined &&
        selectedIndex === question.correctIndex
      ) {
        correct++;
      }
    });
    return correct;
  };

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

  // Handle submit - allows submission with partial answers
  const handleSubmit = async (eOrForce?: React.MouseEvent | boolean) => {
    const isForceSubmit = eOrForce === true;

    // Only submit if at least one question is answered, unless forced by timer
    // User requested to allow submitting even with 0 answers
    // if (answeredCount === 0 && !isForceSubmit) {
    //   return;
    // }

    // Submit in both exam and study mode
    if (mode !== "exam" && mode !== "study") {
      return;
    }

    // Check if user is authenticated - require sign-in to submit
    if (!authLoaded) {
      return; // Wait for auth to load
    }

    if (!isSignedIn) {
      // Show sign-in prompt - redirect to sign-in page with return URL
      const currentUrl = window.location.pathname;
      router.push(`/sign-in?redirect_url=${encodeURIComponent(currentUrl)}`);
      return;
    }

    // Submit based on mode
    if (mode === "exam") {
      submitExam();
    } else {
      calculateScore();
    }

    // For study mode, mark as completed
    if (mode === "study") {
      completeStudyMode();
    }

    // Submit to backend (optional - uses mock API in development)
    if (quizData && mode) {
      try {
        // Only include answered questions in the submission
        const answersToSubmit = Object.fromEntries(
          (questions as Question[])
            .filter((q) => {
              const answer = getAnswer(q.id);
              return answer !== undefined && answer !== null && answer !== -1;
            })
            .map((q) => [q.id, getAnswer(q.id) ?? -1])
        );

        // Convert answers to array format for API
        const answersArray = Object.entries(answersToSubmit).map(
          ([questionId, selectedIndex]) => ({
            questionId,
            selectedIndex: Number(selectedIndex),
          })
        );

        // API route expects: { answers: Array, mode: string }
        // userId is obtained from Clerk auth on the server side
        const response = await fetch(`/api/quiz/${quizData.quizId}/attempt`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            answers: answersArray,
            mode: mode,
          }),
        });

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ message: "Unknown error" }));
          throw new Error(
            errorData.error || errorData.message || "Failed to save attempt"
          );
        }

        const result = await response.json();
        console.log("Attempt saved successfully:", result);
      } catch (err) {
        console.error("Failed to save attempt:", err);
        // Don't block the user, just log the error
        // The quiz can still continue to review mode
      }
    }
  };

  // Keep a ref to handleSubmit to avoid stale closures in the timer interval
  const handleSubmitRef = useRef(handleSubmit);
  useEffect(() => {
    handleSubmitRef.current = handleSubmit;
  });

  // Handle auto-submit when timer expires
  useEffect(() => {
    if (
      mode !== "exam" ||
      phase !== "in-progress" ||
      !state.startTime ||
      questions.length === 0
    ) {
      return;
    }

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const start = new Date(state.startTime!).getTime();
      const elapsed = now - start;
      const remaining = examDuration - elapsed;

      if (remaining <= 0) {
        clearInterval(interval);
        // Auto-submit using the ref to get the latest closure
        handleSubmitRef.current(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [mode, phase, state.startTime, questions.length, examDuration]);

  // Proctoring: Exam mode restrictions (must be before any early return)
  useEffect(() => {
    if (mode === "exam" && phase === "in-progress") {
      // Disable copy, paste, cut, right-click
      const preventDefault = (e: Event) => {
        e.preventDefault();
        if (e.type === "contextmenu") {
          // Optionally show a message
        }
      };
      document.addEventListener("copy", preventDefault);
      document.addEventListener("paste", preventDefault);
      document.addEventListener("cut", preventDefault);
      document.addEventListener("contextmenu", preventDefault);

      // Prevent text selection via CSS
      const style = document.createElement("style");
      style.id = "exam-proctoring-style";
      style.innerHTML = `
        #main-content {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
        }
      `;
      document.head.appendChild(style);

      return () => {
        document.removeEventListener("copy", preventDefault);
        document.removeEventListener("paste", preventDefault);
        document.removeEventListener("cut", preventDefault);
        document.removeEventListener("contextmenu", preventDefault);
        const styleEl = document.getElementById("exam-proctoring-style");
        if (styleEl) styleEl.remove();
      };
    }
    // If not exam mode, do nothing and no cleanup needed
    return undefined;
  }, [mode, phase]);

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
        canSubmit={true} // Allow submission even with 0 answers
        startTime={state.startTime}
        examDuration={examDuration}
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
        className="container max-w-6xl px-4 py-8 mx-auto"
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
          <div className="flex gap-8 items-start">
            {/* Main Question Column */}
            <section className="flex-1 space-y-6 min-w-0" aria-labelledby="questions-heading">
              <h2 id="questions-heading" className="sr-only">
                Quiz Questions
              </h2>
              {/* Sign-in reminder for unauthenticated users */}
              {phase === "in-progress" &&
                mode === "exam" &&
                authLoaded &&
                !isSignedIn && (
                  <Alert className="border-amber-500/50 bg-amber-500/10">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    <AlertTitle>Sign in required to submit</AlertTitle>
                    <AlertDescription className="flex items-center justify-between gap-4">
                      <span>
                        You can take the quiz without signing in, but you&apos;ll
                        need to sign in to submit your answers and save your
                        results.
                      </span>
                      <SignInButton mode="modal">
                        <Button
                          size="sm"
                          variant="outline"
                          className="whitespace-nowrap"
                        >
                          Sign In
                        </Button>
                      </SignInButton>
                    </AlertDescription>
                  </Alert>
                )}
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
                  id={`question-${index}`} // Added ID for scrolling
                  ref={index === 0 ? firstQuestionRef : undefined}
                  tabIndex={index === 0 ? 0 : undefined}
                  aria-label={`Question ${index + 1}`}
                  className="scroll-mt-24" // Offset for sticky header
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
                <div className="sticky bottom-4 flex justify-center pt-4 z-10">
                  <Button
                    size="lg"
                    onClick={handleSubmit}
                    className={`
                      gap-2 shadow-lg transition-all duration-300
                      bg-linear-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-emerald-500/25
                    `}
                    aria-label="Submit Quiz"
                  >
                    Submit Quiz ({answeredCount}/{questions.length} answered)
                  </Button>
                </div>
              )}

              {/* Bottom Submit Button (Study Mode) */}
              {mode === "study" && phase === "in-progress" && (
                <div className="sticky bottom-4 flex justify-center pt-4 z-10">
                  <Button
                    size="lg"
                    onClick={handleSubmit}
                    disabled={answeredCount === 0}
                    className={`
                      gap-2 shadow-lg transition-all duration-300
                      ${
                        answeredCount > 0
                          ? "bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-blue-500/25"
                          : "opacity-50"
                      }
                    `}
                    aria-label="Complete Study Mode"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Complete Study ({answeredCount}/{questions.length} answered)
                  </Button>
                </div>
              )}

              {/* Completion message for Study Mode (optional info) */}
              {mode === "study" && allAnswered && phase === "in-progress" && (
                <div className="text-center py-4 mb-4">
                  <p
                    className="text-muted-foreground"
                    role="status"
                    aria-live="polite"
                  >
                    🎉 You&apos;ve reviewed all questions! Click &quot;Complete
                    Study&quot; to save your results.
                  </p>
                </div>
              )}
            </section>

            {/* Sidebar Navigator (Desktop) */}
            <aside className="hidden lg:block w-72 sticky top-24 shrink-0 p-4 rounded-xl border bg-card/50 backdrop-blur-sm">
              <QuestionNavigator
                totalQuestions={questions.length}
                answers={state.answers}
                questions={questions as Question[]}
                mode={mode}
                onNavigate={(index) => {
                  const el = document.getElementById(`question-${index}`);
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                }}
              />
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
