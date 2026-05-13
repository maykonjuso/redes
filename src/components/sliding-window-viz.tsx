"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type FrameStatus = "sent" | "acked" | "error" | "unsent" | "retransmit";

interface Frame {
  id: number;
  status: FrameStatus;
}

const STATUS_COLORS: Record<FrameStatus, string> = {
  sent: "bg-blue-500 text-white",
  acked: "bg-green-500 text-white",
  error: "bg-red-500 text-white",
  unsent: "bg-muted text-muted-foreground",
  retransmit: "bg-orange-500 text-white",
};

const STATUS_LABELS: Record<FrameStatus, string> = {
  sent: "Enviado",
  acked: "ACK",
  error: "ERRO",
  unsent: "Aguardando",
  retransmit: "Retransmitir",
};

const GBN_STEPS: Array<{ frames: FrameStatus[]; label: string; window: number[] }> = [
  {
    frames: ["sent", "sent", "sent", "sent", "unsent", "unsent", "unsent"],
    label: "Transmissor enviou frames 0,1,2,3 (janela W=4)",
    window: [0, 1, 2, 3],
  },
  {
    frames: ["acked", "acked", "error", "sent", "sent", "unsent", "unsent"],
    label: "ACK 0 e 1 recebidos. Frame 2 perdido. Frame 3,4 enviados",
    window: [2, 3, 4, 5],
  },
  {
    frames: ["acked", "acked", "retransmit", "retransmit", "retransmit", "unsent", "unsent"],
    label: "Timeout → Go-Back-N: retransmite frames 2,3,4 (do erro em diante)",
    window: [2, 3, 4, 5],
  },
  {
    frames: ["acked", "acked", "acked", "acked", "acked", "sent", "sent"],
    label: "Frames 2,3,4 ACKed. Janela avança para 5,6",
    window: [5, 6, 7, 0],
  },
];

export function SlidingWindowViz() {
  const [step, setStep] = useState(0);
  const current = GBN_STEPS[step];

  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm">Go-Back-N — Animação Interativa</h4>
        <Badge variant="outline">Janela W=4, 3 bits de seq (0-7)</Badge>
      </div>

      <div className="flex gap-2 justify-center flex-wrap">
        {current.frames.map((status, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div
              className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-sm transition-all duration-300 ${STATUS_COLORS[status]}`}
            >
              {i}
            </div>
            <span className="text-[10px] text-muted-foreground">{STATUS_LABELS[status]}</span>
          </div>
        ))}
      </div>

      <div className="rounded-md bg-muted/50 p-3 text-sm text-center font-medium">
        {current.label}
      </div>

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Janela: [{current.window.join(", ")}]</span>
        <span>Passo {step + 1} de {GBN_STEPS.length}</span>
      </div>

      <div className="flex gap-2 justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
        >
          ← Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setStep((s) => Math.min(GBN_STEPS.length - 1, s + 1))}
          disabled={step === GBN_STEPS.length - 1}
        >
          Próximo →
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setStep(0)}>
          Reiniciar
        </Button>
      </div>
    </div>
  );
}
