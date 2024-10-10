import dotenv from "dotenv";
import { sleep } from "./utils";
import { Octokit } from "octokit";
import { intro, log } from "@clack/prompts";
import picocolors from "picocolors";

dotenv.config();

const STANDARD_GITHUB_REPOS = [
  // solana labs
  // "https://github.com/solana-labs/solana",
  // "https://github.com/solana-labs/solana-program-library",
  // anza
  "https://github.com/anza-xyz/agave",
  // solana foundation
  // "https://github.com/solana-foundation/solana-improvement-documents",
  // "https://github.com/solana-foundation/developer-content",
  // community repos
  // "https://github.com/coral-xyz/anchor",
];

const accessToken = process.env.GITHUB_ACCESS_TOKEN || null;

// initializing octokit with the user's github auth token will allow us to read their private repos
const octokit = new Octokit({
  auth: accessToken,
});

const dateToStopChecking = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

console.log();
intro(picocolors.bgMagenta(" Solana Changelog "));

log.info("hi");

/**
 * Begin the loop of all standard repos to collect the standard data
 */
for (let i = 0; i < STANDARD_GITHUB_REPOS.length; i++) {
  const [_, owner, repo] = STANDARD_GITHUB_REPOS[i].split(
    /^https?\:\/\/github.com\/([\w-]*)\/([\w-]*)/i,
  );
  const fullRepo = `${owner}/${repo}`;

  console.log("\n-------------------------------------------");
  console.log("[BEGIN]", `Checking ${fullRepo}...`);

  /**
   * get the recent commits on the repo
   */
  try {
    // console.log("[FETCH]", `${fullRepo} commits for ${username}`);
    const commits = await octokit
      .request("GET /repos/{owner}/{repo}/commits", {
        owner,
        repo,
        per_page: 100,
        page: 1,
        since: dateToStopChecking.toISOString(),
      })
      .then(res => res.data);

    console.log("total commits:", commits.length);
  } catch (err) {
    if (err instanceof Error) console.warn("[WARN]", err.message);
    else console.warn("[WARN]", err);
  }

  console.log("[FINISH]", `Checking ${fullRepo}`);

  // no reason to sleep on the very last repo check
  if (i + 1 != STANDARD_GITHUB_REPOS.length) {
    console.log("[DELAY]", "sleep");
    await sleep(5000);
  }
}
