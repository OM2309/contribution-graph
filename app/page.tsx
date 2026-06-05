import { fetchGitHubContributions } from "@/lib/github-api";
import { generateContributionData } from "@/lib/contribution-data";
import { CalendarPage } from "@/components/contribution-calendar/calendar-page";

/**
 * Server component — tries to fetch real GitHub data for om2309.
 * Falls back to generated mock data if GITHUB_TOKEN is absent.
 */
export default async function Home() {
  const githubData = await fetchGitHubContributions("om2309");
  const data = githubData ?? generateContributionData();
  const isReal = githubData !== null;

  return <CalendarPage initialData={data} isRealData={isReal} githubUsername="om2309" />;
}
