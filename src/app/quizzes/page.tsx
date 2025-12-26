"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser, SignUpButton } from "@clerk/nextjs";
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
import { BookOpen, ArrowRight, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Quiz {
  quizId: string;
  title: string;
  description: string;
  questionCount: number;
}

export default function QuizzesPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded: authLoaded } = useUser();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/quizzes");
      if (!response.ok) {
        throw new Error("Failed to fetch quizzes");
      }
      const data = await response.json();
      setQuizzes(data.quizzes || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load quizzes");
    } finally {
      setLoading(false);
    }
  };

  const handleQuizClick = (quizId: string) => {
    // If user is signed in, go directly to quiz, always start new attempt
    if (authLoaded && isSignedIn) {
      router.push(`/quiz/${quizId}?new=1`);
    }
    // If not signed in, the SignUpButton will handle authentication
    // After sign-up, user will be redirected and can click again
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
                <span className="sr-only">Back to dashboard</span>
              </Button>
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary to-primary/50 flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">
                  Q
                </span>
              </div>
              <span className="text-lg font-bold hidden md:block">
                QuizMaster
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm">
                Home
              </Button>
            </Link>
            {authLoaded && isSignedIn && (
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  Dashboard
                </Button>
              </Link>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-6xl px-4 md:px-6 py-8 md:py-12 mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Available Quizzes
          </h1>
          <p className="text-muted-foreground">
            Select a quiz to start learning
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : quizzes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                No quizzes available at the moment.
              </p>
              <Link href="/">
                <Button variant="outline">Go Back Home</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          /* Quiz Grid */
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {quizzes.map((quiz) => (
              <Card
                key={quiz.quizId}
                className="hover:shadow-lg transition-all duration-300 group"
                style={{
                  cursor: authLoaded && isSignedIn ? "pointer" : "default",
                }}
                onClick={() => {
                  if (authLoaded && isSignedIn) {
                    handleQuizClick(quiz.quizId);
                  }
                }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    <Badge
                      variant="secondary"
                      className="bg-primary/10 text-primary"
                    >
                      {quiz.questionCount} Q
                    </Badge>
                  </div>
                  <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                    {quiz.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-3">
                    {quiz.description || "No description available"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {authLoaded && isSignedIn ? (
                    <Button
                      className="w-full gap-2 bg-linear-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuizClick(quiz.quizId);
                      }}
                    >
                      Start Quiz
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <SignUpButton
                      mode="modal"
                      fallbackRedirectUrl={`/quiz/${quiz.quizId}`}
                    >
                      <Button
                        className="w-full gap-2 bg-linear-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        Start Quiz
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </SignUpButton>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
