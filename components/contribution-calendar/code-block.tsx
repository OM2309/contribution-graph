"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

// ── VSCode Dark+ palette ──────────────────────────────────────────────────────
const C = {
  keyword:    "#c678dd", // purple  — import / export / return / const …
  string:     "#98c379", // green   — string literals
  tag:        "#e06c75", // red     — JSX component tags
  htmlTag:    "#e06c75", // red     — lowercase html tags
  attr:       "#61afef", // blue    — JSX props / attributes
  value:      "#d19a66", // orange  — numbers & booleans
  comment:    "#5c6370", // grey
  text:       "#abb2bf", // default
  punct:      "#c8ccd4", // braces / punctuation
};

interface Token { text: string; color: string }

function tokenise(line: string): Token[] {
  const tokens: Token[] = [];
  let rest = line;
  const push = (text: string, color: string) => tokens.push({ text, color });

  while (rest.length) {
    // Comment
    const comment = rest.match(/^(\/\/.*)/);
    if (comment) { push(comment[1], C.comment); break; }

    // String (single or double-quoted)
    const str = rest.match(/^(['"])((?:\\.|(?!\1)[^\\])*)\1/);
    if (str) { push(str[0], C.string); rest = rest.slice(str[0].length); continue; }

    // JSX closing tag </Component>
    const closeTag = rest.match(/^(<\/[A-Za-z][A-Za-z0-9.]*>)/);
    if (closeTag) { push(closeTag[1], C.tag); rest = rest.slice(closeTag[1].length); continue; }

    // Self-close />
    const sc = rest.match(/^(\/?>)/);
    if (sc) { push(sc[1], C.punct); rest = rest.slice(sc[1].length); continue; }

    // JSX opening tag <ComponentName
    const openComp = rest.match(/^(<[A-Z][A-Za-z0-9.]*)/);
    if (openComp) { push(openComp[1], C.tag); rest = rest.slice(openComp[1].length); continue; }

    // HTML opening tag <div <span etc.
    const openHtml = rest.match(/^(<[a-z][a-z0-9]*)/);
    if (openHtml) { push(openHtml[1], C.htmlTag); rest = rest.slice(openHtml[1].length); continue; }

    // JSX prop={...} curly
    const prop = rest.match(/^([a-zA-Z][a-zA-Z0-9]*)(?=={)/);
    if (prop) { push(prop[1], C.attr); rest = rest.slice(prop[1].length); continue; }

    // JSX boolean prop (no =)
    const boolProp = rest.match(/^([a-zA-Z][a-zA-Z0-9]*)(?=\s|\/?>|\n)/);
    if (boolProp && !/^(import|export|default|from|return|const|let|function|async|await|type|interface|true|false|null)$/.test(boolProp[1])) {
      push(boolProp[1], C.attr); rest = rest.slice(boolProp[1].length); continue;
    }

    // Keywords
    const kw = rest.match(/^\b(import|export|default|from|return|const|let|var|function|async|await|type|interface)\b/);
    if (kw) { push(kw[0], C.keyword); rest = rest.slice(kw[0].length); continue; }

    // Booleans / null
    const bool = rest.match(/^\b(true|false|null|undefined)\b/);
    if (bool) { push(bool[0], C.value); rest = rest.slice(bool[0].length); continue; }

    // Numbers
    const num = rest.match(/^\b(\d+)\b/);
    if (num) { push(num[1], C.value); rest = rest.slice(num[1].length); continue; }

    // Angle brackets
    const angle = rest.match(/^([<>])/);
    if (angle) { push(angle[1], C.punct); rest = rest.slice(1); continue; }

    // Punctuation
    const punct = rest.match(/^([{}()[\],;:])/);
    if (punct) { push(punct[1], C.punct); rest = rest.slice(1); continue; }

    // Fallback
    push(rest[0], C.text);
    rest = rest.slice(1);
  }
  return tokens;
}

// ── Default snippet ───────────────────────────────────────────────────────────
const DEFAULT_CODE = `// Install via shadcn registry
// npx shadcn@latest add https://ui.shadcn.com/r/contribution-calendar

import { ContributionCalendar } from "@/components/ui/contribution-calendar"

// Option A — pass your own data
const data = [
  { date: "2025-01-01", count: 4 },
  { date: "2025-01-02", count: 7 },
  // ... 365 days
]

// Option B — pass a GitHub username (fetches automatically)
export default function App() {
  return (
    <ContributionCalendar
      githubUsername="om2309"
      colorScheme="green"
      cellSize={14}
      cellShape="square"
      showTooltip
      showMonthLabels
      showDayLabels
    />
  )
}`;

// ── Component ─────────────────────────────────────────────────────────────────
export function CodeBlock({
  code = DEFAULT_CODE,
  className,
}: {
  code?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard unavailable */ }
  };

  const lines = code.split("\n").map((l) => tokenise(l));

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-lg border border-zinc-800 bg-[#0c0c0e]",
        className
      )}
    >
      {/* Copy button */}
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copy code"
        className="absolute right-3 top-3 flex cursor-pointer items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-zinc-400 opacity-0 transition-opacity group-hover:opacity-100 hover:border-zinc-500 hover:text-zinc-200 focus:outline-none focus:opacity-100"
      >
        {copied ? (
          <>
            <Check className="h-3 w-3 text-green-400" />
            <span className="text-green-400">Copied</span>
          </>
        ) : (
          <>
            <Copy className="h-3 w-3" />
            Copy
          </>
        )}
      </button>

      <pre className="overflow-x-auto p-5 text-[13px] leading-[1.7]" aria-label="Code example">
        <code>
          {lines.map((line, i) => (
            <div key={i} className="flex min-h-lh">
              {/* Line number */}
              <span
                className="mr-5 w-5 shrink-0 select-none text-right text-zinc-600"
                aria-hidden="true"
              >
                {i + 1}
              </span>
              {/* Tokens */}
              <span>
                {line.length === 0
                  ? "\u00a0"
                  : line.map((t, j) => (
                      <span key={j} style={{ color: t.color, fontFamily: "var(--font-mono)" }}>
                        {t.text}
                      </span>
                    ))}
              </span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}
