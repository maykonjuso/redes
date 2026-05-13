"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

const inlineComponents: Components = {
  p: ({ children }) => <>{children}</>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  code: ({ children }) => <code className="font-mono bg-muted px-1 rounded text-xs">{children}</code>,
  ul: ({ children }) => <ul className="list-disc pl-4 space-y-0.5 my-1">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-4 space-y-0.5 my-1">{children}</ol>,
  li: ({ children }) => <li>{children}</li>,
  table: ({ children }) => <table className="w-full text-xs border-collapse my-2">{children}</table>,
  th: ({ children }) => <th className="border border-border px-2 py-1 bg-muted/60 text-left font-semibold">{children}</th>,
  td: ({ children }) => <td className="border border-border px-2 py-1">{children}</td>,
};

const blockComponents: Components = {
  p: ({ children }) => <p className="text-sm leading-relaxed mb-2 last:mb-0">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  code: ({ children }) => <code className="font-mono bg-muted px-1 rounded text-xs">{children}</code>,
  ul: ({ children }) => <ul className="list-disc pl-4 space-y-0.5 my-1">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-4 space-y-0.5 my-1">{children}</ol>,
  li: ({ children }) => <li className="text-sm leading-relaxed">{children}</li>,
  table: ({ children }) => <table className="w-full text-xs border-collapse my-2">{children}</table>,
  thead: ({ children }) => <thead>{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => <tr className="even:bg-muted/20">{children}</tr>,
  th: ({ children }) => <th className="border border-border px-2 py-1 bg-muted/60 text-left font-semibold">{children}</th>,
  td: ({ children }) => <td className="border border-border px-2 py-1">{children}</td>,
};

interface MDProps {
  children: string;
  block?: boolean;
}

export function MD({ children, block }: MDProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={block ? blockComponents : inlineComponents}
    >
      {children}
    </ReactMarkdown>
  );
}
