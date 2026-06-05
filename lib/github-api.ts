import type { ContributionDay } from "./contribution-data";

/**
 * Fetches real contribution data from the GitHub GraphQL API.
 *
 * Requires a GitHub personal access token with `read:user` scope
 * set as GITHUB_TOKEN in your environment variables.
 *
 * Falls back to mock data if the token is missing or the request fails.
 */
async function fetchFromCommunityAPI(username: string): Promise<ContributionDay[] | null> {
  try {
    const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${username}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const contributions = json?.contributions;
    if (!Array.isArray(contributions)) return null;
    return contributions.map((day: any) => ({
      date: day.date,
      count: day.count,
    }));
  } catch {
    return null;
  }
}

export async function fetchGitHubContributions(
  username: string
): Promise<ContributionDay[] | null> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return fetchFromCommunityAPI(username);
  }

  const query = `
    query($login: String!) {
      user(login: $login) {
        contributionsCollection {
          contributionCalendar {
            weeks {
              contributionDays {
                date
                contributionCount
              }
            }
          }
        }
      }
    }
  `;

  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query, variables: { login: username } }),
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return fetchFromCommunityAPI(username);
    }

    const json = await res.json();
    const weeks =
      json?.data?.user?.contributionsCollection?.contributionCalendar?.weeks;
    if (!weeks) {
      return fetchFromCommunityAPI(username);
    }

    const days: ContributionDay[] = [];
    for (const week of weeks) {
      for (const day of week.contributionDays) {
        days.push({ date: day.date, count: day.contributionCount });
      }
    }
    return days;
  } catch {
    return fetchFromCommunityAPI(username);
  }
}

