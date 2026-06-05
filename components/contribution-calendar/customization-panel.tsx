"use client";

import React from "react";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import type { CalendarControlsState } from "./types";
import type { CellShape, ColorScheme, WeekStart } from "@/components/ui/github-calendar";

// ── Color swatches ────────────────────────────────────────────────────────────
const COLOR_SWATCHES: { scheme: ColorScheme; color: string; label: string }[] = [
  { scheme: "green",  color: "#22c55e", label: "Green"  },
  { scheme: "blue",   color: "#3b82f6", label: "Blue"   },
  { scheme: "purple", color: "#a855f7", label: "Purple" },
  { scheme: "orange", color: "#f97316", label: "Orange" },
  { scheme: "pink",   color: "#ec4899", label: "Pink"   },
  { scheme: "dracula", color: "#bd93f9", label: "Dracula" },
  { scheme: "halloween", color: "#fa7a18", label: "Halloween" },
];

// ── Cell shapes ───────────────────────────────────────────────────────────────
const CELL_SHAPES: { value: CellShape; label: string }[] = [
  { value: "square",  label: "Square"  },
  { value: "rounded", label: "Rounded" },
  { value: "circle",  label: "Circle"  },
];

// ── Small reusable bits ───────────────────────────────────────────────────────
function ControlLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
      {children}
    </p>
  );
}

function ToggleRow({
  label,
  checked,
  onCheckedChange,
  id,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  id: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-0.5">
      <label htmlFor={id} className="cursor-pointer text-sm text-zinc-300">
        {label}
      </label>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

/** Segmented button group (Week Start / Shape) */
function SegmentedGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex overflow-hidden rounded-md border border-zinc-700">
      {options.map((opt, i) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          aria-pressed={value === opt.value}
          className={cn(
            "flex-1 cursor-pointer px-3 py-1.5 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400",
            i > 0 && "border-l border-zinc-700",
            value === opt.value
              ? "bg-zinc-700 text-zinc-50"
              : "bg-transparent text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────
export interface CustomizationPanelProps {
  controls: CalendarControlsState;
  onChange: <K extends keyof CalendarControlsState>(
    key: K,
    value: CalendarControlsState[K]
  ) => void;
}

export function CustomizationPanel({ controls, onChange }: CustomizationPanelProps) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
      <div className="grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-2">

        {/* ── LEFT COLUMN ─────────────────────────────────────────────── */}
        <div className="flex flex-col gap-6">

          {/* Color Theme */}
          <div className="flex flex-col gap-3">
            <ControlLabel>Color Theme</ControlLabel>
            <div className="flex items-center gap-3" role="radiogroup" aria-label="Color theme">
              {COLOR_SWATCHES.map(({ scheme, color, label }) => (
                <button
                  key={scheme}
                  type="button"
                  role="radio"
                  aria-checked={controls.colorScheme === scheme}
                  aria-label={`${label} theme`}
                  onClick={() => onChange("colorScheme", scheme)}
                  className={cn(
                    "h-7 w-7 cursor-pointer rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900",
                    controls.colorScheme === scheme
                      ? "ring-2 ring-white ring-offset-2 ring-offset-zinc-900 scale-110"
                      : "hover:scale-110 opacity-80 hover:opacity-100"
                  )}
                  style={{ backgroundColor: color }}
                >
                  <span className="sr-only">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Cell Shape */}
          <div className="flex flex-col gap-3">
            <ControlLabel>Cell Shape</ControlLabel>
            <SegmentedGroup
              options={CELL_SHAPES}
              value={controls.cellShape}
              onChange={(v) => onChange("cellShape", v)}
            />
          </div>

          {/* Cell Size */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <ControlLabel>Cell Size</ControlLabel>
              <span className="rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 font-mono text-xs text-zinc-300">
                {controls.cellSize}px
              </span>
            </div>
            <Slider
              min={10}
              max={18}
              value={[controls.cellSize]}
              onValueChange={(v) => onChange("cellSize", (Array.isArray(v) ? v[0] : v) as number)}
              aria-label="Cell size"
            />
          </div>

          {/* Gap Size */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <ControlLabel>Gap Size</ControlLabel>
              <span className="rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 font-mono text-xs text-zinc-300">
                {controls.cellGap}px
              </span>
            </div>
            <Slider
              min={2}
              max={6}
              value={[controls.cellGap]}
              onValueChange={(v) => onChange("cellGap", (Array.isArray(v) ? v[0] : v) as number)}
              aria-label="Gap size"
            />
          </div>

          {/* Time Range */}
          <div className="flex flex-col gap-3">
            <ControlLabel>Time Range</ControlLabel>
            <SegmentedGroup
              options={[
                { value: "1-year", label: "1 Year" },
                { value: "6-months", label: "6 Months" },
                { value: "3-months", label: "3 Months" },
              ]}
              value={controls.timeRange}
              onChange={(v) => onChange("timeRange", v)}
            />
          </div>
        </div>

        {/* ── RIGHT COLUMN ────────────────────────────────────────────── */}
        <div className="flex flex-col gap-5">
          <ToggleRow
            id="show-tooltip"
            label="Show Tooltip"
            checked={controls.showTooltip}
            onCheckedChange={(v) => onChange("showTooltip", v)}
          />

          <ToggleRow
            id="show-month-labels"
            label="Show Month Labels"
            checked={controls.showMonthLabels}
            onCheckedChange={(v) => onChange("showMonthLabels", v)}
          />

          <ToggleRow
            id="show-day-labels"
            label="Show Day Labels"
            checked={controls.showDayLabels}
            onCheckedChange={(v) => onChange("showDayLabels", v)}
          />

          {/* Week Start */}
          <div className="flex flex-col gap-2.5">
            <ControlLabel>Week Start</ControlLabel>
            <SegmentedGroup
              options={[
                { value: "sun" as WeekStart, label: "Sun" },
                { value: "mon" as WeekStart, label: "Mon" },
              ]}
              value={controls.weekStart}
              onChange={(v) => onChange("weekStart", v)}
            />
          </div>

          <ToggleRow
            id="animate"
            label="Staggered Animation"
            checked={controls.animate}
            onCheckedChange={(v) => onChange("animate", v)}
          />
        </div>
      </div>
    </div>
  );
}
