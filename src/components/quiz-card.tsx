"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, BookOpen, ChevronDown, ChevronUp, Lightbulb, AlertCircle, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SignalDiagram } from "@/components/signal-diagram";
import { SlidingWindowViz } from "@/components/sliding-window-viz";
import { MD } from "@/components/md";
import type { QuizQuestion } from "@/lib/questions";

const DIFFICULTY_COLORS = {
  easy: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  hard: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const DIFFICULTY_LABELS = { easy: "Fácil", medium: "Médio", hard: "Difícil" };

function getDiagram(id: string) {
  if (id === "cf-01" || id === "cf-02") return <SignalDiagram type="fourier" title="Aproximação de Fourier — mais harmônicas = mais fiel ao sinal quadrado" />;
  if (id === "cf-03") return (
    <div className="space-y-2">
      <SignalDiagram type="nrzl" title="NRZ-L: sem transição no meio do período" height={150} />
      <SignalDiagram type="manchester" title="Manchester: transição obrigatória no meio de cada bit" height={150} />
    </div>
  );
  if (id === "cf-04") return <SignalDiagram type="ask" title="ASK — variação de amplitude para codificar bits" />;
  if (id === "ce-03") return <SlidingWindowViz />;
  return null;
}

interface QuizCardProps {
  question: QuizQuestion;
  questionNumber: number;
  total: number;
  onAnswer: (correct: boolean) => void;
  onNext: () => void;
}

export function QuizCard({ question, questionNumber, total, onAnswer, onNext }: QuizCardProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showDeepDive, setShowDeepDive] = useState(false);
  const answered = selected !== null;
  const isCorrect = selected === question.correctAnswer;
  const diagram = getDiagram(question.id);

  function handleSelect(id: string) {
    if (answered) return;
    setSelected(id);
    setShowExplanation(true);
    onAnswer(id === question.correctAnswer);
  }

  function handleNext() {
    setSelected(null);
    setShowExplanation(false);
    setShowDeepDive(false);
    onNext();
  }

  return (
    <Card className="w-full shadow-lg border-2">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge variant="outline" className="text-xs">
            {questionNumber}/{total}
          </Badge>
          <Badge className={`text-xs ${DIFFICULTY_COLORS[question.difficulty]}`}>
            {DIFFICULTY_LABELS[question.difficulty]}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {question.topic}
          </Badge>
          <Badge variant="outline" className="text-xs text-muted-foreground">
            {question.subtopic}
          </Badge>
        </div>
        <h2 className="text-base font-semibold leading-relaxed">
          <MD>{question.question}</MD>
        </h2>
      </CardHeader>

      <CardContent className="space-y-3">
        {diagram && <div className="mb-4">{diagram}</div>}

        <div className="space-y-2">
          {question.options.map((opt) => {
            let extra = "";
            if (answered) {
              if (opt.id === question.correctAnswer) {
                extra = "border-green-500 bg-green-50 dark:bg-green-950/30 text-green-800 dark:text-green-300";
              } else if (opt.id === selected && !isCorrect) {
                extra = "border-red-500 bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300";
              }
            }
            return (
              <motion.button
                key={opt.id}
                whileHover={!answered ? { scale: 1.01 } : {}}
                whileTap={!answered ? { scale: 0.99 } : {}}
                onClick={() => handleSelect(opt.id)}
                disabled={answered}
                className={`w-full text-left rounded-lg border px-4 py-3 text-sm transition-all duration-200 flex items-start gap-3
                  ${extra || "hover:bg-accent hover:border-primary/50"}
                  ${answered ? "cursor-default" : "cursor-pointer"}
                `}
              >
                <span className="font-bold uppercase text-muted-foreground w-4 shrink-0">{opt.id})</span>
                <span><MD>{opt.text}</MD></span>
                {answered && opt.id === question.correctAnswer && (
                  <CheckCircle2 className="ml-auto shrink-0 text-green-500 h-5 w-5" />
                )}
                {answered && opt.id === selected && !isCorrect && (
                  <XCircle className="ml-auto shrink-0 text-red-500 h-5 w-5" />
                )}
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence>
          {showExplanation && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-3 mt-2"
            >
              <Separator />

              <div
                className={`rounded-lg p-4 flex gap-3 ${
                  isCorrect
                    ? "bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800"
                    : "bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800"
                }`}
              >
                {isCorrect ? (
                  <CheckCircle2 className="shrink-0 text-green-500 h-5 w-5 mt-0.5" />
                ) : (
                  <AlertCircle className="shrink-0 text-amber-500 h-5 w-5 mt-0.5" />
                )}
                <div className="text-sm leading-relaxed text-foreground/80">
                  <p className="font-semibold text-sm mb-1">
                    {isCorrect ? "Correto! " : `Incorreto — A resposta correta é (${question.correctAnswer.toUpperCase()})`}
                  </p>
                  <MD>{question.explanation}</MD>
                </div>
              </div>

              {question.sourceExcerpt && (
                <div className="rounded-lg border-l-4 border-amber-400 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
                    <Quote className="h-3.5 w-3.5" />
                    Trecho do Material do Professor
                  </div>
                  <p className="text-sm italic leading-relaxed text-amber-900 dark:text-amber-200">
                    &ldquo;<MD>{question.sourceExcerpt}</MD>&rdquo;
                  </p>
                  <p className="text-[10px] text-amber-600 dark:text-amber-500">{question.apostilaRef}</p>
                </div>
              )}

              <button
                onClick={() => setShowDeepDive((s) => !s)}
                className="flex w-full items-center gap-2 rounded-lg border border-dashed border-primary/40 bg-primary/5 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
              >
                <Lightbulb className="h-4 w-4" />
                Mergulho Profundo — Teoria Detalhada
                {showDeepDive ? <ChevronUp className="ml-auto h-4 w-4" /> : <ChevronDown className="ml-auto h-4 w-4" />}
              </button>

              <AnimatePresence>
                {showDeepDive && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                      <MD block>{question.deepDive}</MD>
                      <Separator />
                      <div className="flex items-start gap-2">
                        <BookOpen className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-0.5">Referência nas Apostilas</p>
                          <p className="text-xs text-foreground/70">{question.apostilaRef}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {question.keyTerms.map((t) => (
                          <Badge key={t} variant="secondary" className="text-[10px]">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-end pt-1">
                <Button onClick={handleNext} size="sm">
                  Próxima Questão →
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
