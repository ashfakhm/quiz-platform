"use client";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Activity, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizPerformanceCardProps {
  quizTitle: string;
  totalAttempts: number;
  bestScore: number;
  latestScore: number;
  totalQuestions: number;
}

export function QuizPerformanceCard({
  quizTitle,
  totalAttempts,
  bestScore,
  latestScore,
  totalQuestions,
}: QuizPerformanceCardProps) {
  const maxScore = totalQuestions;
  const displayPercentage = Math.round((bestScore / maxScore) * 100);
  const isPass = displayPercentage >= 60;

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
        {/* Main Metric */}
        <div className="flex items-end justify-between">
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              Personal Best
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight">
                {displayPercentage}%
              </span>
              <span className="text-sm font-medium text-muted-foreground">
                ({bestScore}/{maxScore})
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center justify-end gap-1.5">
              <Target
                className={cn(
                  "w-3.5 h-3.5",
                  isPass ? "text-emerald-500" : "text-rose-500"
                )}
              />
              Latest
            </div>
            <div className="flex items-baseline justify-end gap-1">
              <span
                className={cn(
                  "text-lg font-semibold",
                  latestScore < 0 && "text-rose-500"
                )}
              >
                {latestScore}
              </span>
              <span className="text-xs text-muted-foreground">
                / {maxScore} pts
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <aside className="space-y-2" aria-label="Performance progress">
          <div className="flex justify-between text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
            <span>Performance</span>
            <span>Target: 60%</span>
          </div>
          <Progress
            value={displayPercentage}
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
