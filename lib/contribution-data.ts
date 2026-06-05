export interface ContributionDay {
  date: string; // ISO date string "YYYY-MM-DD"
  count: number;
}

/**
 * Generates realistic contribution data for the past 52 weeks.
 * Heavy activity Jan–Jun, sparse Jul–Dec to match the design spec.
 */
export function generateContributionData(): ContributionDay[] {
  const days: ContributionDay[] = [];
  const today = new Date();
  // Start from 364 days ago (52 weeks)
  const start = new Date(today);
  start.setDate(today.getDate() - 364);

  for (let i = 0; i <= 364; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);

    const month = date.getMonth(); // 0 = Jan, 11 = Dec
    const dayOfWeek = date.getDay();

    let maxCount = 0;
    // Heavy Jan–Jun (months 0–5), sparse Jul–Dec (months 6–11)
    if (month <= 5) {
      // More active in first half
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      maxCount = isWeekend ? 6 : 14;
    } else {
      // Sparse in second half
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      maxCount = isWeekend ? 3 : 6;
    }

    // Random chance of no activity
    const activityChance = month <= 5 ? 0.72 : 0.38;
    const hasActivity = Math.random() < activityChance;
    const count = hasActivity ? Math.floor(Math.random() * maxCount) + 1 : 0;

    const dateStr = date.toISOString().split("T")[0];
    days.push({ date: dateStr, count });
  }

  return days;
}

/** Returns the contribution level (0–4) for a given count */
export function getContributionLevel(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0) return 0;
  if (count <= 3) return 1;
  if (count <= 6) return 2;
  if (count <= 9) return 3;
  return 4;
}

/** Color maps for each theme preset */
export const COLOR_THEMES: Record<string, [string, string, string, string, string]> = {
  green: ["#27272a", "#166534", "#16a34a", "#22c55e", "#4ade80"],
  blue: ["#27272a", "#1e3a5f", "#1d4ed8", "#3b82f6", "#93c5fd"],
  purple: ["#27272a", "#4a1d96", "#7c3aed", "#a855f7", "#d8b4fe"],
  orange: ["#27272a", "#7c2d12", "#c2410c", "#f97316", "#fdba74"],
  pink: ["#27272a", "#831843", "#be185d", "#ec4899", "#f9a8d4"],
};

/** Total contributions sum */
export function getTotalContributions(data: ContributionDay[]): number {
  return data.reduce((sum, d) => sum + d.count, 0);
}

/** Get longest streak of consecutive active days */
export function getLongestStreak(data: ContributionDay[]): {
  count: number;
  start: string;
  end: string;
} {
  let longest = 0;
  let longestStart = "";
  let longestEnd = "";
  let current = 0;
  let currentStart = "";

  for (const day of data) {
    if (day.count > 0) {
      if (current === 0) currentStart = day.date;
      current++;
      if (current > longest) {
        longest = current;
        longestStart = currentStart;
        longestEnd = day.date;
      }
    } else {
      current = 0;
    }
  }

  return { count: longest, start: longestStart, end: longestEnd };
}

/** Get current streak (trailing active days) */
export function getCurrentStreak(data: ContributionDay[]): number {
  let streak = 0;
  for (let i = data.length - 1; i >= 0; i--) {
    if (data[i].count > 0) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

/** Format date string to "Mon DD" e.g. "Mar 12" */
export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
