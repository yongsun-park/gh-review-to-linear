import { execFile } from "node:child_process";

function exec(cmd, args) {
  return new Promise((resolve, reject) => {
    execFile(cmd, args, { maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`${cmd} failed: ${stderr || error.message}`));
        return;
      }
      resolve(stdout.trim());
    });
  });
}

export async function fetchReviewRequests() {
  const fields = "number,title,url,repository,author";
  const raw = await exec("gh", [
    "search",
    "prs",
    "--review-requested=@me",
    "--state=open",
    `--json=${fields}`,
  ]);

  if (!raw) return [];

  const prs = JSON.parse(raw);
  return prs.map((pr) => ({
    number: pr.number,
    title: pr.title,
    url: pr.url,
    repo: pr.repository?.nameWithOwner ?? pr.repository?.name ?? "unknown",
    author: pr.author?.login ?? "unknown",
  }));
}
