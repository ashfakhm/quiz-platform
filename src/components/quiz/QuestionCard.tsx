"use client";

import { motion } from "framer-motion";
// Removed unused Card, CardContent, CardHeader imports
import { Badge } from "@/components/ui/badge";
import type { Question } from "@/lib/types";
import { OptionButton } from "./OptionButton";
import { ExplanationPanel } from "./ExplanationPanel";
import { cn } from "../../lib/utils";

interface QuestionCardProps {
  question: Question;
  questionNumber: number | string;
  selectedIndex: number | undefined;
  showFeedback: boolean;
  showExplanation: boolean;
  canChange: boolean;
  onSelectAnswer: (optionIndex: number) => void;
}

export function QuestionCard({
  question,
  questionNumber,
  selectedIndex,
  showFeedback,
  showExplanation,
  canChange,
  onSelectAnswer,
}: QuestionCardProps) {
  const isAnswered = selectedIndex !== undefined;
  const isCorrect =
    showFeedback && isAnswered ? selectedIndex === question.correctIndex : null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.4, 0.25, 1], delay: 0.05 }}
      className={cn(
        "relative overflow-hidden transition-all duration-300 backdrop-blur-md border-border/50 bg-card text-card-foreground dark:bg-gray-800 dark:text-white",
        isAnswered && showFeedback
          ? isCorrect
            ? "border-emerald-500/50 bg-emerald-500/5 dark:bg-emerald-900/10"
            : "border-rose-500/50 bg-rose-500/5 dark:bg-rose-900/10"
          : "hover:border-primary/30 hover:shadow-sm dark:hover:border-primary/60"
      )}
      id={`question-${question.id}`}
      aria-label={`Question ${questionNumber}`}
    >
      {/* Question number badge */}
      <header className="pb-2">
        <div className="flex items-start gap-3">
          <Badge
            variant={isAnswered ? "default" : "secondary"}
            className={`
              min-w-12 justify-center text-sm font-semibold
              transition-all duration-300
              ${
                isAnswered && showFeedback
                  ? isCorrect
                    ? "bg-emerald-500 hover:bg-emerald-500"
                    : "bg-rose-500 hover:bg-rose-500"
                  : ""
              }
            `}
          >
            Q{questionNumber}
          </Badge>
          {isAnswered && (
            <Badge variant="outline" className="ml-auto opacity-60">
              Answered
            </Badge>
          )}
        </div>
      </header>

      <section className="space-y-4">
        {/* Question text */}
        <p className="text-lg font-medium leading-relaxed text-foreground dark:text-white">
          {question.question}
        </p>
        {question.mark && question.mark > 1 && (
          <p className="text-sm text-muted-foreground mt-2 font-medium">
            (This question has {question.mark} marks)
          </p>
        )}

        {/* Options */}
        <section className="space-y-2" aria-label="Options">
          {question.options.map((option, index) => (
            <OptionButton
              key={index}
              option={option}
              index={index}
              isSelected={selectedIndex === index}
              isCorrect={index === question.correctIndex}
              showFeedback={showFeedback}
              disabled={!canChange}
              onClick={() => onSelectAnswer(index)}
            />
          ))}
        </section>

        {/* Explanation */}
        {showExplanation && (
          <footer>
            <ExplanationPanel
              explanation={question.explanation}
              isCorrect={isCorrect}
            />
          </footer>
        )}
      </section>
    </motion.article>
  );
}
