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
    prop: "data",
    type: "ContributionDay[]",
    defaultVal: "required",
    description: "Array of { date: string, count: number } objects",
  },
  {
    prop: "githubUsername",
    type: "string",
    defaultVal: "—",
    description: 'GitHub username — fetches real data, e.g. "om2309"',
  },
  {
    prop: "colorScheme",
    type: "green | blue | purple | orange | pink",
    defaultVal: '"green"',
    description: "Preset color theme",
  },
  {
    prop: "colors",
    type: "string[5]",
    defaultVal: "—",
    description: "Override with a custom 5-stop color array",
  },
  {
    prop: "cellSize",
    type: "number",
    defaultVal: "14",
    description: "Cell width/height in px (10 – 18)",
  },
  {
    prop: "cellGap",
    type: "number",
    defaultVal: "3",
    description: "Gap between cells in px (2 – 6)",
  },
  {
    prop: "cellShape",
    type: "square | circle | rounded",
    defaultVal: '"square"',
    description: "Shape of each contribution cell",
  },
  {
    prop: "showTooltip",
    type: "boolean",
    defaultVal: "true",
    description: "Show hover tooltip with date + count",
  },
  {
    prop: "showMonthLabels",
    type: "boolean",
    defaultVal: "true",
    description: "Show month labels above the grid",
  },
  {
    prop: "showDayLabels",
    type: "boolean",
    defaultVal: "true",
    description: "Show Mon / Wed / Fri labels on the left",
  },
  {
    prop: "weekStart",
    type: "sun | mon",
    defaultVal: '"sun"',
    description: "First day of week",
  },
  {
    prop: "onCellClick",
    type: "(day: ContributionDay) => void",
    defaultVal: "—",
    description: "Callback fired when a cell is clicked",
  },
  {
    prop: "animate",
    type: "boolean",
    defaultVal: "false",
    description: "Staggered scale-in animation on mount (Motion)",
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
