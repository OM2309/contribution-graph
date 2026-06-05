"use client";

import React, { useCallback, useMemo, useRef, useState, useTransition } from "react";
import { Check, Copy, ExternalLink, GitBranch, Loader2, Search, Terminal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import {
  getCurrentStreak,
  getLongestStreak,
  getTotalContributions,
  formatDateShort,
  generateContributionData,
  type ContributionDay,
} from "@/lib/contribution-data";
import { ContributionGrid, ContributionLegend } from "./contribution-grid";
import { CustomizationPanel } from "./customization-panel";
import { CodeBlock } from "./code-block";
import { PropsTable } from "./props-table";
import type { CalendarControlsState } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Tiny helpers
// ─────────────────────────────────────────────────────────────────────────────

function SectionLabel({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <p id={id} className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
      {children}
    </p>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card className="rounded-lg border border-zinc-800 bg-zinc-900 shadow-none ring-0">
      <CardContent className="flex flex-col gap-1 p-5">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">{label}</p>
        <p className="text-3xl font-semibold tracking-tight text-zinc-50">{value}</p>
        {sub && <p className="text-xs text-zinc-500">{sub}</p>}
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Install command pill
// ─────────────────────────────────────────────────────────────────────────────
const INSTALL_CMD = "npx shadcn@latest add https://ui.shadcn.com/r/contribution-calendar";

function InstallPill() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(INSTALL_CMD);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* no-op */ }
  };

  return (
    <div className="flex w-fit max-w-full items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2">
      <Terminal className="h-3.5 w-3.5 shrink-0 text-zinc-500" aria-hidden="true" />
      <code className="truncate font-mono text-sm text-zinc-300">{INSTALL_CMD}</code>
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copy install command"
        className="ml-1 flex shrink-0 cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-xs text-zinc-500 transition-colors hover:bg-zinc-700 hover:text-zinc-100 focus:outline-none"
      >
        {copied
          ? <><Check className="h-3 w-3 text-green-400" /><span className="text-green-400">Copied</span></>
          : <><Copy className="h-3 w-3" /><span>Copy</span></>}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GitHub username input — lets users try their own username live
// ─────────────────────────────────────────────────────────────────────────────

interface GitHubInputProps {
  username: string;
  isReal: boolean;
  onLoad: (username: string, data: ContributionDay[]) => void;
}

function GitHubInput({ username, isReal, onLoad }: GitHubInputProps) {
  const [value, setValue] = useState(username);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);


  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = value.trim();
      if (!trimmed) return;
      setError("");

      startTransition(async () => {
        try {
          const res = await fetch(`/api/github?username=${encodeURIComponent(trimmed)}`);
          if (!res.ok) {
            // If API returns 404 (no token or user not found), fall back to demo data
            if (res.status === 404) {
              setError(`No data for "${trimmed}" — using demo data`);
              onLoad(trimmed, generateContributionData());
            } else {
              setError("Invalid username");
            }
            return;
          }
          const json = await res.json();
          onLoad(trimmed, json.data);
        } catch {
          setError("Failed to fetch — using demo data");
          onLoad(trimmed, generateContributionData());
        }
      });
    },
    [value, onLoad]
  );

  return (
    <div className="flex flex-col gap-1.5">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        {/* Input */}
        <div className="relative flex items-center">
          <span className="pointer-events-none absolute left-3 text-sm text-zinc-500 select-none">@</span>
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="github-username"
            aria-label="GitHub username"
            className="h-8 w-48 rounded-md border border-zinc-700 bg-zinc-800 pl-6 pr-3 font-mono text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 transition-colors"
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending || !value.trim()}
          aria-label="Load contributions"
          className="flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-800 px-3 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:bg-zinc-700 hover:text-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus-visible:ring-1 focus-visible:ring-zinc-500"
        >
          {isPending
            ? <><Loader2 className="h-3 w-3 animate-spin" />Loading…</>
            : <><Search className="h-3 w-3" />Load</>}
        </button>

        {/* Status badge */}
        {isReal
          ? <Badge variant="outline" className="border-green-800/60 bg-green-950/30 text-green-400 text-[10px]">Live data</Badge>
          : <Badge variant="outline" className="border-zinc-700 text-zinc-500 text-[10px]">Demo data</Badge>}
      </form>

      {/* Error */}
      {error && (
        <p className="text-[11px] text-amber-500/80">{error}</p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────

export interface CalendarPageProps {
  initialData: ContributionDay[];
  isRealData: boolean;
  githubUsername: string;
}

export function CalendarPage({ initialData, isRealData, githubUsername }: CalendarPageProps) {
  // ── Calendar data state (can be swapped via GitHub input) ─────────────────
  const [data, setData] = useState<ContributionDay[]>(initialData);
  const [activeUser, setActiveUser] = useState(githubUsername);
  const [isReal, setIsReal] = useState(isRealData);

  const handleGitHubLoad = useCallback((username: string, loaded: ContributionDay[]) => {
    setActiveUser(username);
    setData(loaded);
    setIsReal(true);
  }, []);

  // ── Customization controls ────────────────────────────────────────────────
  const [controls, setControls] = useState<CalendarControlsState>({
    colorScheme:     "green",
    cellShape:       "square",
    cellSize:        14,
    cellGap:         3,
    showTooltip:     true,
    showMonthLabels: true,
    showDayLabels:   true,
    weekStart:       "sun",
    animate:         false,
  });

  const handleChange = <K extends keyof CalendarControlsState>(
    key: K,
    value: CalendarControlsState[K]
  ) => setControls((prev) => ({ ...prev, [key]: value }));

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:   getTotalContributions(data),
    longest: getLongestStreak(data),
    current: getCurrentStreak(data),
    active:  data.filter((d) => d.count > 0).length,
  }), [data]);

  return (
    <div className="min-h-screen px-4 py-12 sm:px-8 lg:px-16" style={{ backgroundColor: "#09090b", color: "#fafafa" }}>
      <div className="mx-auto max-w-5xl space-y-14">

        {/* ── 1. HEADER ─────────────────────────────────────────────── */}
        <section aria-labelledby="page-title" className="space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1.5">
              <h1 id="page-title" className="text-2xl font-medium tracking-tight text-zinc-50">
                contribution-calendar
              </h1>
              <p className="text-sm text-zinc-500">
                A fully customizable GitHub-style contributions heatmap for React
              </p>
            </div>

            <a
              href={`https://github.com/${activeUser}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-md border border-zinc-700 px-3 py-1.5 text-[13px] font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:bg-zinc-800 hover:text-zinc-50 focus:outline-none focus-visible:ring-1 focus-visible:ring-zinc-500"
            >
              <GitBranch className="h-3.5 w-3.5" />
              @{activeUser}
              <ExternalLink className="h-3 w-3 opacity-40" />
            </a>
          </div>

          <InstallPill />
        </section>

        {/* ── 2. PREVIEW ────────────────────────────────────────────── */}
        <section aria-labelledby="preview-label" className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SectionLabel id="preview-label">Preview</SectionLabel>
            {/* GitHub username input */}
            <GitHubInput
              username={activeUser}
              isReal={isReal}
              onLoad={handleGitHubLoad}
            />
          </div>

          <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-900 p-5">
            <ContributionGrid
              data={data}
              colorScheme={controls.colorScheme}
              cellSize={controls.cellSize}
              cellGap={controls.cellGap}
              cellShape={controls.cellShape}
              showTooltip={controls.showTooltip}
              showMonthLabels={controls.showMonthLabels}
              showDayLabels={controls.showDayLabels}
              weekStart={controls.weekStart}
              animate={controls.animate}
            />

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-[13px] text-zinc-400">
                <span className="font-medium text-zinc-300">
                  {stats.total.toLocaleString()}
                </span>{" "}
                contributions in the last year
                {isReal && (
                  <span className="ml-2 text-zinc-600">· @{activeUser}</span>
                )}
              </p>
              <ContributionLegend colorScheme={controls.colorScheme} cellSize={11} />
            </div>
          </div>
        </section>

        {/* ── 3. STATS ──────────────────────────────────────────────── */}
        <section aria-label="Statistics" className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Total Active Days" value={stats.active.toString()} sub="+12% from last year" />
          <StatCard
            label="Longest Streak"
            value={`${stats.longest.count} days`}
            sub={
              stats.longest.start && stats.longest.end
                ? `${formatDateShort(stats.longest.start)} – ${formatDateShort(stats.longest.end)}`
                : undefined
            }
          />
          <StatCard label="Current Streak" value={`${stats.current} days`} sub="Keep it going" />
        </section>

        <Separator className="bg-zinc-800" />

        {/* ── 4. CUSTOMIZE ──────────────────────────────────────────── */}
        <section aria-labelledby="customize-label" className="space-y-3">
          <SectionLabel id="customize-label">Customize</SectionLabel>
          <CustomizationPanel controls={controls} onChange={handleChange} />
        </section>

        <Separator className="bg-zinc-800" />

        {/* ── 5. USAGE ──────────────────────────────────────────────── */}
        <section aria-labelledby="usage-label" className="space-y-3">
          <SectionLabel id="usage-label">Usage</SectionLabel>
          <CodeBlock />
        </section>

        <Separator className="bg-zinc-800" />

        {/* ── 6. PROPS ──────────────────────────────────────────────── */}
        <section aria-labelledby="props-label" className="space-y-3">
          <SectionLabel id="props-label">Props</SectionLabel>
          <PropsTable />
        </section>

      </div>
    </div>
  );
}
