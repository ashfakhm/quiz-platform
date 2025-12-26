"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useUser, UserButton } from "@clerk/nextjs";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import {
  ArrowLeft,
  LayoutDashboard,
} from "lucide-react";
import type { AttemptSummary } from "@/lib/types";

export default function HistoryPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [attempts, setAttempts] = useState<AttemptSummary[]>([]);
  const [loading, setLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn || !user?.id) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    // setError(null);
    apiClient
      .getUserHistory(user.id)
      .then((res) => {
        setAttempts(res.attempts || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load attempts:", err);
        setLoading(false);
      });
  }, [isLoaded, isSignedIn, user?.id]);

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
       {/* Background provided by layout */}

       {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-4 md:px-6 w-full">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to Dashboard</span>
              </Button>
            </Link>
            <h1 className="text-lg font-bold tracking-tight">Activity History</h1>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      <main className="container max-w-4xl px-4 py-8 mx-auto relative z-10">
        <div className="flex items-center justify-between mb-8">
            <div>
               <h2 className="text-3xl font-bold tracking-tight">Your History</h2>
               <p className="text-muted-foreground mt-1">
                  You have completed {attempts.length} sessions.
               </p>
            </div>
            <Link href="/dashboard">
               <Button variant="outline" className="gap-2">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
               </Button>
            </Link>
        </div>

        <Card className="border-border/50 bg-white/50 dark:bg-card/40 backdrop-blur-sm overflow-hidden shadow-sm dark:shadow-none">
           <div className="divide-y divide-border/50">
              {attempts.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                   No activity found.
                </div>
              ) : (
                attempts.map((attempt) => (
                   <div key={attempt.attemptId} className="p-5 flex items-center justify-between hover:bg-white/60 dark:hover:bg-card/60 transition-colors group">
                      <div className="space-y-1">
                         <div className="font-semibold group-hover:text-primary transition-colors">{attempt.quizTitle}</div>
                         <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span>{new Date(attempt.completedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                            <span className="w-1 h-1 rounded-full bg-border" />
                            <span className="capitalize">{attempt.mode} Mode</span>
                         </div>
                      </div>
                      <div className="text-right">
                         <div className="font-bold text-lg">
                            {attempt.score > 0 ? "+" : ""}{attempt.score}
                            <span className="text-sm font-normal text-muted-foreground ml-1">/ {attempt.totalQuestions}</span>
                         </div>
                         <Badge 
                            variant="secondary" 
                            className={`mt-1 text-[10px] uppercase tracking-wider ${
                               (attempt.score / attempt.totalQuestions) >= 0.6 
                               ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                               : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                            }`}
                         >
                            {(attempt.score / attempt.totalQuestions * 100).toFixed(0)}%
                         </Badge>
                      </div>
                   </div>
                ))
              )}
           </div>
        </Card>
      </main>
    </div>
  );
}
