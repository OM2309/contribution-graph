"use client";

import React, { useCallback, useMemo, useState } from "react";
import { ExternalLink, GitBranch, Star } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import {
  getCurrentStreak,
  getLongestStreak,
  getTotalContributions,
  formatDateShort,
  type ContributionDay,
} from "@/lib/contribution-data";
import { GitHubCalendar, ContributionLegend } from "@/components/ui/github-calendar";
import { CustomizationPanel } from "./customization-panel";
import { CodeBlock } from "./code-block";
import { PropsTable } from "./props-table";
import type { CalendarControlsState } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Tiny helpers
// ─────────────────────────────────────────────────────────────────────────────

function extractGitHubUsername(input: string): string {
  try {
    const trimmed = input.trim();
    const urlPattern = /(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9-]{1,38})/i;
    const match = trimmed.match(urlPattern);
    if (match && match[1]) {
      return match[1];
    }
    return trimmed;
  } catch {
    return input;
  }
}

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
const INSTALL_CMD = "npx shadcn@latest add http://localhost:3000/r/github-calendar.json";

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
      <code className="truncate font-mono text-sm text-zinc-300">{INSTALL_CMD}</code>
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copy install command"
        className="ml-1 flex shrink-0 cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-xs text-zinc-500 transition-colors hover:bg-zinc-700 hover:text-zinc-100 focus:outline-none"
      >
        {copied ? <span className="text-green-400">Copied</span> : <span>Copy</span>}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GitHub username input
// ─────────────────────────────────────────────────────────────────────────────

interface GitHubInputProps {
  username: string;
  onSearch: (username: string) => void;
}

function GitHubInput({ username, onSearch }: GitHubInputProps) {
  const [value, setValue] = useState(username);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = value.trim();
      if (!trimmed) return;
      const parsedUsername = extractGitHubUsername(trimmed);
      setValue(parsedUsername);
      onSearch(parsedUsername);
    },
    [value, onSearch]
  );

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <div className="relative flex items-center">
        <span className="pointer-events-none absolute left-3 text-sm text-zinc-500 select-none">@</span>
        <input
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

      <button
        type="submit"
        disabled={!value.trim()}
        className="flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-800 px-3 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:bg-zinc-700 hover:text-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus-visible:ring-1 focus-visible:ring-zinc-500"
      >
        Load
      </button>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────

export interface CalendarPageProps {
  initialData: ContributionDay[];
  githubUsername: string;
}

export function CalendarPage({ initialData, githubUsername }: CalendarPageProps) {
  const parsedInitialUsername = useMemo(() => extractGitHubUsername(githubUsername), [githubUsername]);
  const sortedInitialData = useMemo(() => {
    return [...initialData].sort((a, b) => a.date.localeCompare(b.date));
  }, [initialData]);

  const [data, setData] = useState<ContributionDay[]>(sortedInitialData);
  const [activeUser, setActiveUser] = useState(parsedInitialUsername);

  const handleGitHubLoad = useCallback((username: string) => {
    setActiveUser(username);
  }, []);

  // ── Customization controls ────────────────────────────────────────────────
  const [controls, setControls] = useState<CalendarControlsState>({
    colorScheme: "green",
    cellShape: "square",
    cellSize: 14,
    cellGap: 3,
    showTooltip: true,
    showMonthLabels: true,
    showDayLabels: true,
    weekStart: "sun",
    animate: false,
    timeRange: "1-year",
  });

  const handleChange = <K extends keyof CalendarControlsState>(
    key: K,
    value: CalendarControlsState[K]
  ) => setControls((prev) => ({ ...prev, [key]: value }));

  // ── Filter data based on timeRange for stats display ──────────────────────
  const filteredData = useMemo(() => {
    if (!data || !data.length) return [];
    const latestDate = new Date();
    const thresholdDate = new Date(latestDate);
    if (controls.timeRange === "3-months") {
      thresholdDate.setMonth(thresholdDate.getMonth() - 3);
    } else if (controls.timeRange === "6-months") {
      thresholdDate.setMonth(thresholdDate.getMonth() - 6);
    } else {
      thresholdDate.setFullYear(thresholdDate.getFullYear() - 1);
    }
    const thresholdStr = thresholdDate.toISOString().split("T")[0];
    return data.filter((day) => day.date >= thresholdStr);
  }, [data, controls.timeRange]);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(
    () => ({
      total: getTotalContributions(filteredData),
      longest: getLongestStreak(filteredData),
      current: getCurrentStreak(filteredData),
      active: filteredData.filter((d) => d.count > 0).length,
    }),
    [filteredData]
  );

  return (
    <div className="min-h-screen px-4 py-12 sm:px-8 lg:px-16" style={{ backgroundColor: "#09090b", color: "#fafafa" }}>
      <div className="mx-auto max-w-5xl space-y-14">
        {/* ── 1. HEADER ─────────────────────────────────────────────── */}
        <section aria-labelledby="page-title" className="space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1.5">
              <h1 id="page-title" className="text-2xl font-medium tracking-tight text-zinc-50">
                github-calendar
              </h1>
              <p className="text-sm text-zinc-500">A fully customizable GitHub-style contributions heatmap for React</p>
            </div>

            <div className="flex items-center gap-2">
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

              <a
                href="https://github.com/OM2309/contribution-graph"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-md border border-yellow-600/40 bg-yellow-950/20 px-3 py-1.5 text-[13px] font-medium text-yellow-500 transition-colors hover:border-yellow-500 hover:bg-yellow-950/40 focus:outline-none focus-visible:ring-1 focus-visible:ring-yellow-500"
              >
                <Star className="h-3.5 w-3.5 fill-yellow-500" />
                Star on GitHub
                <ExternalLink className="h-3 w-3 opacity-40" />
              </a>
            </div>
          </div>

          <InstallPill />
        </section>

        {/* ── 2. PREVIEW ────────────────────────────────────────────── */}
        <section aria-labelledby="preview-label" className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SectionLabel id="preview-label">Preview</SectionLabel>
            <GitHubInput username={activeUser} onSearch={handleGitHubLoad} />
          </div>

          <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-900 p-5">
            <GitHubCalendar
              username={activeUser}
              colorScheme={controls.colorScheme}
              cellSize={controls.cellSize}
              cellGap={controls.cellGap}
              cellShape={controls.cellShape}
              showTooltip={controls.showTooltip}
              showMonthLabels={controls.showMonthLabels}
              showDayLabels={controls.showDayLabels}
              weekStart={controls.weekStart}
              animate={controls.animate}
              timeRange={controls.timeRange}
              onDataLoaded={setData}
            />

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-[13px] text-zinc-400">
                <span className="font-medium text-zinc-300">{stats.total.toLocaleString()}</span> contributions in the{" "}
                {controls.timeRange === "1-year"
                  ? "last year"
                  : controls.timeRange === "6-months"
                  ? "last 6 months"
                  : "last 3 months"}
                <span className="ml-2 text-zinc-600">· @{activeUser}</span>
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
          <SectionLabel id="usage-label">Usage Instructions</SectionLabel>
          <CodeBlock />
        </section>

        <Separator className="bg-zinc-800" />

        {/* ── 6. PROPS REFERENCE ────────────────────────────────────── */}
        <section aria-labelledby="props-label" className="space-y-3">
          <SectionLabel id="props-label">Props API Reference</SectionLabel>
          <PropsTable />
        </section>
      </div>
    </div>
  );
}
