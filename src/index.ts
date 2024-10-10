import {
  intro,
  log,
  text,
  outro,
  isCancel,
  cancel,
  group,
  multiselect,
  note,
  spinner,
} from "@clack/prompts";
import picocolors from "picocolors";
import {
  GITHUB_REGEX_PR_IN_MESSAGE,
  IGNORED_USERNAMES,
  getGitHubRepoCommits,
} from "./lib/github.js";
import { pagedMultiselectCommits } from "./lib/clack.js";

async function main() {
  intro(picocolors.bgMagenta(" Solana Changelog "));

  const spin = spinner();

  // set the initial dates
  let currentDate = new Date();

  let startDate = new Date();
  let stopDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const previousSundayDate = new Date();
  previousSundayDate.setDate(currentDate.getDate() - currentDate.getDay() - 7);

  // const startDateInput = await text({
  //   message: "What is the start date?",
  //   // placeholder: `${startDate.getMonth()}/${startDate.getDate()}/${startDate.getFullYear()}`,
  //   initialValue: startDate.toDateString(),
  //   // validate(value) {
  //   //   console.log("here:", value);
  //   //   new Date(value);
  //   //   // return "ddddd";
  //   //   if (value.length === 0) return `Value is required!`;
  //   //   try {
  //   //   } catch (err) {
  //   //     return `Invalid date!`;
  //   //   }
  //   // },
  // });

  //
  // const inputGroup = await group(
  //   {
  //     startDate: () =>
  //       text({
  //         message: "What is the start date?",
  //         placeholder: "7 days ago",
  //       }),
  //     endDate: () =>
  //       text({ message: "What is the end date?", placeholder: "today" }),
  //     // color: ({ results }) =>
  //     //   multiselect({
  //     //     message: `What is your favorite color ${results.startDate}?`,
  //     //     options: [
  //     //       { value: "red", label: "Red" },
  //     //       { value: "green", label: "Green" },
  //     //       { value: "blue", label: "Blue" },
  //     //     ],
  //     //   }),
  //   },
  //   {
  //     // On Cancel callback that wraps the group
  //     // So if the user cancels one of the prompts in the group this function will be called
  //     onCancel: ({ results }) => {
  //       cancel("Date selection canceled.");
  //       process.exit(0);
  //     },
  //   },
  // );

  // console.log(inputGroup.name, inputGroup.age, inputGroup.color);

  // if (isCancel(inputGroup)) {
  //   cancel("Date selection canceled");
  //   process.exit(0);
  // }

  // parse and check the dates provided

  // console.log("startDateInput:", startDateInput);

  // solana labs
  // const repo = {
  //   owner: "solana-labs",
  //   repo: "solana",
  //   slug: "solana-labs/solana",
  // };

  // anza and agave
  const repo = {
    owner: "anza-xyz",
    repo: "agave",
    slug: "anza-xyz/agave",
  };

  // display a box header at the start of the repo processing
  note(
    `Searching repo: ${picocolors.underline(repo.slug)}\n\n` +
      `from ${picocolors.underline(
        picocolors.underline(startDate.toDateString()),
      )} to ${picocolors.underline(stopDate.toDateString())}`,
    `Repo: ${picocolors.underline(repo.slug)}`,
  );

  spin.start("Loading commits");

  let commits = await getGitHubRepoCommits({
    owner: repo.owner,
    repo: repo.repo,
    since: stopDate,
    until: startDate,
  });

  // prefilter commits to remove undesired ones
  // commits = commits.filter(
  //   commit =>
  //     // remove commits from the undesired usernames (like bots)
  //     !commit.author?.login ||
  //     !IGNORED_USERNAMES.includes(commit.author?.login),
  //   // // removed clippy and dependabot
  //   // (!commit.commit.message.includes("clippy") &&
  //   //   !commit.commit.message.includes("dependabot")),
  // );

  spin.stop(
    `Loaded ${picocolors.underline(
      commits.length,
    )} commits from ${picocolors.underline(repo.slug)}`,
  );

  log.message(
    `- Select commits with the ${picocolors.italic(
      "'space'",
    )} key to learn more about them` +
      "\n" +
      `- Continue to the next page with the ${picocolors.italic(
        "'enter'",
      )} key`,
  );

  const selectedCommits = await pagedMultiselectCommits(commits);

  // console.log(selectedCommits[0]);
  // console.log(selectedCommits);

  // begin filling in the plaintext based content

  // add in the stack exchange rankings link
  let changelog =
    `Some more Solana changes from Nick & Jacob.\n\n` +
    `Subscribe to the newsletter: https://solana.com/newsletter\n\n` +
    `Solana StackExchange weekly rankings:\n` +
    ` - https://stackexchange.com/leagues/714/week/solana/${previousSundayDate
      .toISOString()
      .slice(0, 10)}`;

  changelog += `\n\nSIMD-XX:\n` + ` - tbd\n`;

  changelog += "\nCommits:";
  selectedCommits.map(record => {
    const message = record.commit.message.split("\n")[0].trim();

    const prNum = new RegExp(/\(#(\d+)\)"?$/gim).exec(message)?.[1];
    const title =
      new RegExp(/^(.*) \(#(\d+)\)$/gim).exec(message)?.[1] || message;

    const prUrl = `https://github.com/${repo.owner}/${repo.repo}/pull/${prNum}`;

    changelog += `\n - ${title} - ${prUrl}`;
  });

  changelog += `\n\nResources:\n` + ` - \n`;

  // const commit = commits[0];
  // console.log(commit);

  changelog += `\nFollow us on Twitter: https://x.com/solana_devs\n\n`;

  changelog +=
    `- Nick: https://x.com/nickfrosty\n` +
    `- Jacob:  https://x.com/jacobvcreech\n`;

  changelog +=
    `\n` +
    `If you have a resource you've built or anything that improves the ` +
    `Solana Developer experience, please reach out to us!`;

  // // log.info(commit.commit.message);
  // log.message(
  //   `by ${commit.committer?.name || "[unknown]"} (${
  //     commit.author?.login || "[unknown]"
  //   }) - ${commit.author?.html_url || "[unknown]"}`,
  // );
  // // log.message(`on ${commit.commit.author?.date || "[unknown]"}`);

  // // console.log(commit.commit.url);

  // // commits.map(commit => {
  //   log.info(commit.author?.login || "[unknown]");
  // });

  outro("Changelog complete :)");

  console.log(changelog);
  console.log("\n"); // extra line space
}

// display a spacer at the top
console.log();

main();
