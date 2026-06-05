import { fetchGitHubContributions } from "@/lib/github-api";
import { generateContributionData } from "@/lib/contribution-data";
import { CalendarPage } from "@/components/contribution-calendar/calendar-page";

/**
 * Server component — fetches initial contribution data for om2309.
 */
export default async function Home() {
  const githubData = await fetchGitHubContributions("om2309");
  const data = githubData ?? generateContributionData();

  return <CalendarPage initialData={data} githubUsername="om2309" />;
}
