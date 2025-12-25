'use client';

import { useRef, useEffect } from 'react';
import { Trophy, RotateCcw, Home, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface ScoreSummaryProps {
  score: number;
  totalQuestions: number;
  onRestart: () => void;
}

export function ScoreSummary({
  score,
  totalQuestions,
  onRestart,
}: ScoreSummaryProps) {
  const percentage = Math.round((score / totalQuestions) * 100);

  // Determine grade and colors
  const getGrade = () => {
    if (percentage >= 90) return { grade: 'A+', color: 'text-emerald-500', bg: 'from-emerald-500/20 to-emerald-600/10' };
    if (percentage >= 80) return { grade: 'A', color: 'text-emerald-400', bg: 'from-emerald-400/20 to-emerald-500/10' };
    if (percentage >= 70) return { grade: 'B', color: 'text-blue-500', bg: 'from-blue-500/20 to-blue-600/10' };
    if (percentage >= 60) return { grade: 'C', color: 'text-yellow-500', bg: 'from-yellow-500/20 to-yellow-600/10' };
    if (percentage >= 50) return { grade: 'D', color: 'text-orange-500', bg: 'from-orange-500/20 to-orange-600/10' };
    return { grade: 'F', color: 'text-rose-500', bg: 'from-rose-500/20 to-rose-600/10' };
  };

  const { grade, color, bg } = getGrade();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
    >
      <Card
        className={`relative overflow-hidden p-8 md:p-12 text-center bg-gradient-to-br ${bg}`}
      >
        {/* Trophy icon */}
        <div className="flex justify-center mb-6">
          <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${bg} flex items-center justify-center`}>
            <Trophy className={`w-10 h-10 ${color}`} />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Quiz Completed!
        </h2>
        <p className="text-muted-foreground mb-8">
          Here is your performance summary
        </p>

        {/* Score display */}
        <div className="flex items-center justify-center gap-8 mb-8">
          <div className="text-center">
            <div className="text-5xl md:text-6xl font-bold mb-2">
              <span className={color}>{score}</span>
              <span className="text-muted-foreground">/{totalQuestions}</span>
            </div>
            <p className="text-sm text-muted-foreground">Questions Correct</p>
          </div>

          <div className="h-20 w-px bg-border" />

          <div className="text-center">
            <div className={`text-5xl md:text-6xl font-bold ${color} mb-2`}>
              {percentage}%
            </div>
            <p className="text-sm text-muted-foreground">Accuracy</p>
          </div>

          <div className="h-20 w-px bg-border" />

          <div className="text-center">
            <div className={`text-5xl md:text-6xl font-bold ${color} mb-2`}>
              {grade}
            </div>
            <p className="text-sm text-muted-foreground">Grade</p>
          </div>
        </div>

        {/* Message */}
        <p className="text-muted-foreground mb-8">
          {percentage >= 80
            ? 'Excellent work. Strong understanding.'
            : percentage >= 60
            ? 'Good effort. Review explanations to improve.'
            : 'Keep practicing. Focus on the review section.'}
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="outline"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="gap-2"
          >
            <ArrowUp className="w-4 h-4" />
            Review Answers
          </Button>

          <Button
            onClick={onRestart}
            className="gap-2 bg-gradient-to-r from-primary to-primary/80"
          >
            <RotateCcw className="w-4 h-4" />
            Try Again
          </Button>

          <Link href="/dashboard">
            <Button variant="ghost" className="gap-2">
              <Home className="w-4 h-4" />
              Dashboard
            </Button>
          </Link>
        </div>
      </Card>
    </motion.div>
  );
}
