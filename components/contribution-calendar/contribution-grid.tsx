"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  COLOR_THEMES,
  getContributionLevel,
  type ContributionDay,
} from "@/lib/contribution-data";
import { cn } from "@/lib/utils";
import type { ContributionCalendarProps } from "./types";

const MONTH_LABELS = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec",
];

// GitHub-style: only Mon / Wed / Fri shown
const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  date: string;
  count: number;
}

function fmtDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

export function ContributionGrid({
  data,
  colorScheme = "green",
  colors,
  cellSize = 14,
  cellGap = 3,
  cellShape = "square",
  showTooltip = true,
  showMonthLabels = true,
  showDayLabels = true,
  weekStart = "sun",
  onCellClick,
  animate = false,
  timeRange = "1-year",
}: ContributionCalendarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false, x: 0, y: 0, date: "", count: 0,
  });

  const palette = colors ?? COLOR_THEMES[colorScheme] ?? COLOR_THEMES.green;

  // ── Filter data based on timeRange ────────────────────────────────────────
  const filteredData = useMemo(() => {
    if (!data || !data.length) return [];

    const latestDate = new Date();
    const thresholdDate = new Date(latestDate);
    if (timeRange === "3-months") {
      thresholdDate.setMonth(thresholdDate.getMonth() - 3);
    } else if (timeRange === "6-months") {
      thresholdDate.setMonth(thresholdDate.getMonth() - 6);
    } else {
      thresholdDate.setFullYear(thresholdDate.getFullYear() - 1);
    }

    const thresholdStr = thresholdDate.toISOString().split("T")[0];
    return data.filter((day) => day.date >= thresholdStr);
  }, [data, timeRange]);

  // ── Build week columns ────────────────────────────────────────────────────
  const weeks = useMemo(() => {
    const grid: (ContributionDay | null)[][] = [];
    if (!filteredData.length) return grid;

    const firstDate = new Date(filteredData[0].date + "T00:00:00");
    const dow = firstDate.getDay();
    const offset = weekStart === "sun" ? dow : (dow + 6) % 7;

    let week: (ContributionDay | null)[] = [];
    for (let i = 0; i < offset; i++) week.push(null);
    for (const day of filteredData) {
      week.push(day);
      if (week.length === 7) { grid.push(week); week = []; }
    }
    if (week.length > 0) {
      while (week.length < 7) week.push(null);
      grid.push(week);
    }
    return grid;
  }, [filteredData, weekStart]);

  // ── Month label positions ─────────────────────────────────────────────────
  const monthPositions = useMemo(() => {
    const positions: { label: string; col: number }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, colIdx) => {
      for (const day of week) {
        if (day) {
          const month = new Date(day.date + "T00:00:00").getMonth();
          if (month !== lastMonth) {
            positions.push({ label: MONTH_LABELS[month], col: colIdx });
            lastMonth = month;
          }
          break;
        }
      }
    });
    return positions;
  }, [weeks]);

  const borderRadius = useMemo(() => {
    if (cellShape === "circle")  return "50%";
    if (cellShape === "rounded") return Math.max(3, Math.floor(cellSize / 3)) + "px";
    return "2px";
  }, [cellShape, cellSize]);

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLDivElement>, day: ContributionDay) => {
      if (!showTooltip || !containerRef.current) return;
      const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
      const cRect = containerRef.current.getBoundingClientRect();
      setTooltip({
        visible: true,
        x: rect.left - cRect.left + cellSize / 2,
        y: rect.top - cRect.top,
        date: day.date,
        count: day.count,
      });
    },
    [showTooltip, cellSize]
  );

  const handleMouseLeave = useCallback(() => {
    setTooltip((t) => ({ ...t, visible: false }));
  }, []);

  const step  = cellSize + cellGap;
  const LEFT  = showDayLabels ? 32 : 0;
  const TOP   = showMonthLabels ? 22 : 0;

  const gridW = weeks.length * step - cellGap;
  const gridH = 7 * step - cellGap;

  return (
    <div
      ref={containerRef}
      className="relative select-none"
      style={{ width: gridW + LEFT, minHeight: gridH + TOP }}
    >
      {/* ── Month labels ───────────────────────────────────────────────── */}
      {showMonthLabels && (
        <div className="absolute top-0" style={{ left: LEFT }}>
          {monthPositions.map(({ label, col }) => (
            <span
              key={`${label}-${col}`}
              className="absolute text-[11px] leading-none text-zinc-500"
              style={{ left: col * step, top: 4 }}
            >
              {label}
            </span>
          ))}
        </div>
      )}

      {/* ── Day-of-week labels ─────────────────────────────────────────── */}
      {showDayLabels && (
        <div
          className="absolute left-0 flex flex-col"
          style={{ top: TOP, width: LEFT - 4 }}
        >
          {DAY_LABELS.map((lbl, i) => (
            <div
              key={i}
              className="flex items-center justify-end pr-1 text-[11px] text-zinc-500"
              style={{ height: cellSize, marginBottom: i < 6 ? cellGap : 0 }}
            >
              {lbl}
            </div>
          ))}
        </div>
      )}

      {/* ── Cell grid ──────────────────────────────────────────────────── */}
      <motion.div
        key={`${animate}-${weeks.length}`}
        className="absolute flex"
        style={{ top: TOP, left: LEFT, gap: cellGap }}
        role="grid"
        aria-label="Contribution activity calendar"
        initial={animate ? { opacity: 0 } : false}
        animate={animate ? { opacity: 1 } : {}}
        transition={{ duration: 0.3 }}
      >
        {weeks.map((week, wi) => (
          <div key={wi} role="row" className="flex flex-col" style={{ gap: cellGap }}>
            {week.map((day, di) => {
              const level = day ? getContributionLevel(day.count) : 0;
              const bg    = palette[level];
              const hasData = day !== null;
              return (
                <motion.div
                  key={di}
                  role="gridcell"
                  aria-label={
                    day
                      ? `${fmtDate(day.date)}: ${day.count} contribution${day.count !== 1 ? "s" : ""}`
                      : undefined
                  }
                  tabIndex={hasData ? 0 : -1}
                  style={{
                    width: cellSize,
                    height: cellSize,
                    backgroundColor: bg,
                    borderRadius,
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                  initial={animate ? { scale: 0, opacity: 0 } : false}
                  animate={animate ? { scale: 1, opacity: 1 } : {}}
                  transition={
                    animate
                      ? { delay: wi * 0.012 + di * 0.004, duration: 0.2, ease: "easeOut" }
                      : {}
                  }
                  whileHover={hasData ? { scale: 1.3, filter: "brightness(1.35)" } : {}}
                  className={cn(
                    "focus:outline-none",
                    hasData && "focus:ring-1 focus:ring-zinc-400 focus:ring-offset-1 focus:ring-offset-zinc-900"
                  )}
                  onMouseEnter={day ? (e) => handleMouseEnter(e, day) : undefined}
                  onMouseLeave={day ? handleMouseLeave : undefined}
                  onClick={day && onCellClick ? () => onCellClick(day) : undefined}
                  onKeyDown={
                    day && onCellClick
                      ? (e) => { if (e.key === "Enter" || e.key === " ") onCellClick(day); }
                      : undefined
                  }
                />
              );
            })}
          </div>
        ))}
      </motion.div>

      {/* ── Tooltip ────────────────────────────────────────────────────── */}
      {showTooltip && tooltip.visible && (
        <div
          role="tooltip"
          className="pointer-events-none absolute z-50 -translate-x-1/2 rounded-md border border-zinc-700 bg-zinc-800/95 px-2.5 py-1.5 text-xs text-zinc-100 whitespace-nowrap backdrop-blur-sm"
          style={{ left: tooltip.x + LEFT, top: tooltip.y + TOP - 44 }}
        >
          <span className="font-semibold text-zinc-50">
            {tooltip.count} contribution{tooltip.count !== 1 ? "s" : ""}
          </span>
          <span className="ml-1.5 text-zinc-400">on {fmtDate(tooltip.date)}</span>
          <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-zinc-700" />
        </div>
      )}
    </div>
  );
}

/** Five-cell legend: Less □□□□□ More */
export function ContributionLegend({
  colors,
  colorScheme = "green",
  cellSize = 11,
}: {
  colors?: [string, string, string, string, string];
  colorScheme?: string;
  cellSize?: number;
}) {
  const palette = colors ?? COLOR_THEMES[colorScheme] ?? COLOR_THEMES.green;
  return (
    <div className="flex items-center gap-1.5" aria-label="Contribution legend">
      <span className="text-[11px] text-zinc-500">Less</span>
      {palette.map((color, i) => (
        <div
          key={i}
          style={{ width: cellSize, height: cellSize, backgroundColor: color, borderRadius: 2 }}
          aria-hidden="true"
        />
      ))}
      <span className="text-[11px] text-zinc-500">More</span>
    </div>
  );
}
