import dotenv from "dotenv";
import { Octokit } from "octokit";

// load the env variables
dotenv.config();

/**
 * GitHub api client (via Octokit)
 */
export const github = new Octokit({
  auth: process.env.GITHUB_ACCESS_TOKEN || null,
});

/**
 *
 */
export const IGNORED_USERNAMES = [
  // comment for better diffs
  "dependabot[bot]",
];

export const GITHUB_REGEX_PR_IN_MESSAGE = /(^.*\(\#\d+\))/gi;

export const GITHUB_REGEX_REPO_FROM_URL =
  /^https?\:\/\/github.com\/([\w-]*)\/([\w-]*)/i;

/**
 * Split a GitHub repo url into the `owner` and repo's name
 */
export function splitGithubRepoUrlToNames(url: string) {
  const [_, owner, repo] = url.split(GITHUB_REGEX_REPO_FROM_URL);

  return {
    owner,
    repo,
  };
}

/**
 *
 */
export async function getGitHubRepoCommits({
  owner,
  repo,
  since,
  perPage = 100,
  page = 1,
  until = new Date(),
}: {
  owner: string;
  repo: string;
  since?: Date;
  until?: Date;
  perPage?: number;
  page?: number;
}) {
  return github
    .request("GET /repos/{owner}/{repo}/commits", {
      owner,
      repo,
      page: page,
      per_page: perPage,
      until: until?.toISOString() || undefined,
      since: since?.toISOString() || undefined,
    })
    .then(res => res.data);
}
