"use client";

import { BookOpen, ClipboardCheck, Lock } from "lucide-react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import type { QuizMode } from "@/lib/types";
import { cn } from "@/lib/utils";
import { MouseEvent } from "react";

interface ModeSelectorProps {
  selectedMode: QuizMode | null;
  isLocked: boolean;
  onSelectMode: (mode: QuizMode) => void;
}

export function ModeSelector({
  selectedMode,
  isLocked,
  onSelectMode,
}: ModeSelectorProps) {
  const modes: {
    mode: QuizMode;
    title: string;
    description: string;
    icon: typeof BookOpen;
  }[] = [
    {
      mode: "study",
      title: "Study Mode",
      description: "Learn with immediate feedback and explanations",
      icon: BookOpen,
    },
    {
      mode: "exam",
      title: "Exam Mode",
      description: "Test yourself without hints, see results at the end",
      icon: ClipboardCheck,
    },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl font-bold text-foreground dark:text-white mb-3 tracking-tight">
          Choose Your Mode
        </h2>
        <p className="text-muted-foreground text-lg dark:text-gray-400">
          Select how you want to approach this quiz
        </p>

        {isLocked && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center gap-2 mt-4 text-amber-500 bg-amber-500/10 py-2 px-4 rounded-full w-fit mx-auto"
          >
            <Lock className="w-4 h-4" />
            <span className="text-sm font-medium">Mode locked</span>
          </motion.div>
        )}
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        {modes.map((modeData) => (
          <SpotlightCard
            key={modeData.mode}
            {...modeData}
            isSelected={selectedMode === modeData.mode}
            isLocked={isLocked}
            onClick={() => onSelectMode(modeData.mode)}
          />
        ))}
      </div>
    </div>
  );
}

function SpotlightCard({
  title,
  description,
  icon: Icon,
  isSelected,
  isLocked,
  onClick,
}: {
  mode: QuizMode;
  title: string;
  description: string;
  icon: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  isSelected: boolean;
  isLocked: boolean;
  onClick: () => void;
}) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove(e: MouseEvent<HTMLButtonElement>) {
    const { left, top } = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
  }

  return (
    <motion.button
      whileHover={!isLocked ? { scale: 1.02 } : {}}
      whileTap={!isLocked ? { scale: 0.98 } : {}}
      onClick={onClick}
      disabled={isLocked}
      onMouseMove={handleMouseMove}
      className={cn(
        "group relative flex flex-col items-center text-center p-8 rounded-2xl border transition-all duration-300 overflow-hidden bg-card h-full",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        isLocked && "cursor-not-allowed opacity-50 grayscale",
        isSelected
          ? "border-primary shadow-lg shadow-primary/10 dark:border-primary dark:shadow-primary/20"
          : "border-border hover:border-border/80 dark:border-gray-700 dark:hover:border-gray-500",
        "bg-card text-card-foreground dark:bg-gray-800 dark:text-white"
      )}
    >
      {/* Spotlight Effect */}
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition duration-300"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(14, 165, 233, 0.1),
              transparent 80%
            )
          `,
        }}
      />

      {/* Active Indicator Background */}
      {isSelected && <div className="absolute inset-0 bg-primary/5 z-0" />}

      <div className="relative z-10 flex flex-col items-center h-full">
        <div
          className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center mb-5 shadow-sm transition-colors duration-300",
            isSelected
              ? "bg-primary text-primary-foreground dark:bg-primary dark:text-white"
              : "bg-muted text-muted-foreground group-hover:scale-110 group-hover:bg-primary/10 group-hover:text-primary dark:bg-gray-700 dark:text-gray-300 dark:group-hover:bg-primary/20 dark:group-hover:text-primary"
          )}
        >
          <Icon className="w-7 h-7" />
        </div>

        <h3 className="text-xl font-bold text-foreground dark:text-white mb-3">
          {title}
        </h3>
        <p className="text-muted-foreground leading-relaxed dark:text-gray-400">
          {description}
        </p>
      </div>
    </motion.button>
  );
}
