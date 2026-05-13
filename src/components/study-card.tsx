"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, BookOpen, Lightbulb, Quote } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SignalDiagram } from "@/components/signal-diagram";
import { SlidingWindowViz } from "@/components/sliding-window-viz";
import type { QuizQuestion } from "@/lib/questions";

function renderLine(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

function renderDeepDive(text: string) {
  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];
  let i = 0;
  while (i < lines.length) {
    if (lines[i].startsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        tableLines.push(lines[i]);
        i++;
      }
      const dataRows = tableLines.filter((l) => !/^\|[\s|:-]+\|$/.test(l));
      const parsed = dataRows.map((l) =>
        l.split("|").slice(1, -1).map((c) => c.trim())
      );
      if (parsed.length > 0) {
        nodes.push(
          <table key={`tbl-${i}`} className="w-full text-xs border-collapse my-1">
            <thead>
              <tr>
                {parsed[0].map((cell, j) => (
                  <th key={j} className="border border-border px-2 py-1 bg-muted/60 text-left font-semibold">
                    {renderLine(cell)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {parsed.slice(1).map((row, ri) => (
                <tr key={ri} className="even:bg-muted/20">
                  {row.map((cell, j) => (
                    <td key={j} className="border border-border px-2 py-1">{renderLine(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        );
      }
    } else {
      nodes.push(
        <p key={i} className="text-xs leading-relaxed whitespace-pre-wrap">{renderLine(lines[i])}</p>
      );
      i++;
    }
  }
  return nodes;
}

const DIFFICULTY_COLORS = {
  easy: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  hard: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};
const DIFFICULTY_LABELS = { easy: "Fácil", medium: "Médio", hard: "Difícil" };

function getDiagram(id: string) {
  if (id === "cf-01" || id === "cf-02") return <SignalDiagram type="fourier" title="Aproximação de Fourier" />;
  if (id === "cf-03") return (
    <div className="space-y-2">
      <SignalDiagram type="nrzl" title="NRZ-L" height={140} />
      <SignalDiagram type="manchester" title="Manchester" height={140} />
    </div>
  );
  if (id === "cf-04") return <SignalDiagram type="ask" title="ASK — Amplitude Shift Keying" />;
  if (id === "ce-03") return <SlidingWindowViz />;
  return null;
}

export function StudyCard({ question }: { question: QuizQuestion }) {
  const [expanded, setExpanded] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const diagram = getDiagram(question.id);

  return (
    <Card className="w-full border">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap gap-2 mb-2">
          <Badge className={`text-xs ${DIFFICULTY_COLORS[question.difficulty]}`}>
            {DIFFICULTY_LABELS[question.difficulty]}
          </Badge>
          <Badge variant="secondary" className="text-xs">{question.topic}</Badge>
          <Badge variant="outline" className="text-xs text-muted-foreground">{question.subtopic}</Badge>
        </div>
        <p className="text-sm font-medium leading-relaxed">{question.question}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {diagram && <div>{diagram}</div>}

        <div className="space-y-1.5">
          {question.options.map((opt) => (
            <div
              key={opt.id}
              className={`rounded-md border px-3 py-2 text-sm flex items-start gap-2 transition-colors ${
                showAnswer && opt.id === question.correctAnswer
                  ? "border-green-500 bg-green-50 dark:bg-green-950/30"
                  : "bg-muted/20"
              }`}
            >
              <span className="font-bold text-muted-foreground uppercase w-4 shrink-0">{opt.id})</span>
              <span>{opt.text}</span>
            </div>
          ))}
        </div>

        <Button
          variant={showAnswer ? "default" : "outline"}
          size="sm"
          className="w-full"
          onClick={() => setShowAnswer((s) => !s)}
        >
          {showAnswer ? "Ocultar Resposta" : "Revelar Resposta Correta"}
        </Button>

        <AnimatePresence>
          {showAnswer && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden space-y-3"
            >
              <div className="rounded-lg border bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 p-3">
                <p className="text-xs font-semibold text-green-700 dark:text-green-300 mb-1">
                  Resposta: ({question.correctAnswer.toUpperCase()})
                </p>
                <p className="text-sm leading-relaxed text-foreground/80">{renderLine(question.explanation)}</p>
              </div>

              {question.sourceExcerpt && (
                <div className="rounded-lg border-l-4 border-amber-400 bg-amber-50 dark:bg-amber-950/30 px-3 py-2.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
                    <Quote className="h-3 w-3" />
                    Trecho do Material
                  </div>
                  <p className="text-xs italic leading-relaxed text-amber-900 dark:text-amber-200">&ldquo;{renderLine(question.sourceExcerpt)}&rdquo;</p>
                </div>
              )}

              <button
                onClick={() => setExpanded((s) => !s)}
                className="flex w-full items-center gap-2 text-xs text-primary font-medium hover:underline"
              >
                <Lightbulb className="h-3.5 w-3.5" />
                {expanded ? "Ocultar teoria detalhada" : "Ver teoria detalhada"}
                {expanded ? <ChevronUp className="h-3.5 w-3.5 ml-auto" /> : <ChevronDown className="h-3.5 w-3.5 ml-auto" />}
              </button>

              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
                      {renderDeepDive(question.deepDive)}
                      <Separator />
                      <div className="flex items-start gap-2">
                        <BookOpen className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                        <p className="text-xs text-muted-foreground">{question.apostilaRef}</p>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {question.keyTerms.map((t) => (
                          <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
