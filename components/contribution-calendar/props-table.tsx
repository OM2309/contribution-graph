import React from "react";
import { cn } from "@/lib/utils";

interface PropRow {
  prop: string;
  type: string;
  defaultVal: string;
  description: string;
}

const PROPS: PropRow[] = [
  {
    prop: "username",
    type: "string",
    defaultVal: "required",
    description: "GitHub username to fetch and display contributions for — required",
  },
  {
    prop: "colorScheme",
    type: '"green" | "blue" | "purple" | "orange" | "pink" | "dracula" | "halloween"',
    defaultVal: '"blue"',
    description: "Preset theme palette for the levels",
  },
  {
    prop: "colors",
    type: "[string, string, string, string, string]",
    defaultVal: "—",
    description: "Custom 5-stop color array override [empty, level1, level2, level3, level4]",
  },
  {
    prop: "cellSize",
    type: "number",
    defaultVal: "16",
    description: "Width and height of each grid cell in pixels",
  },
  {
    prop: "cellGap",
    type: "number",
    defaultVal: "4",
    description: "Spacing between grid cells in pixels",
  },
  {
    prop: "cellShape",
    type: '"square" | "circle" | "rounded"',
    defaultVal: '"circle"',
    description: "Shape styling for each contribution cell",
  },
  {
    prop: "showTooltip",
    type: "boolean",
    defaultVal: "true",
    description: "Toggle displaying the hover information tooltip",
  },
  {
    prop: "showMonthLabels",
    type: "boolean",
    defaultVal: "true",
    description: "Toggle showing month names above columns",
  },
  {
    prop: "showDayLabels",
    type: "boolean",
    defaultVal: "true",
    description: "Toggle showing day of week labels on the left (Mon, Wed, Fri)",
  },
  {
    prop: "weekStart",
    type: '"sun" | "mon"',
    defaultVal: '"sun"',
    description: "Determines which day of the week to start the columns on",
  },
  {
    prop: "animate",
    type: "boolean",
    defaultVal: "false",
    description: "Enable staggered mounting scale animation for cells",
  },
  {
    prop: "timeRange",
    type: '"3-months" | "6-months" | "1-year"',
    defaultVal: '"3-months"',
    description: "Adjusts the historical date limit shown in the calendar",
  },
  {
    prop: "onCellClick",
    type: "(day: ContributionDay) => void",
    defaultVal: "—",
    description: "Callback function fired when a cell is clicked",
  },
];

function CodePill({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[11px] text-zinc-300">
      {children}
    </code>
  );
}

export const PropsTable = React.memo(function PropsTable() {
  return (
    <div className="overflow-hidden rounded-lg border border-zinc-800">
      <table className="w-full table-auto border-collapse text-sm" role="table">
        <thead>
          <tr className="border-b border-zinc-800 bg-zinc-900">
            {["Prop", "Type", "Default", "Description"].map((h) => (
              <th
                key={h}
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PROPS.map((row, i) => (
            <tr
              key={row.prop}
              className={cn(
                "border-b border-zinc-800 last:border-0 transition-colors hover:bg-zinc-800/40",
                i % 2 === 0 ? "bg-zinc-900" : "bg-[#111113]"
              )}
            >
              <td className="px-4 py-3 font-mono text-[13px] text-blue-400">
                {row.prop}
              </td>
              <td className="px-4 py-3">
                <CodePill>{row.type}</CodePill>
              </td>
              <td className="px-4 py-3 font-mono text-[13px] text-zinc-400">
                {row.defaultVal === "required" ? (
                  <span className="rounded bg-red-950/60 px-1.5 py-0.5 text-[11px] text-red-400">
                    required
                  </span>
                ) : row.defaultVal === "—" ? (
                  <span className="text-zinc-600">—</span>
                ) : (
                  <CodePill>{row.defaultVal}</CodePill>
                )}
              </td>
              <td className="px-4 py-3 text-zinc-400">{row.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});
