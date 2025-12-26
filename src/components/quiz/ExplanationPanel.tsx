"use client";


import { Lightbulb, CheckCircle2, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ExplanationPanelProps {
  explanation: {
    format: "markdown" | "text";
    content: string;
  };
  isCorrect: boolean | null;
}

export function ExplanationPanel({
  explanation,
  isCorrect,
}: ExplanationPanelProps) {
  // Simple markdown-like rendering (bold and bullet points)
  const renderContent = (content: string) => {
    return content.split("\n").map((line, index) => {
      // Handle bullet points
      if (line.startsWith("• ") || line.startsWith("- ")) {
        return (
          <li key={index} className="ml-4 list-disc">
            {renderInlineFormatting(line.substring(2))}
          </li>
        );
      }
      // Handle numbered lists
      if (/^\d+\.\s/.test(line)) {
        return (
          <li key={index} className="ml-4 list-decimal">
            {renderInlineFormatting(line.replace(/^\d+\.\s/, ""))}
          </li>
        );
      }
      // Empty lines
      if (line.trim() === "") {
        return <br key={index} />;
      }
      // Regular paragraph
      return (
        <p key={index} className="mb-2 last:mb-0">
          {renderInlineFormatting(line)}
        </p>
      );
    });
  };

  // Handle bold (**text**) and inline formatting
  const renderInlineFormatting = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={index} className="font-semibold text-foreground">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  const fallbackContent = "Explanation not available for this question.";
  const content = explanation?.content || fallbackContent;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0, y: -10 }}
      animate={{ opacity: 1, height: "auto", y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "overflow-hidden rounded-lg border-2 mt-4 bg-card text-card-foreground dark:bg-gray-800 dark:text-white",
        isCorrect === true
          ? "border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-900/10"
          : isCorrect === false
          ? "border-rose-500/30 bg-rose-500/5 dark:bg-rose-900/10"
          : "border-primary/30 bg-primary/5 dark:bg-primary/10"
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "flex items-center gap-2 px-4 py-2 border-b",
          isCorrect === true
            ? "border-emerald-500/20 bg-emerald-500/10 dark:bg-emerald-900/20"
            : isCorrect === false
            ? "border-rose-500/20 bg-rose-500/10 dark:bg-rose-900/20"
            : "border-primary/20 bg-primary/10 dark:bg-primary/20"
        )}
      >
        {isCorrect === true ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        ) : isCorrect === false ? (
          <XCircle className="w-5 h-5 text-rose-500" />
        ) : (
          <Lightbulb className="w-5 h-5 text-primary" />
        )}
        <span
          className={cn(
            "font-semibold text-sm",
            isCorrect === true
              ? "text-emerald-600 dark:text-emerald-400"
              : isCorrect === false
              ? "text-rose-600 dark:text-rose-400"
              : "text-primary dark:text-primary-200"
          )}
        >
          {isCorrect === true
            ? "Correct! Here's why:"
            : isCorrect === false
            ? "Incorrect. The correct answer:"
            : "Explanation"}
        </span>
      </div>

      {/* Content */}
      <div className="px-4 py-3 text-sm text-muted-foreground leading-relaxed dark:text-gray-400">
        {renderContent(content)}
      </div>
    </motion.div>
  );
}
