"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Network,
  BookOpen,
  PlayCircle,
  Shuffle,
  Filter,
  Zap,
  Target,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { QuizCard } from "@/components/quiz-card";
import { QuizProgress } from "@/components/quiz-progress";
import { ResultsPanel } from "@/components/results-panel";
import { StudyCard } from "@/components/study-card";
import { questions, topicGroups, type QuizQuestion } from "@/lib/questions";

type Mode = "home" | "quiz" | "study" | "results";
type TopicFilter = "all" | string;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Home() {
  const [mode, setMode] = useState<Mode>("home");
  const [topicFilter, setTopicFilter] = useState<TopicFilter>("all");
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [topicScores, setTopicScores] = useState<Record<string, { correct: number; total: number }>>({});

  function startQuiz(filtered: QuizQuestion[]) {
    const q = shuffle(filtered);
    setQuizQuestions(q);
    setCurrentIdx(0);
    setCorrect(0);
    setIncorrect(0);
    const scores: Record<string, { correct: number; total: number }> = {};
    topicGroups.forEach((tg) => { scores[tg.label] = { correct: 0, total: 0 }; });
    setTopicScores(scores);
    setMode("quiz");
  }

  function handleAnswer(wasCorrect: boolean) {
    const q = quizQuestions[currentIdx];
    if (wasCorrect) setCorrect((c) => c + 1);
    else setIncorrect((c) => c + 1);
    setTopicScores((prev) => ({
      ...prev,
      [q.topic]: {
        correct: (prev[q.topic]?.correct ?? 0) + (wasCorrect ? 1 : 0),
        total: (prev[q.topic]?.total ?? 0) + 1,
      },
    }));
  }

  function handleNext() {
    if (currentIdx + 1 >= quizQuestions.length) {
      setMode("results");
    } else {
      setCurrentIdx((i) => i + 1);
    }
  }

  const filteredQs =
    topicFilter === "all"
      ? questions
      : questions.filter((q) => q.topic === topicGroups.find((tg) => tg.id === topicFilter)?.label);

  const topicScoreArr = topicGroups.map((tg) => ({
    topic: tg.label,
    correct: topicScores[tg.label]?.correct ?? 0,
    total: topicScores[tg.label]?.total ?? 0,
  }));

  if (mode === "quiz") {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <Network className="h-5 w-5 text-primary" />
              <span className="font-semibold text-sm">FRC Quiz</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setMode("home")}>
                Início
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-3xl px-4 py-6 space-y-6">
          <QuizProgress
            current={currentIdx}
            total={quizQuestions.length}
            correct={correct}
            incorrect={incorrect}
          />
          <QuizCard
            question={quizQuestions[currentIdx]}
            questionNumber={currentIdx + 1}
            total={quizQuestions.length}
            onAnswer={handleAnswer}
            onNext={handleNext}
          />
        </main>
      </div>
    );
  }

  if (mode === "results") {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <Network className="h-5 w-5 text-primary" />
              <span className="font-semibold text-sm">FRC Quiz — Resultado</span>
            </div>
            <ThemeToggle />
          </div>
        </header>
        <main className="mx-auto max-w-3xl px-4 py-8">
          <ResultsPanel
            correct={correct}
            total={quizQuestions.length}
            topicScores={topicScoreArr}
            onRestart={() => startQuiz(filteredQs)}
            onStudy={() => setMode("study")}
          />
        </main>
      </div>
    );
  }

  if (mode === "study") {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="font-semibold text-sm">Modo Estudo — FRC</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setMode("home")}>
                Início
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-3xl px-4 py-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={topicFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setTopicFilter("all")}
            >
              Todos ({questions.length})
            </Button>
            {topicGroups.map((tg) => (
              <Button
                key={tg.id}
                variant={topicFilter === tg.id ? "default" : "outline"}
                size="sm"
                onClick={() => setTopicFilter(tg.id)}
              >
                {tg.label} ({tg.count})
              </Button>
            ))}
          </div>
          <div className="space-y-4">
            {filteredQs.map((q) => (
              <StudyCard key={q.id} question={q} />
            ))}
          </div>
        </main>
      </div>
    );
  }

  // Home
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Network className="h-5 w-5 text-primary" />
            <span className="font-bold">FRC Quiz</span>
            <Badge variant="secondary" className="text-xs">UnB 2026.1</Badge>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10 space-y-10">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 rounded-full border bg-primary/5 px-4 py-1.5 text-sm text-primary">
            <Zap className="h-4 w-4" />
            Preparatório para a 1ª Prova
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Fundamentos de Redes
            <span className="block text-primary">de Computadores</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Quiz completo com <strong>{questions.length} questões</strong> baseadas nas apostilas da disciplina.
            Explicações extremamente detalhadas com referências às fontes de estudo.
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Questões", value: questions.length, icon: Target },
            { label: "Tópicos", value: topicGroups.length, icon: Filter },
            { label: "Com Diagramas", value: 6, icon: BarChart3 },
            { label: "Apostilas", value: 9, icon: BookOpen },
          ].map((s) => (
            <Card key={s.label} className="text-center">
              <CardContent className="pt-4 pb-3">
                <s.icon className="h-5 w-5 text-primary mx-auto mb-1.5" />
                <div className="text-2xl font-bold">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Topic selector */}
        <div className="space-y-4">
          <h2 className="font-semibold text-lg">Filtrar por Tópico</h2>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={topicFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setTopicFilter("all")}
            >
              Todos os tópicos ({questions.length})
            </Button>
            {topicGroups.map((tg) => (
              <Button
                key={tg.id}
                variant={topicFilter === tg.id ? "default" : "outline"}
                size="sm"
                onClick={() => setTopicFilter(tg.id)}
              >
                {tg.label} ({tg.count})
              </Button>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            {filteredQs.length} questão{filteredQs.length !== 1 ? "ões" : ""} selecionada{filteredQs.length !== 1 ? "s" : ""}
          </p>
        </div>

        <Separator />

        {/* Action cards */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Card className="border-2 hover:border-primary/50 transition-colors cursor-pointer group" onClick={() => startQuiz(filteredQs)}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2 group-hover:bg-primary/20 transition-colors">
                  <PlayCircle className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Iniciar Quiz</CardTitle>
                  <p className="text-sm text-muted-foreground">Perguntas em ordem aleatória</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Responda questões de múltipla escolha com explicações detalhadas e referências às apostilas após cada resposta.
              </p>
              <Button className="mt-4 w-full gap-2" onClick={(e) => { e.stopPropagation(); startQuiz(filteredQs); }}>
                <PlayCircle className="h-4 w-4" />
                Começar — {filteredQs.length} questões
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors cursor-pointer group" onClick={() => setMode("study")}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2 group-hover:bg-primary/20 transition-colors">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Modo Estudo</CardTitle>
                  <p className="text-sm text-muted-foreground">Revise questões e gabaritos</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Veja todas as questões com gabaritos, explicações e teoria detalhada. Ideal para revisão antes da prova.
              </p>
              <Button variant="outline" className="mt-4 w-full gap-2" onClick={(e) => { e.stopPropagation(); setMode("study"); }}>
                <BookOpen className="h-4 w-4" />
                Estudar
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Topics overview */}
        <div className="space-y-3">
          <h2 className="font-semibold text-lg">Tópicos Cobertos</h2>
          <div className="grid sm:grid-cols-2 gap-2">
            {[
              { t: "Camada Física", d: "Fourier, Nyquist, Shannon, PCM, NRZ-L, Manchester, ASK/FSK/PSK/QAM" },
              { t: "Multiplexação", d: "FDM, TDM Síncrono, TDM Estatístico, SONET/SDH, DS-1" },
              { t: "Camada de Enlace", d: "Framing, CRC, Stop-and-Wait, Go-Back-N, SR, PPP, HDLC, LLC/MAC" },
              { t: "Comutação de Circuitos", d: "Crosspoint, Clos, TST, Sinalização in-band, SS7/CCS" },
              { t: "Comutação de Pacotes", d: "Datagrama, Circuito Virtual, Dijkstra, Bellman-Ford, RIP, OSPF" },
              { t: "Endereçamento IP", d: "CIDR, VLSM, NAT (SNAT/DNAT), ARP, Sub-redes, Rota Padrão" },
              { t: "Ethernet e Wi-Fi", d: "CSMA/CD, CSMA/CA, 802.11, RTS/CTS, Switches vs Hubs, VLANs" },
            ].map((item) => (
              <div key={item.t} className="rounded-lg border bg-card p-3 flex gap-2">
                <Zap className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{item.t}</p>
                  <p className="text-xs text-muted-foreground">{item.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <footer className="text-center text-xs text-muted-foreground pb-4">
          FRC 2026.1 — UnB · Baseado nas apostilas AP_TXDADOS, AP_CODICDADOS, AP_MULTIPLEX, AP_CCIRCUITOS, AP_CPACOTES e listas de exercícios
        </footer>
      </main>
    </div>
  );
}
