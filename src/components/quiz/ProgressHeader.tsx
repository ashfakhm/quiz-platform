"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import {
  BookOpen,
  ClipboardCheck,
  Lock,
  CheckCircle,
  RotateCcw,
  LayoutDashboard,
  ArrowLeft,
  Timer,
} from "lucide-react";
import type { QuizMode, QuizPhase } from "@/lib/types";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface ProgressHeaderProps {
  quizTitle: string;
  mode: QuizMode | null;
  phase: QuizPhase;
  answeredCount: number;
  totalQuestions: number;
  isModeLocked: boolean;
  onSubmit?: () => void;
  onReset?: () => void;
  canSubmit?: boolean;
  startTime?: Date | null;
  examDuration?: number | null;
}

export function ProgressHeader({
  quizTitle,
  mode,
  phase,
  answeredCount,
  totalQuestions,
  isModeLocked,
  onSubmit,
  onReset,
  canSubmit = false,
  startTime,
  examDuration,
}: ProgressHeaderProps) {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // Timer logic
  useEffect(() => {
    if (!startTime || !examDuration || mode !== "exam" || phase !== "in-progress") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (timeLeft !== null) setTimeLeft(null);
      return;
    }

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const start = new Date(startTime).getTime();
      const elapsed = now - start;
      const remaining = Math.max(0, examDuration - elapsed);

      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    // Initial calculation
    const now = new Date().getTime();
    const start = new Date(startTime).getTime();
    const elapsed = now - start;
    setTimeLeft(Math.max(0, examDuration - elapsed));

    return () => clearInterval(interval);
  }, [startTime, examDuration, mode, phase, timeLeft]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const progressPercentage =
    totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  const ModeIcon = mode === "study" ? BookOpen : ClipboardCheck;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/60">
      <div className="flex h-16 items-center justify-between gap-4 px-4 md:px-6 w-full">
        {/* Left: Quiz info */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to dashboard</span>
            </Button>
          </Link>
          <h1 className="text-lg font-semibold text-foreground hidden sm:block truncate max-w-50 md:max-w-none">
            {quizTitle}
          </h1>

          {mode && (
            <Badge
              variant="secondary"
              className={cn(
                "flex items-center gap-1.5 px-3 py-1",
                mode === "study"
                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
              )}
            >
              <ModeIcon className="w-3.5 h-3.5" />
              <span className="capitalize">{mode}</span>
              {isModeLocked && <Lock className="w-3 h-3 ml-1 opacity-60" />}
            </Badge>
          )}
        </div>

        {/* Center: Progress */}
        <div className="flex-1 max-w-xs hidden md:block">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
              <motion.div
                className={cn(
                  "h-full rounded-full",
                  progressPercentage === 100
                    ? "bg-linear-to-r from-emerald-500 to-emerald-400"
                    : "bg-linear-to-r from-primary to-primary/80"
                )}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
            </div>
            <span className="text-sm font-medium text-muted-foreground min-w-16 text-right">
              {answeredCount}/{totalQuestions}
            </span>
          </div>
        </div>

        {/* Timer (Exam Mode) */}
        {mode === "exam" && timeLeft !== null && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(
              "fixed top-20 right-4 md:right-8 z-40 flex flex-col items-end gap-1 px-5 py-3 rounded-2xl border shadow-xl backdrop-blur-xl transition-colors duration-300",
              timeLeft < 30000
                ? "bg-rose-500/10 border-rose-500/30 shadow-rose-500/10"
                : "bg-background/60 border-border/50 shadow-black/5"
            )}
          >
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <Timer className={cn("w-3.5 h-3.5", timeLeft < 30000 && "text-rose-500 animate-pulse")} />
              <span>Time Left</span>
            </div>
            <span
              className={cn(
                "font-mono text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-br",
                timeLeft < 30000
                  ? "from-rose-500 to-red-600"
                  : "from-foreground to-foreground/70"
              )}
            >
              {formatTime(timeLeft)}
            </span>
          </motion.div>
        )}

        {/* Mobile progress */}
        <div className="md:hidden">
          <Badge variant="outline" className="font-mono">
            {answeredCount}/{totalQuestions}
          </Badge>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Dashboard Link */}
          <Link href="/dashboard" className="hidden sm:inline-flex">
            <Button variant="ghost" size="sm" className="gap-1.5">
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden lg:inline">Dashboard</span>
            </Button>
          </Link>

          {/* Reset button */}
          {phase !== "idle" && phase !== "selecting-mode" && onReset && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Reset</span>
            </Button>
          )}

          {/* Submit button (Exam and Study mode) */}
          {(mode === "exam" || mode === "study") && phase === "in-progress" && (
            <Button
              onClick={onSubmit}
              disabled={!canSubmit}
              className={cn(
                "gap-1.5 transition-all duration-300",
                canSubmit
                  ? mode === "exam"
                    ? "bg-linear-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-lg shadow-emerald-500/25"
                    : "bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-500/25"
                  : "opacity-50"
              )}
            >
              <CheckCircle className="w-4 h-4" />
              <span>{mode === "exam" ? "Submit" : "Complete"}</span>
            </Button>
          )}

          {/* Authentication UI */}
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="ghost" size="sm" className="gap-1.5">
                <span className="hidden sm:inline">Sign In</span>
                <span className="sm:hidden">Sign In</span>
              </Button>
            </SignInButton>
          </SignedOut>

          <ThemeToggle />
        </div>
      </div>

      {/* Mobile progress bar */}
      <div className="md:hidden h-1 bg-muted">
        <motion.div
          className={cn(
            "h-full",
            progressPercentage === 100 ? "bg-emerald-500" : "bg-primary"
          )}
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>
    </header>
  );
}
