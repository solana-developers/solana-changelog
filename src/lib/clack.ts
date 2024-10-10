import { cancel, isCancel, multiselect } from "@clack/prompts";
import { GITHUB_REGEX_PR_IN_MESSAGE, getGitHubRepoCommits } from "./github.js";

/**
 *
 */
export const CLI_MULTISELECT_BATCH_SIZE = 10;

export async function pagedMultiselectCommits(
  commits: Awaited<ReturnType<typeof getGitHubRepoCommits>>,
) {
  // initialize the final results to be returned
  let final: typeof commits = [];

  // process the current commits in batches since the CLI gets mad when there are lots at once
  for (
    let batchPage = 0;
    batchPage <= commits.length / CLI_MULTISELECT_BATCH_SIZE;
    batchPage++
  ) {
    const batchStart = batchPage * CLI_MULTISELECT_BATCH_SIZE;

    // accept the selectable input from the user
    const input = await multiselect({
      message: `Select desired commits to include (page ${
        batchPage + 1
      } of ${Math.ceil(commits.length / CLI_MULTISELECT_BATCH_SIZE)}):`,
      required: false,
      options: commits
        .slice(batchStart, batchStart + CLI_MULTISELECT_BATCH_SIZE)
        .map((commit, id) => {
          return {
            value: id,
            label:
              commit.commit.message
                .trim()
                .split(GITHUB_REGEX_PR_IN_MESSAGE)[1] +
              ` - by ${commit.author?.login || "[unknown]"}`,
          };
        }),
    });

    if (isCancel(input)) {
      cancel("Selection canceled");
      process.exit(0);
    }

    // add each of the current selection to the final selection
    input.map(id => {
      if (typeof id != "number") return;
      final.push(commits[id + batchStart]);
    });
  }

  return final;
}
