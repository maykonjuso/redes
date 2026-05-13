"use client";

import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Circle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface QuizProgressProps {
  current: number;
  total: number;
  correct: number;
  incorrect: number;
}

export function QuizProgress({ current, total, correct, incorrect }: QuizProgressProps) {
  const pct = Math.round((current / total) * 100);
  const accuracy = current > 0 ? Math.round((correct / current) * 100) : 0;

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-muted-foreground">
          Questão <span className="text-foreground font-bold">{Math.min(current + 1, total)}</span> de{" "}
          <span className="text-foreground font-bold">{total}</span>
        </span>
        <span className="text-muted-foreground">
          Acertos: <span className="text-green-500 font-bold">{accuracy}%</span>
        </span>
      </div>

      <Progress value={pct} className="h-2" />

      <div className="flex gap-4 justify-center">
        <motion.div
          key={`correct-${correct}`}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="flex items-center gap-1.5 text-sm"
        >
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <span className="font-semibold text-green-600 dark:text-green-400">{correct}</span>
          <span className="text-muted-foreground">corretas</span>
        </motion.div>
        <motion.div
          key={`incorrect-${incorrect}`}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="flex items-center gap-1.5 text-sm"
        >
          <XCircle className="h-4 w-4 text-red-500" />
          <span className="font-semibold text-red-600 dark:text-red-400">{incorrect}</span>
          <span className="text-muted-foreground">erradas</span>
        </motion.div>
        <div className="flex items-center gap-1.5 text-sm">
          <Circle className="h-4 w-4 text-muted-foreground" />
          <span className="font-semibold">{total - current}</span>
          <span className="text-muted-foreground">restantes</span>
        </div>
      </div>
    </div>
  );
}
