"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useUser, UserButton } from "@clerk/nextjs";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import {
  ArrowRight,
  BookOpen,
  ArrowLeft,
  Sparkles,
  History,
  LayoutDashboard
} from "lucide-react";
import { motion } from "framer-motion";
import type { AttemptSummary } from "@/lib/types";
import { QuizPerformanceCard } from "@/components/dashboard/QuizPerformanceCard";

export default function DashboardPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [attempts, setAttempts] = useState<AttemptSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quizzes, setQuizzes] = useState<Array<{ quizId: string; title: string; description: string; questionCount: number }>>([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn || !user?.id) return;
    setLoading(true);
    setError(null);
    apiClient
      .getUserHistory(user.id)
      .then((res) => {
        setAttempts(res.attempts || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load attempts.");
        setLoading(false);
      });
  }, [isLoaded, isSignedIn, user?.id]);

  // Fetch available quizzes
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await fetch("/api/quizzes");
        if (response.ok) {
          const data = await response.json();
          setQuizzes(data.quizzes || []);
        }
      } catch (err) {
        console.error("Failed to fetch quizzes:", err);
      } finally {
        setLoadingQuizzes(false);
      }
    };
    fetchQuizzes();
  }, []);

  // Handle quiz start
  const handleStartQuiz = () => {
    if (quizzes.length > 0) {
      window.location.href = "/quizzes";
    } else {
      alert("No quizzes available at the moment.");
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8 text-center max-w-sm w-full border-border/50 bg-card/60 backdrop-blur-xl">
          <p className="mb-6 text-muted-foreground">Please sign in to access your dashboard.</p>
          <Link href="/sign-in">
            <Button className="w-full">Sign In</Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Group attempts by quizId
  const quizStats = attempts.reduce((acc, attempt) => {
    if (!acc[attempt.quizId]) {
      acc[attempt.quizId] = {
        quizTitle: attempt.quizTitle,
        attempts: [],
        totalQuestions: attempt.totalQuestions,
      };
    }
    acc[attempt.quizId].attempts.push(attempt);
    if (new Date(attempt.completedAt) > new Date(acc[attempt.quizId].attempts[0]?.completedAt || 0)) {
         acc[attempt.quizId].totalQuestions = attempt.totalQuestions;
    }
    return acc;
  }, {} as Record<string, { quizTitle: string; attempts: AttemptSummary[]; totalQuestions: number }>);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <div className="min-h-screen relative">
      {/* Background provided by layout */}

      {/* Header */}

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-4 md:px-6 w-full">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to home</span>
              </Button>
            </Link>
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/30 transition-shadow">
                <span className="text-white font-bold text-sm">Q</span>
              </div>
              <span className="text-lg font-bold tracking-tight group-hover:text-primary transition-colors">QuizMaster</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <UserButton 
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "h-9 w-9 ring-2 ring-primary/20",
                },
              }}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <motion.main
        className="container max-w-7xl px-4 md:px-8 py-12 mx-auto relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Welcome Section */}
        <motion.div variants={itemVariants} className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              Welcome back, {user?.firstName || "User"}
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
              Track your progress and master new skills. You've completed <span className="text-primary font-semibold">{attempts.length}</span> sessions so far.
            </p>
          </div>
          {quizzes.length > 0 && (
             <Button 
                size="lg" 
                onClick={handleStartQuiz} 
                className="h-12 px-8 rounded-full shadow-lg shadow-primary/25 bg-gradient-to-r from-primary to-blue-600 hover:opacity-90 transition-all hover:scale-105 active:scale-95"
              >
                Start New Quiz <ArrowRight className="ml-2 w-4 h-4" />
             </Button>
          )}
        </motion.div>

        
        {/* Available Quizzes - Hero Card */}
        {quizzes.length > 0 && (
          <motion.div variants={itemVariants} className="mb-16">
            <div className="flex items-center gap-2 mb-6">
               <Sparkles className="w-5 h-5 text-amber-500" />
               <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Recommended for you</h2>
            </div>
            
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-gray-900 to-gray-800 text-white shadow-2xl dark:shadow-none dark:from-card dark:to-card/50 dark:border dark:border-white/10">
               {/* Decorative Circles */}
              <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl whitespace-nowrap" />

              <CardContent className="relative p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="space-y-4 max-w-2xl">
                  <Badge className="bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur-md px-3 py-1 text-xs uppercase tracking-wider">
                     Featured
                  </Badge>
                  <h3 className="text-3xl font-bold">
                    {quizzes.length === 1 ? quizzes[0].title : "Explore Our Quiz Library"}
                  </h3>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    {quizzes.length === 1 
                      ? (quizzes[0].description || "Test your knowledge and improve your skills with this comprehensive assessment.")
                      : "Choose from a variety of quizzes designed to help you master new concepts."}
                  </p>
                  <div className="flex flex-wrap gap-3 pt-2">
                     {quizzes.length === 1 && (
                       <>
                        <Badge variant="outline" className="border-white/20 text-white/80">{quizzes[0].questionCount} Questions</Badge>
                        <Badge variant="outline" className="border-white/20 text-white/80">Study & Exam Modes</Badge>
                       </>
                     )}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
        
        {/* Per-Quiz Performance Section */}
        {Object.keys(quizStats).length > 0 && (
          <motion.div variants={itemVariants} className="mb-16">
            <div className="flex items-center gap-2 mb-6">
               <LayoutDashboard className="w-5 h-5 text-primary" />
               <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Performance Overview</h2>
            </div>
            <div className="grid gap-6 grid-cols-1">
              {Object.values(quizStats).map((quizGroup) => {
                const sortedAttempts = [...quizGroup.attempts].sort(
                  (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
                );
                const latest = sortedAttempts[0];
                const bestScore = Math.max(...quizGroup.attempts.map(a => a.score));

                return (
                  <QuizPerformanceCard
                    key={latest.quizId}
                    quizTitle={quizGroup.quizTitle}
                    totalAttempts={quizGroup.attempts.length}
                    bestScore={bestScore}
                    latestScore={latest.score}
                    totalQuestions={quizGroup.totalQuestions}
                  />
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Recent Attempts List */}
         <motion.div variants={itemVariants}>
            <div className="flex items-center gap-2 mb-6">
               <History className="w-5 h-5 text-primary" />
               <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Recent Activity</h2>
            </div>

            <Card className="border-border/50 bg-white/50 dark:bg-card/40 backdrop-blur-sm overflow-hidden shadow-sm dark:shadow-none">
               <div className="divide-y divide-border/50">
                  {attempts.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground">
                       No activity yet. Start a quiz to see your history here.
                    </div>
                  ) : (
                    attempts.slice(0, 5).map((attempt) => (
                       <div key={attempt.attemptId} className="p-5 flex items-center justify-between hover:bg-white/60 dark:hover:bg-card/60 transition-colors group">
                          <div className="space-y-1">
                             <div className="font-semibold group-hover:text-primary transition-colors">{attempt.quizTitle}</div>
                             <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <span>{new Date(attempt.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
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
               {attempts.length > 5 && (
                  <div className="p-4 border-t border-border/50 text-center">
                      <Link href="/dashboard/history">
                         <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                            View All Activity
                         </Button>
                      </Link>
                  </div>
               )}
            </Card>
         </motion.div>

      </motion.main>
    </div>
  );
}
