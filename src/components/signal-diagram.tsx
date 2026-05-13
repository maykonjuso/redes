"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

function generateSineWave(freq: number, amplitude: number, points = 200, cycles = 3) {
  return Array.from({ length: points }, (_, i) => ({
    t: i / points,
    y: amplitude * Math.sin(2 * Math.PI * freq * cycles * (i / points)),
  }));
}

function generateManchester(bits: number[], points = 8) {
  const data: { t: number; y: number }[] = [];
  bits.forEach((bit, bi) => {
    for (let p = 0; p < points; p++) {
      const half = p < points / 2;
      // Manchester: 0 = low→high transition, 1 = high→low
      const y = bit === 0 ? (half ? -1 : 1) : (half ? 1 : -1);
      data.push({ t: bi + p / points, y });
    }
  });
  return data;
}

function generateNRZL(bits: number[], points = 8) {
  const data: { t: number; y: number }[] = [];
  bits.forEach((bit, bi) => {
    for (let p = 0; p < points; p++) {
      data.push({ t: bi + p / points, y: bit === 0 ? -1 : 1 });
    }
  });
  return data;
}

function generateASK(bits: number[], points = 16) {
  const data: { t: number; y: number }[] = [];
  bits.forEach((bit, bi) => {
    for (let p = 0; p < points; p++) {
      const t = bi + p / points;
      const amp = bit === 1 ? 1 : 0.15;
      data.push({ t, y: amp * Math.sin(2 * Math.PI * 4 * (p / points)) });
    }
  });
  return data;
}

type DiagramType = "sine" | "manchester" | "nrzl" | "ask" | "fourier";

interface SignalDiagramProps {
  type: DiagramType;
  title?: string;
  height?: number;
}

const BITS = [1, 0, 1, 1, 0];

export function SignalDiagram({ type, title, height = 200 }: SignalDiagramProps) {
  let chartData: { t: number; y: number; y2?: number; y3?: number }[] = [];
  let lines: { key: string; color: string; label: string }[] = [];

  if (type === "sine") {
    const base = generateSineWave(1, 1);
    const h3 = generateSineWave(3, 1 / 3);
    const h5 = generateSineWave(5, 1 / 5);
    chartData = base.map((p, i) => ({
      t: p.t,
      y: p.y,
      y2: h3[i].y,
      y3: h3[i].y + h5[i].y + p.y,
    }));
    lines = [
      { key: "y", color: "#6366f1", label: "f (fundamental)" },
      { key: "y2", color: "#f59e0b", label: "3f (3ª harmônica)" },
      { key: "y3", color: "#10b981", label: "Soma f+3f+5f" },
    ];
  } else if (type === "manchester") {
    chartData = generateManchester(BITS);
    lines = [{ key: "y", color: "#6366f1", label: "Manchester" }];
  } else if (type === "nrzl") {
    chartData = generateNRZL(BITS);
    lines = [{ key: "y", color: "#f59e0b", label: "NRZ-L" }];
  } else if (type === "ask") {
    chartData = generateASK(BITS);
    lines = [{ key: "y", color: "#6366f1", label: "ASK" }];
  } else if (type === "fourier") {
    const f1 = generateSineWave(1, 4 / Math.PI);
    const f3 = generateSineWave(3, 4 / (3 * Math.PI));
    const f5 = generateSineWave(5, 4 / (5 * Math.PI));
    chartData = f1.map((p, i) => ({
      t: p.t,
      y: p.y,
      y2: f1[i].y + f3[i].y,
      y3: f1[i].y + f3[i].y + f5[i].y,
    }));
    lines = [
      { key: "y", color: "#6366f1", label: "1 harmônica" },
      { key: "y2", color: "#f59e0b", label: "3 harmônicas" },
      { key: "y3", color: "#10b981", label: "5 harmônicas" },
    ];
  }

  return (
    <div className="w-full rounded-lg border bg-card p-4">
      {title && <p className="mb-2 text-sm font-semibold text-muted-foreground">{title}</p>}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
          <XAxis dataKey="t" tick={false} />
          <YAxis domain={[-1.5, 1.5]} tick={{ fontSize: 10 }} />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "6px",
              fontSize: "11px",
            }}
            formatter={(v) => (typeof v === "number" ? v.toFixed(2) : v)}
          />
          <Legend wrapperStyle={{ fontSize: "11px" }} />
          <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeOpacity={0.4} />
          {lines.map((l) => (
            <Line
              key={l.key}
              type="monotone"
              dataKey={l.key}
              stroke={l.color}
              dot={false}
              strokeWidth={2}
              name={l.label}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
