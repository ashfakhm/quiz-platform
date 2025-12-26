"use client";

import { Trophy, RotateCcw, Home, ArrowUp, CheckCircle2, XCircle, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";

import type { Question } from "@/lib/types";

interface ScoreSummaryProps {
  score: number; // net score (may be negative)
  totalQuestions: number;
  onRestart: () => void;
  questions?: Question[];
  answers?: Map<string, number>;
  attempted?: number;
  correct?: number;
  incorrect?: number;
  result?: "Pass" | "Fail" | null;
  totalMarks?: number; // sum of all question marks
}

export function ScoreSummary({
  score,
  totalQuestions,
  onRestart,
  questions,
  answers,
  attempted,
  correct,
  incorrect,
  result,
  totalMarks,
}: ScoreSummaryProps) {
  // Calculate correct, attempted, incorrect, and points scored using answers and questions
  let correctCount = 0;
  let attemptedCount = 0;
  let incorrectCount = 0;
  let pointsScored = 0;
  
  if (typeof correct === "number" && typeof incorrect === "number" && typeof attempted === "number") {
     correctCount = correct;
     incorrectCount = incorrect;
     attemptedCount = attempted;
     pointsScored = typeof score === "number" ? score : 0;
  } else if (questions && answers) {
    questions.forEach((q) => {
      const selected = answers.get(q.id);
      if (selected !== undefined && selected !== null) {
        attemptedCount++;
        const mark = q.mark ?? 1;
        if (selected === q.correctIndex) {
          correctCount++;
          pointsScored += mark;
        } else {
          incorrectCount++;
          pointsScored -= mark * 0.25;
        }
      }
    });
  } else {
    correctCount = 0;
    attemptedCount = 0;
    incorrectCount = 0;
    pointsScored = typeof score === "number" ? score : 0;
  }

  // --- Stats Calculation ---
  const maxScore =
    totalMarks ??
    (questions
      ? questions.reduce((sum, q) => sum + (q.mark ?? 1), 0)
      : totalQuestions);

  const latestScore = pointsScored;
  const latestPercentage =
    maxScore > 0 ? Math.round((latestScore / maxScore) * 100) : 0;
  const resultText = result || (latestPercentage >= 60 ? "Pass" : "Fail");

  // Determine colors based on latestPercentage
  const getSemanticColor = () => {
    if (latestPercentage >= 80) return "text-emerald-500";
    if (latestPercentage >= 60) return "text-blue-500";
    if (latestPercentage >= 50) return "text-yellow-500";
    return "text-destructive"; // Using Shadcn destructive token
  };

  const percentageColor = getSemanticColor();
  const isPass = resultText === "Pass";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-2xl mx-auto p-4"
    >
      <Card className="border-2 shadow-lg dark:shadow-primary/5">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <Trophy className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">Quiz Completed!</CardTitle>
          <CardDescription className="text-lg">
            Here is your performance summary
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* Main Score & Result */}
          <div className="flex flex-col items-center justify-center space-y-4 py-4">
            <div className="flex items-center gap-3">
               <span className={cn("text-6xl font-extrabold tracking-tight", percentageColor)}>
                {latestPercentage}%
              </span>
              <Badge 
                variant={isPass ? "default" : "destructive"} 
                className="text-lg px-4 py-1 h-auto"
              >
                {resultText}
              </Badge>
            </div>
            
            <p className="text-muted-foreground font-medium">
              You scored {pointsScored.toFixed(2)} out of {maxScore} points
            </p>
          </div>

          <Separator />

          {/* Detailed Stats Grid */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-semibold">Correct</span>
              </div>
              <p className="text-3xl font-bold">{correctCount}</p>
              <p className="text-xs text-muted-foreground">Questions</p>
            </div>
            
            <div className="space-y-2">
               <div className="flex items-center justify-center gap-2 text-destructive dark:text-red-400">
                <XCircle className="w-5 h-5" />
                <span className="font-semibold">Incorrect</span>
              </div>
              <p className="text-3xl font-bold">{incorrectCount}</p>
               <p className="text-xs text-muted-foreground">Questions</p>
            </div>

            <div className="space-y-2">
               <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400">
                <HelpCircle className="w-5 h-5" />
                <span className="font-semibold">Attempted</span>
              </div>
              <p className="text-3xl font-bold">{attemptedCount}/{totalQuestions}</p>
               <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </div>
          
           <div className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">
              {latestPercentage >= 80
                ? "Excellent work! You have a strong understanding of the material."
                : latestPercentage >= 60
                ? "Good effort. Review the explanations to improve your score."
                : "Keep practicing. Focus on the review section to understand your mistakes."}
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-3 pt-6 pb-8 justify-center">
          <Button
            variant="outline"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="w-full sm:w-auto gap-2"
          >
            <ArrowUp className="w-4 h-4" />
            Review Answers
          </Button>

          <Button
            onClick={onRestart}
            className="w-full sm:w-auto gap-2"
            size="lg"
          >
            <RotateCcw className="w-4 h-4" />
            Try Again
          </Button>

          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button variant="ghost" className="w-full gap-2">
              <Home className="w-4 h-4" />
              Dashboard
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
