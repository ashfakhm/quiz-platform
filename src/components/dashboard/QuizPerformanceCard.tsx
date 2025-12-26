"use client";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Activity, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizPerformanceCardProps {
  quizTitle: string;
  totalAttempts: number;
  bestScore: number;
  latestScore: number;
  totalMarks: number;
  attempted?: number;
  correct?: number;
  incorrect?: number;
  result?: "Pass" | "Fail" | null;
}

export function QuizPerformanceCard({
  quizTitle,
  totalAttempts,
  latestScore,
  totalMarks,
  attempted,
  correct,
  incorrect,
  result,
}: QuizPerformanceCardProps) {
  const maxScore = totalMarks;
  // Percentage for latest score (for the 'Latest' section)
  const latestPercentage =
    maxScore > 0 ? Math.round((latestScore / maxScore) * 100) : 0;
  const isPass = latestPercentage >= 60;

  return (
    <article
      className="group relative overflow-hidden border-border/60 bg-white/60 dark:bg-background/40 backdrop-blur-md transition-all hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 dark:hover:shadow-primary/5 shadow-sm"
      aria-label={`Performance card for ${quizTitle}`}
    >
      {/* Subtle Background Gradient */}
      <span
        className={cn(
          "absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-linear-to-br",
          isPass
            ? "from-emerald-500/10 via-transparent to-transparent"
            : "from-rose-500/10 via-transparent to-transparent"
        )}
        aria-hidden="true"
      />

      <header className="relative pb-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-semibold text-lg tracking-tight leading-none mb-1.5">
              {quizTitle}
            </h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium uppercase tracking-wider">
              <Activity className="w-3 h-3" />
              {totalAttempts} {totalAttempts === 1 ? "Attempt" : "Attempts"}
            </div>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "px-2.5 py-0.5 text-xs font-semibold backdrop-blur-sm border-0",
              isPass
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
            )}
          >
            {isPass ? "PASSED" : "NEEDS PRACTICE"}
          </Badge>
        </div>
      </header>

      <section className="relative space-y-5">
        {/* Detailed Stats */}
        {(attempted !== undefined ||
          correct !== undefined ||
          incorrect !== undefined ||
          result) && (
          <div className="flex flex-wrap gap-4 items-center text-xs text-muted-foreground mb-2">
            {attempted !== undefined && (
              <span>
                Attempted: <b>{attempted}</b>
              </span>
            )}
            {correct !== undefined && (
              <span>
                Correct:{" "}
                <b className="text-emerald-600 dark:text-emerald-400">
                  {correct}
                </b>
              </span>
            )}
            {incorrect !== undefined && (
              <span>
                Incorrect:{" "}
                <b className="text-rose-600 dark:text-rose-400">{incorrect}</b>
              </span>
            )}
            {result && (
              <span>
                Result:{" "}
                <b
                  className={
                    result === "Pass"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400"
                  }
                >
                  {result}
                </b>
              </span>
            )}
          </div>
        )}
        {/* Main Metric: Only Latest Score */}
        <div className="flex flex-col items-start justify-between">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Target
              className={cn(
                "w-3.5 h-3.5",
                isPass ? "text-emerald-500" : "text-rose-500"
              )}
            />
            Latest Score
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight">
              {latestPercentage}%
            </span>
            <span className="text-lg font-semibold">{latestScore} pts</span>
          </div>
        </div>

        {/* Progress Bar */}
        <aside className="space-y-2" aria-label="Performance progress">
          <div className="flex justify-between text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
            <span>Performance</span>
            <span>Target: 60%</span>
          </div>
          <Progress
            value={latestPercentage}
            className={cn(
              "h-1.5",
              isPass ? "[&>div]:bg-emerald-500" : "[&>div]:bg-rose-500"
            )}
          />
        </aside>
      </section>
    </article>
  );
}
