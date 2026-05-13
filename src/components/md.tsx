"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import type { Components } from "react-markdown";

/**
 * Auto-convert common math patterns to KaTeX delimiters before markdown parsing.
 *
 * Handles:
 *   word^(expr)   →  $word^{expr}$     e.g. N^(3/2) → $N^{3/2}$
 *   word^n        →  $word^{n}$        e.g. 2^n → $2^n$  (single-char exponent)
 *
 * Deliberately conservative to avoid false positives in prose.
 */
function preprocessMath(text: string): string {
  // X^(multi-char expr): N^(3/2), 2^(n-1), 2^(32−n), 10^(30/10) etc.
  let out = text.replace(/([\w]+)\^\(([^)\n]+)\)/g, (_m, base, exp) => `$${base}^{${exp}}$`);
  // X^Y — single letter or digit exponent not already inside $...$ or followed by more word chars
  out = out.replace(/(?<!\$)([\w]+)\^([A-Za-z0-9])(?![\w${}])/g, (_m, base, exp) => `$${base}^{${exp}}$`);
  return out;
}

const sharedComponents: Components = {
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  code: ({ children }) => <code className="font-mono bg-muted px-1 rounded text-xs">{children}</code>,
  table: ({ children }) => <table className="w-full text-xs border-collapse my-2">{children}</table>,
  thead: ({ children }) => <thead>{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => <tr className="even:bg-muted/20">{children}</tr>,
  th: ({ children }) => <th className="border border-border px-2 py-1 bg-muted/60 text-left font-semibold">{children}</th>,
  td: ({ children }) => <td className="border border-border px-2 py-1">{children}</td>,
  ul: ({ children }) => <ul className="list-disc pl-4 space-y-0.5 my-1">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-4 space-y-0.5 my-1">{children}</ol>,
  li: ({ children }) => <li className="text-sm leading-relaxed">{children}</li>,
};

const inlineComponents: Components = {
  ...sharedComponents,
  p: ({ children }) => <>{children}</>,
};

const blockComponents: Components = {
  ...sharedComponents,
  p: ({ children }) => <p className="text-sm leading-relaxed mb-2 last:mb-0">{children}</p>,
};

interface MDProps {
  children: string;
  block?: boolean;
}

export function MD({ children, block }: MDProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[[rehypeKatex, { output: "html" }]]}
      components={block ? blockComponents : inlineComponents}
    >
      {preprocessMath(children)}
    </ReactMarkdown>
  );
}
