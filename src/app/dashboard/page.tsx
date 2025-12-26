"use client";

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
  Clock,
  Trophy,
  TrendingUp,
  User,
  ArrowLeft,
} from "lucide-react";
import { motion } from "framer-motion";
import type { AttemptSummary } from "@/lib/types";

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
      // Always go to quizzes page to show selection
      window.location.href = "/quizzes";
    } else {
      alert("No quizzes available at the moment.");
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="mb-4">Please sign in to view your dashboard.</p>
          <Link href="/sign-in">
            <Button>Sign In</Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="mb-4 text-destructive">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </Card>
      </div>
    );
  }

  // Calculate comprehensive analytics
  const stats = {
    totalAttempts: attempts.length,
    averageScore:
      attempts.length > 0
        ? Math.round(
            attempts.reduce(
              (acc, a) => acc + (a.score / a.totalQuestions) * 100,
              0
            ) / attempts.length
          )
        : 0,
    bestScore:
      attempts.length > 0
        ? Math.max(
            ...attempts.map((a) =>
              Math.round((a.score / a.totalQuestions) * 100)
            )
          )
        : 0,
    totalQuestionsAnswered: attempts.reduce(
      (acc, a) => acc + a.totalQuestions,
      0
    ),
    totalCorrectAnswers: attempts.reduce((acc, a) => acc + a.score, 0),
    studyModeAttempts: attempts.filter((a) => a.mode === "study").length,
    examModeAttempts: attempts.filter((a) => a.mode === "exam").length,
    improvementTrend: attempts.length >= 2
      ? (() => {
          const recent = attempts.slice(0, 3);
          const older = attempts.slice(3, 6);
          const recentAvg =
            recent.length > 0
              ? recent.reduce(
                  (acc, a) => acc + (a.score / a.totalQuestions) * 100,
                  0
                ) / recent.length
              : 0;
          const olderAvg =
            older.length > 0
              ? older.reduce(
                  (acc, a) => acc + (a.score / a.totalQuestions) * 100,
                  0
                ) / older.length
              : 0;
          return Math.round((recentAvg - olderAvg) * 10) / 10;
        })()
      : 0,
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-4 md:px-6 w-full">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to home</span>
              </Button>
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary to-primary/50 flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">
                  Q
                </span>
              </div>
              <span className="text-lg font-bold hidden sm:inline">QuizMaster</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <UserButton 
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8",
                  userButtonPopoverCard: "bg-card border border-border",
                  userButtonPopoverActions: "text-foreground",
                  userButtonPopoverActionButton: "text-foreground hover:bg-accent",
                },
              }}
            />
          </div>
        </div>
      </header>
      {/* Main Content */}
      <motion.main
        id="main-content"
        tabIndex={-1}
        className="container max-w-5xl px-4 md:px-6 py-8 md:py-12 mx-auto focus:outline-none"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Welcome Section */}
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user?.firstName || "User"}! 👋
          </h1>
          <p className="text-muted-foreground">
            Ready to continue your learning journey?
          </p>
        </motion.div>
        {/* Stats Cards */}
        <motion.div
          variants={itemVariants}
          className="grid gap-4 md:grid-cols-3 mb-8"
        >
          <Card className="bg-linear-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Attempts
              </CardTitle>
              <Clock className="w-4 h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAttempts}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.studyModeAttempts} study, {stats.examModeAttempts} exam
              </p>
            </CardContent>
          </Card>
          <Card className="bg-linear-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Average Score
              </CardTitle>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageScore}%</div>
              {stats.improvementTrend !== 0 && (
                <p
                  className={`text-xs mt-1 ${
                    stats.improvementTrend > 0
                      ? "text-emerald-500"
                      : "text-rose-500"
                  }`}
                >
                  {stats.improvementTrend > 0 ? "↑" : "↓"}{" "}
                  {Math.abs(stats.improvementTrend).toFixed(1)}% vs previous
                </p>
              )}
            </CardContent>
          </Card>
          <Card className="bg-linear-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Best Score
              </CardTitle>
              <Trophy className="w-4 h-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.bestScore}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.totalCorrectAnswers}/{stats.totalQuestionsAnswered} correct
              </p>
            </CardContent>
          </Card>
        </motion.div>
        {/* Start Quiz Card */}
        {quizzes.length > 0 && (
          <motion.div variants={itemVariants} className="mb-8">
            <Card className="overflow-hidden border-primary/20 bg-linear-to-br from-primary/5 to-primary/0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  {quizzes.length === 1 ? quizzes[0].title : "Available Quizzes"}
                </CardTitle>
                <CardDescription>
                  {quizzes.length === 1 
                    ? (quizzes[0].description || `${quizzes[0].questionCount} questions covering various topics`)
                    : `${quizzes.length} quizzes available. Select one to start learning.`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {quizzes.length === 1 && (
                    <div className="flex gap-2">
                      <Badge
                        variant="secondary"
                        className="bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      >
                        {quizzes[0].questionCount} Questions
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      >
                        Study + Exam
                      </Badge>
                    </div>
                  )}
                  <div className="sm:ml-auto">
                    <Button 
                      className="gap-2 bg-linear-to-r from-primary to-primary/80 shadow-lg shadow-primary/20"
                      onClick={handleStartQuiz}
                      disabled={loadingQuizzes}
                    >
                      {loadingQuizzes ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          {quizzes.length === 1 ? "Start Quiz" : "Select Quiz"}
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
        {/* Past Attempts */}
        <motion.div variants={itemVariants}>
          <h2 className="text-xl font-semibold mb-4">Recent Attempts</h2>
          {attempts.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground mb-4">
                You haven't completed any quizzes yet.
              </p>
              <Button onClick={handleStartQuiz} disabled={loadingQuizzes}>
                {loadingQuizzes ? "Loading..." : "Take Your First Quiz"}
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {attempts.map((attempt) => {
                const percentage = Math.round(
                  (attempt.score / attempt.totalQuestions) * 100
                );
                return (
                  <Card key={attempt.attemptId} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{attempt.quizTitle}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(attempt.completedAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge
                          variant="secondary"
                          className={
                            attempt.mode === "exam"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                          }
                        >
                          {attempt.mode === "exam" ? "Exam" : "Study"}
                        </Badge>
                        <div className="text-right">
                          <div className="font-semibold">
                            {attempt.score}/{attempt.totalQuestions}
                          </div>
                          <div
                            className={`text-sm ${
                              percentage >= 70
                                ? "text-emerald-500"
                                : percentage >= 50
                                ? "text-amber-500"
                                : "text-rose-500"
                            }`}
                          >
                            {percentage}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </motion.div>
      </motion.main>
    </div>
  );
}
