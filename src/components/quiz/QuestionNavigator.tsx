"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";


import { Question } from "@/lib/types";

interface QuestionNavigatorProps {
  totalQuestions: number;
  answers: Map<string, number>;
  questions: Question[];
  onNavigate: (index: number) => void;
  className?: string;
  mode: "exam" | "study" | null;
  labels?: string[];
}

export function QuestionNavigator({
  totalQuestions,
  answers,
  questions,
  onNavigate,
  className,
  mode,
  labels,
}: QuestionNavigatorProps) {
  // Helper to check status
  const getStatus = (index: number) => {
    const question = questions[index];
    const answer = answers.get(question.id);
    const isAnswered = answer !== undefined && answer !== -1;
    
    if (!isAnswered) return "unanswered";
    
    if (mode === "study") {
      const isCorrect = answer === question.correctIndex;
      return isCorrect ? "correct" : "incorrect";
    }
    
    return "answered";
  };

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
        Question Navigator
      </h3>
      <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: totalQuestions }).map((_, index) => {
          const status = getStatus(index);
          
          const baseClasses = "h-10 w-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors duration-200 border shadow-sm";
          let statusClasses = "bg-background border-border text-muted-foreground hover:border-primary/50 hover:bg-accent hover:text-foreground";
          
          if (status === "answered") {
            // Exam mode answered / Default
            statusClasses = "bg-emerald-500 border-emerald-600 text-white";
          } else if (status === "correct") {
            // Study Mode Correct
            statusClasses = "bg-emerald-500 border-emerald-600 text-white";
          } else if (status === "incorrect") {
            // Study Mode Incorrect
            statusClasses = "bg-rose-500 border-rose-600 text-white";
          }

          return (
            <motion.button
              key={index}
              onClick={() => onNavigate(index)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(baseClasses, statusClasses)}
              title={`Go to Question ${index + 1}`}
              aria-label={`Go to Question ${index + 1} (${status})`}
            >
              {labels ? labels[index] : index + 1}
            </motion.button>
          );
        })}

      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground mt-2">
        {mode === "study" ? (
          <>
             <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span>Correct</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-rose-500" />
              <span>Incorrect</span>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span>Answered</span>
          </div>
        )}
       
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full border border-border bg-background" />
          <span>Unanswered</span>
        </div>
      </div>
    </div>
  );
}
