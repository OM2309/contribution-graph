import type { ContributionDay } from "@/lib/contribution-data";
import type { CellShape, ColorScheme, WeekStart } from "@/components/ui/github-calendar";

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
}
