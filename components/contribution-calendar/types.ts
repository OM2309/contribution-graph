import type { ContributionDay } from "@/lib/contribution-data";

export type CellShape = "square" | "circle" | "rounded";
export type WeekStart = "sun" | "mon";
export type ColorScheme = "green" | "blue" | "purple" | "orange" | "pink" | "dracula" | "halloween";

export interface ContributionCalendarProps {
  /** Array of date + count objects — required */
  data: ContributionDay[];
  /** GitHub username to display in the header */
  githubUsername?: string;
  /** Preset color theme name */
  colorScheme?: ColorScheme;
  /** Custom 5-stop color array: [empty, level1, level2, level3, level4] */
  colors?: [string, string, string, string, string];
  /** Cell width/height in px */
  cellSize?: number;
  /** Gap between cells in px */
  cellGap?: number;
  /** Shape of each cell */
  cellShape?: CellShape;
  /** Show hover tooltip with date + count */
  showTooltip?: boolean;
  /** Show month labels above the grid */
  showMonthLabels?: boolean;
  /** Show day-of-week labels on the left */
  showDayLabels?: boolean;
  /** First day of week */
  weekStart?: WeekStart;
  /** Click handler for each cell */
  onCellClick?: (day: ContributionDay) => void;
  /** Staggered scale-in animation via Motion */
  animate?: boolean;
  /** Time range to display in the grid */
  timeRange?: "3-months" | "6-months" | "1-year";
}

export interface CalendarControlsState {
  colorScheme: ColorScheme;
  cellShape: CellShape;
  cellSize: number;
  cellGap: number;
  showTooltip: boolean;
  showMonthLabels: boolean;
  showDayLabels: boolean;
  weekStart: WeekStart;
  animate: boolean;
  timeRange: "3-months" | "6-months" | "1-year";
  paintMode: boolean;
}

