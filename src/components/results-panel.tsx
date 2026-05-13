"use client";

import { motion } from "framer-motion";
import { Trophy, RefreshCw, BookOpen, CheckCircle2, XCircle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";

interface TopicScore {
  topic: string;
  correct: number;
  total: number;
}

interface ResultsPanelProps {
  correct: number;
  total: number;
  topicScores: TopicScore[];
  onRestart: () => void;
  onStudy: () => void;
}

function getGrade(pct: number) {
  if (pct >= 90) return { label: "Excelente!", color: "text-green-500", emoji: "🏆" };
  if (pct >= 75) return { label: "Muito Bom!", color: "text-blue-500", emoji: "🌟" };
  if (pct >= 60) return { label: "Bom", color: "text-yellow-500", emoji: "👍" };
  if (pct >= 50) return { label: "Regular", color: "text-orange-500", emoji: "📚" };
  return { label: "Precisa Estudar Mais", color: "text-red-500", emoji: "💪" };
}

export function ResultsPanel({ correct, total, topicScores, onRestart, onStudy }: ResultsPanelProps) {
  const pct = Math.round((correct / total) * 100);
  const grade = getGrade(pct);
  const radarData = topicScores.map((ts) => ({
    topic: ts.topic.split(" ")[0],
    score: ts.total > 0 ? Math.round((ts.correct / ts.total) * 100) : 0,
    fullMark: 100,
  }));

  const weakTopics = topicScores.filter((ts) => ts.total > 0 && ts.correct / ts.total < 0.6);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6 w-full max-w-2xl mx-auto"
    >
      <Card className="border-2">
        <CardHeader className="text-center pb-3">
          <div className="text-5xl mb-2">{grade.emoji}</div>
          <CardTitle className="text-2xl">{grade.label}</CardTitle>
          <p className="text-muted-foreground text-sm">Quiz FRC — Fundamentos de Redes de Computadores</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className={`text-6xl font-bold ${grade.color}`}>{pct}%</div>
            <p className="text-muted-foreground text-sm mt-1">
              {correct} de {total} questões corretas
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {topicScores.map((ts) => (
              <div key={ts.topic} className="rounded-lg border bg-muted/30 p-3">
                <p className="text-xs font-semibold truncate">{ts.topic}</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-sm font-bold text-green-500">{ts.correct}</span>
                  <span className="text-xs text-muted-foreground">/{ts.total}</span>
                  <span className="ml-auto text-xs font-medium">
                    {ts.total > 0 ? Math.round((ts.correct / ts.total) * 100) : 0}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          {radarData.length >= 3 && (
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="topic" tick={{ fontSize: 11 }} />
                <Radar
                  name="Desempenho"
                  dataKey="score"
                  stroke="#6366f1"
                  fill="#6366f1"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          )}

          {weakTopics.length > 0 && (
            <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-amber-600" />
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                  Tópicos para Revisar
                </p>
              </div>
              <div className="flex flex-wrap gap-1">
                {weakTopics.map((wt) => (
                  <Badge key={wt.topic} variant="outline" className="text-xs border-amber-400 text-amber-700 dark:text-amber-300">
                    {wt.topic}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button onClick={onRestart} variant="outline" className="flex-1 gap-2">
              <RefreshCw className="h-4 w-4" />
              Tentar Novamente
            </Button>
            <Button onClick={onStudy} className="flex-1 gap-2">
              <BookOpen className="h-4 w-4" />
              Modo Estudo
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
