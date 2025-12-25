"use client";

import { Check, X } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface OptionButtonProps {
  option: string;
  index: number;
  isSelected: boolean;
  isCorrect: boolean;
  showFeedback: boolean;
  disabled: boolean;
  onClick: () => void;
}

const optionLabels = ["A", "B", "C", "D"];

export function OptionButton({
  option,
  index,
  isSelected,
  isCorrect,
  showFeedback,
  disabled,
  onClick,
}: OptionButtonProps) {
  // Determine visual state
  const getStateClasses = () => {
    if (!showFeedback) {
      // Before feedback
      if (isSelected) {
        return "border-primary bg-primary/10 ring-2 ring-primary/30";
      }
      return "border-border hover:border-primary/50 hover:bg-accent/50";
    }

    // After feedback - Quiet, non-celebratory
    if (isCorrect) {
      return "border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500/30";
    }
    if (isSelected && !isCorrect) {
      return "border-rose-500 bg-rose-500/10 ring-1 ring-rose-500/30";
    }
    return "border-border opacity-50";
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      initial={false}
      animate={{
        scale: isSelected ? 1 : 1,
      }}
      whileHover={!disabled ? { scale: 1.005 } : {}}
      whileTap={!disabled ? { scale: 0.995 } : {}}
      transition={{ duration: 0.2 }}
      className={cn(
        "w-full flex items-center gap-3 p-4 rounded-lg border transition-all duration-200",
        "text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        disabled && !showFeedback && "cursor-not-allowed opacity-50",
        getStateClasses()
      )}
    >
      {/* Option label (A, B, C, D) */}
      <span
        className={cn(
          "shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          "text-sm font-semibold transition-all duration-200",
          showFeedback && isCorrect
            ? "bg-emerald-500 text-white shadow-sm"
            : showFeedback && isSelected && !isCorrect
            ? "bg-rose-500 text-white shadow-sm"
            : isSelected
            ? "bg-primary text-primary-foreground shadow-sm"
            : "bg-muted text-muted-foreground"
        )}
      >
        {showFeedback && (isSelected || isCorrect) ? (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {isCorrect ? (
              <Check className="w-4 h-4" />
            ) : isSelected ? (
              <X className="w-4 h-4" />
            ) : (
              optionLabels[index]
            )}
          </motion.div>
        ) : (
          optionLabels[index]
        )}
      </span>

      {/* Option text */}
      <span className="flex-1 text-foreground font-medium">{option}</span>

      {/* Correctness indicator for non-selected correct answer */}
      {showFeedback && isCorrect && !isSelected && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Check className="w-5 h-5 text-emerald-500" />
        </motion.div>
      )}
    </motion.button>
  );
}
