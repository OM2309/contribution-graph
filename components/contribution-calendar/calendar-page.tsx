"use client";

import React, { useCallback, useMemo, useRef, useState, useTransition } from "react";
import { Check, Copy, ExternalLink, GitBranch, Loader2, Search, Terminal, Star } from "lucide-react";
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

      const parsedUsername = extractGitHubUsername(trimmed);
      setValue(parsedUsername);
      setError("");

      startTransition(async () => {
        try {
          const res = await fetch(`/api/github?username=${encodeURIComponent(parsedUsername)}`);
          if (!res.ok) {
            // If API returns 404 (no token or user not found), fall back to demo data
            if (res.status === 404) {
              setError(`No data for "${parsedUsername}" — using demo data`);
              onLoad(parsedUsername, generateContributionData());
            } else {
              setError("Invalid username");
            }
            return;
          }
          const json = await res.json();
          onLoad(parsedUsername, json.data);
        } catch {
          setError("Failed to fetch — using demo data");
          onLoad(parsedUsername, generateContributionData());
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
// Analytics panel & Embed generator helper components
// ─────────────────────────────────────────────────────────────────────────────

interface AnalyticsItem {
  name: string;
  count: number;
  percentOfMax: number;
  percentage: number;
}

const AnalyticsPanel = React.memo(function AnalyticsPanel({
  dayOfWeekStats,
  monthlyStats,
}: {
  dayOfWeekStats: AnalyticsItem[];
  monthlyStats: AnalyticsItem[];
}) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      {/* Day of Week */}
      <Card className="rounded-lg border border-zinc-800 bg-zinc-900 shadow-none ring-0">
        <CardContent className="flex flex-col gap-4 p-5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
            Activity by Day of Week
          </p>
          <div className="space-y-2.5">
            {dayOfWeekStats.map((item) => (
              <div key={item.name} className="flex items-center gap-3 text-xs">
                <span className="w-8 shrink-0 text-zinc-400">{item.name}</span>
                <div className="h-2.5 flex-1 rounded bg-zinc-950 overflow-hidden">
                  <div
                    className="h-full rounded bg-blue-500 transition-all duration-300"
                    style={{ width: `${item.percentOfMax}%` }}
                  />
                </div>
                <span className="w-16 shrink-0 text-right font-mono text-[11px] text-zinc-300">
                  {item.count} ({item.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly */}
      <Card className="rounded-lg border border-zinc-800 bg-zinc-900 shadow-none ring-0">
        <CardContent className="flex flex-col gap-4 p-5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
            Activity by Month
          </p>
          {monthlyStats.length === 0 ? (
            <div className="flex items-center justify-center py-10 text-xs text-zinc-500">
              No contribution activity recorded
            </div>
          ) : (
            <div className="space-y-2.5">
              {monthlyStats.map((item) => (
                <div key={item.name} className="flex items-center gap-3 text-xs">
                  <span className="w-8 shrink-0 text-zinc-400">{item.name}</span>
                  <div className="h-2.5 flex-1 rounded bg-zinc-950 overflow-hidden">
                    <div
                      className="h-full rounded bg-emerald-500 transition-all duration-300"
                      style={{ width: `${item.percentOfMax}%` }}
                    />
                  </div>
                  <span className="w-16 shrink-0 text-right font-mono text-[11px] text-zinc-300">
                    {item.count} ({item.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

const EmbedGenerator = React.memo(function EmbedGenerator({ username }: { username: string }) {
  const [copied, setCopied] = useState(false);
  const embedCode = `[![GitHub Contributions](https://github-readme-streak-stats.herokuapp.com/?user=${username}&theme=dracula)](https://github.com/OM2309/contribution-graph)`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <Card className="rounded-lg border border-zinc-800 bg-zinc-900 shadow-none ring-0">
      <CardContent className="flex flex-col gap-3 p-5">
        <p className="text-xs text-zinc-400">
          Copy this markdown snippet to showcase your contributions and streak directly on your GitHub Profile README.
        </p>
        <div className="flex items-center gap-2 rounded border border-zinc-800 bg-zinc-950 p-2.5">
          <code className="flex-1 truncate font-mono text-[11px] text-zinc-300">
            {embedCode}
          </code>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 shrink-0 rounded bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-200 hover:bg-zinc-700 transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-green-400" />
                <span className="text-green-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>
      </CardContent>
    </Card>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────

export interface CalendarPageProps {
  initialData: ContributionDay[];
  isRealData: boolean;
  githubUsername: string;
}

export function CalendarPage({ initialData, isRealData, githubUsername }: CalendarPageProps) {
  // Parse username in case the prop itself is a URL
  const parsedInitialUsername = useMemo(() => extractGitHubUsername(githubUsername), [githubUsername]);

  const sortedInitialData = useMemo(() => {
    return [...initialData].sort((a, b) => a.date.localeCompare(b.date));
  }, [initialData]);

  // ── Calendar data state (can be swapped via GitHub input) ─────────────────
  const [data, setData] = useState<ContributionDay[]>(sortedInitialData);
  const [originalData, setOriginalData] = useState<ContributionDay[]>(sortedInitialData);
  const [activeUser, setActiveUser] = useState(parsedInitialUsername);
  const [isReal, setIsReal] = useState(isRealData);

  const handleGitHubLoad = useCallback((username: string, loaded: ContributionDay[]) => {
    const parsed = extractGitHubUsername(username);
    const sorted = [...loaded].sort((a, b) => a.date.localeCompare(b.date));
    setActiveUser(parsed);
    setData(sorted);
    setOriginalData(sorted);
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
    timeRange:       "1-year",
    paintMode:       false,
  });

  const handleChange = <K extends keyof CalendarControlsState>(
    key: K,
    value: CalendarControlsState[K]
  ) => setControls((prev) => ({ ...prev, [key]: value }));

  // Paint Mode Tools
  const handleClearGrid = useCallback(() => {
    setData((prev) => prev.map((d) => ({ ...d, count: 0 })));
  }, []);

  const handleResetGrid = useCallback(() => {
    setData(originalData);
  }, [originalData]);

  const handleCopyPaintedCode = useCallback(async () => {
    try {
      const activeDataOnly = data.filter((d) => d.count > 0);
      const code = JSON.stringify(activeDataOnly, null, 2);
      await navigator.clipboard.writeText(code);
      alert("Painted data array copied to clipboard! (Showing cells with count > 0)");
    } catch {
      alert("Failed to copy. Please copy from the console.");
      console.log(data);
    }
  }, [data]);

  const handleCellClick = useCallback((clickedDay: ContributionDay) => {
    if (controls.paintMode) {
      setData((prevData) =>
        prevData.map((d) => {
          if (d.date === clickedDay.date) {
            // Cycle: 0 -> 2 -> 5 -> 9 -> 14 -> 0
            let nextCount = 0;
            if (d.count === 0) nextCount = 2;
            else if (d.count <= 2) nextCount = 5;
            else if (d.count <= 5) nextCount = 9;
            else if (d.count <= 9) nextCount = 14;
            else nextCount = 0;
            return { ...d, count: nextCount };
          }
          return d;
        })
      );
    }
  }, [controls.paintMode]);


  // ── Filter data based on timeRange ────────────────────────────────────────
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
  const stats = useMemo(() => ({
    total:   getTotalContributions(filteredData),
    longest: getLongestStreak(filteredData),
    current: getCurrentStreak(filteredData),
    active:  filteredData.filter((d) => d.count > 0).length,
  }), [filteredData]);

  const dayOfWeekStats = useMemo(() => {
    const counts = [0, 0, 0, 0, 0, 0, 0];
    const names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    filteredData.forEach((day) => {
      if (day.count > 0) {
        const d = new Date(day.date + "T00:00:00");
        counts[d.getDay()] += day.count;
      }
    });
    const total = counts.reduce((a, b) => a + b, 0);
    const maxVal = Math.max(...counts, 1);
    return counts.map((count, i) => ({
      name: names[i],
      count,
      percentOfMax: Math.round((count / maxVal) * 100),
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }));
  }, [filteredData]);

  const monthlyStats = useMemo(() => {
    const counts = Array(12).fill(0);
    const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    filteredData.forEach((day) => {
      if (day.count > 0) {
        const d = new Date(day.date + "T00:00:00");
        counts[d.getMonth()] += day.count;
      }
    });
    const total = counts.reduce((a, b) => a + b, 0);
    const maxVal = Math.max(...counts, 1);
    return counts.map((count, i) => ({
      name: names[i],
      count,
      percentOfMax: Math.round((count / maxVal) * 100),
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    })).filter(item => item.count > 0);
  }, [filteredData]);

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
            {/* GitHub username input */}
            <GitHubInput
              username={activeUser}
              isReal={isReal}
              onLoad={handleGitHubLoad}
            />
          </div>

          <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-900 p-5">
            <ContributionGrid
              data={filteredData}
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
              onCellClick={controls.paintMode ? handleCellClick : undefined}
            />

            {controls.paintMode && (
              <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-zinc-800/80 pt-4 animate-in fade-in slide-in-from-top-1 duration-200">
                <p className="text-xs text-zinc-400 font-medium">Paint Mode Tools:</p>
                <button
                  type="button"
                  onClick={handleClearGrid}
                  className="rounded border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 text-xs text-zinc-200 cursor-pointer transition-colors"
                >
                  Clear Grid
                </button>
                <button
                  type="button"
                  onClick={handleResetGrid}
                  className="rounded border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 text-xs text-zinc-200 cursor-pointer transition-colors"
                >
                  Reset Grid
                </button>
                <button
                  type="button"
                  onClick={handleCopyPaintedCode}
                  className="rounded border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 text-xs text-zinc-200 cursor-pointer flex items-center gap-1 transition-colors"
                >
                  <Copy className="h-3 w-3" />
                  Copy Mock Code
                </button>
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-[13px] text-zinc-400">
                <span className="font-medium text-zinc-300">
                  {stats.total.toLocaleString()}
                </span>{" "}
                contributions in the{" "}
                {controls.timeRange === "1-year"
                  ? "last year"
                  : controls.timeRange === "6-months"
                    ? "last 6 months"
                    : "last 3 months"}
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

        {/* ── 5. ANALYTICS INSIGHTS ─────────────────────────────────── */}
        <section aria-labelledby="analytics-label" className="space-y-3">
          <SectionLabel id="analytics-label">Analytics Insights</SectionLabel>
          <AnalyticsPanel dayOfWeekStats={dayOfWeekStats} monthlyStats={monthlyStats} />
        </section>

        {/* ── 6. README PROFILE EMBED ───────────────────────────────── */}
        <section aria-labelledby="embed-label" className="space-y-3">
          <SectionLabel id="embed-label">Profile Embed Code Generator</SectionLabel>
          <EmbedGenerator username={activeUser} />
        </section>

        <Separator className="bg-zinc-800" />

        {/* ── 7. USAGE ──────────────────────────────────────────────── */}
        <section aria-labelledby="usage-label" className="space-y-3">
          <SectionLabel id="usage-label">Usage Instructions</SectionLabel>
          <CodeBlock />
        </section>

        <Separator className="bg-zinc-800" />

        {/* ── 8. PROPS REFERENCE ────────────────────────────────────── */}
        <section aria-labelledby="props-label" className="space-y-3">
          <SectionLabel id="props-label">Props API Reference</SectionLabel>
          <PropsTable />
        </section>

      </div>
    </div>
  );
}
